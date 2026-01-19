import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { getTranscriptionJobStatus } from '@/lib/queue'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId } = await params

    // Get job from database with project ownership check
    const { data: job, error } = await supabase
      .from('transcription_jobs')
      .select(`
        *,
        projects!inner (user_id),
        transcripts (
          full_text,
          language,
          confidence,
          word_count
        )
      `)
      .eq('id', jobId)
      .eq('projects.user_id', session.user.id)
      .single()

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Get queue status if job is still processing
    let queueStatus = null
    if (job.status === 'QUEUED' || job.status === 'PROCESSING') {
      queueStatus = await getTranscriptionJobStatus(jobId)
    }

    return NextResponse.json({
      id: job.id,
      provider: job.provider,
      status: job.status,
      progress: queueStatus?.progress,
      errorMessage: job.error_message,
      processingTimeMs: job.processing_time_ms,
      costUsd: job.cost_usd,
      queuedAt: job.queued_at,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      transcript: job.transcripts?.[0] || null,
    })
  } catch (error) {
    console.error('Get job status error:', error)
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    )
  }
}
