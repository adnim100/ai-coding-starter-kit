import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { cancelTranscriptionJob } from '@/lib/queue'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId } = await params

    // Verify job ownership
    const { data: job, error } = await supabase
      .from('transcription_jobs')
      .select(`
        id,
        status,
        projects!inner (user_id)
      `)
      .eq('id', jobId)
      .eq('projects.user_id', session.user.id)
      .single()

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.status !== 'QUEUED' && job.status !== 'PROCESSING') {
      return NextResponse.json(
        { error: 'Job cannot be cancelled in current state' },
        { status: 400 }
      )
    }

    // Cancel job in queue
    await cancelTranscriptionJob(jobId)

    // Update job status
    const { error: updateError } = await supabase
      .from('transcription_jobs')
      .update({
        status: 'CANCELLED',
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update job status' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Job cancelled successfully',
    })
  } catch (error) {
    console.error('Cancel job error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel job' },
      { status: 500 }
    )
  }
}
