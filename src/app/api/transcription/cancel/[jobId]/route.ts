import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cancelTranscriptionJob } from '@/lib/queue'

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jobId = params.jobId

    // Verify job ownership
    const job = await prisma.transcriptionJob.findFirst({
      where: {
        id: jobId,
        project: {
          userId: session.user.id,
        },
      },
    })

    if (!job) {
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
    await prisma.transcriptionJob.update({
      where: { id: jobId },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
      },
    })

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
