import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTranscriptionJobStatus } from '@/lib/queue'

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jobId = params.jobId

    // Get job from database
    const job = await prisma.transcriptionJob.findFirst({
      where: {
        id: jobId,
        project: {
          userId: session.user.id,
        },
      },
      include: {
        transcript: {
          select: {
            fullText: true,
            language: true,
            confidence: true,
            wordCount: true,
          },
        },
      },
    })

    if (!job) {
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
      errorMessage: job.errorMessage,
      processingTimeMs: job.processingTimeMs,
      costUsd: job.costUsd,
      queuedAt: job.queuedAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      transcript: job.transcript,
    })
  } catch (error) {
    console.error('Get job status error:', error)
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    )
  }
}
