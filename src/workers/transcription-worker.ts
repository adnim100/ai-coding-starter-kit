import { Worker, Job } from 'bullmq'
import { redisConnection, TranscriptionJobData, TranscriptionJobResult } from '../lib/queue'
import { getProvider } from '../lib/transcription'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Create worker
const worker = new Worker<TranscriptionJobData, TranscriptionJobResult>(
  'transcription',
  async (job: Job<TranscriptionJobData>) => {
    const startTime = Date.now()

    try {
      console.log(`[Worker] Processing job ${job.id} for provider ${job.data.provider}`)

      // Update job status in database
      await prisma.transcriptionJob.update({
        where: { id: job.data.jobId },
        data: {
          status: 'PROCESSING',
          startedAt: new Date(),
        },
      })

      // Get provider
      const provider = getProvider(job.data.provider)
      if (!provider) {
        throw new Error(`Provider ${job.data.provider} not found`)
      }

      // Start transcription
      await job.updateProgress(10)
      const transcriptionJob = await provider.transcribe(
        job.data.audioUrl,
        job.data.config,
        job.data.apiKey
      )

      await job.updateProgress(30)

      // Poll for completion (for async providers)
      let attempts = 0
      const maxAttempts = 120 // 10 minutes max (5s * 120)
      let status = transcriptionJob.status

      while (status === 'processing' && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait 5 seconds

        const statusUpdate = await provider.getJobStatus(
          transcriptionJob.externalJobId || transcriptionJob.id,
          job.data.apiKey
        )

        status = statusUpdate.status
        attempts++

        const progress = 30 + (attempts / maxAttempts) * 60
        await job.updateProgress(Math.min(progress, 90))
      }

      if (status !== 'completed') {
        throw new Error(`Transcription failed or timed out. Status: ${status}`)
      }

      // Get transcript
      await job.updateProgress(95)
      const transcript = await provider.getTranscript(
        transcriptionJob.externalJobId || transcriptionJob.id,
        job.data.apiKey
      )

      const processingTimeMs = Date.now() - startTime

      // Save transcript to database
      await prisma.transcript.create({
        data: {
          jobId: job.data.jobId,
          fullText: transcript.fullText,
          language: transcript.language,
          confidence: transcript.confidence,
          wordCount: transcript.fullText.split(/\s+/).length,
          segments: {
            create: transcript.segments.map((segment) => ({
              text: segment.text,
              startTime: segment.startTime,
              endTime: segment.endTime,
              confidence: segment.confidence,
              speaker: segment.speaker,
              sequenceNumber: segment.sequenceNumber,
              words: segment.words ? JSON.stringify(segment.words) : undefined,
            })),
          },
        },
      })

      // Update job status
      await prisma.transcriptionJob.update({
        where: { id: job.data.jobId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          processingTimeMs,
        },
      })

      // Update project status
      await updateProjectStatus(job.data.projectId)

      await job.updateProgress(100)

      console.log(`[Worker] Completed job ${job.id} in ${processingTimeMs}ms`)

      return {
        success: true,
        transcript,
        processingTimeMs,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[Worker] Failed job ${job.id}:`, errorMessage)

      // Update job status
      await prisma.transcriptionJob.update({
        where: { id: job.data.jobId },
        data: {
          status: 'FAILED',
          errorMessage,
          completedAt: new Date(),
        },
      })

      // Update project status
      await updateProjectStatus(job.data.projectId)

      return {
        success: false,
        error: errorMessage,
      }
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 jobs concurrently
    limiter: {
      max: 10, // Max 10 jobs
      duration: 60000, // per minute
    },
  }
)

/**
 * Update project status based on job statuses
 */
async function updateProjectStatus(projectId: string) {
  const jobs = await prisma.transcriptionJob.findMany({
    where: { projectId },
    select: { status: true },
  })

  if (jobs.length === 0) {
    return
  }

  const statuses = jobs.map((j) => j.status)
  const allCompleted = statuses.every((s) => s === 'COMPLETED')
  const anyFailed = statuses.some((s) => s === 'FAILED')
  const anyProcessing = statuses.some((s) => s === 'PROCESSING' || s === 'QUEUED')

  let projectStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL'

  if (allCompleted) {
    projectStatus = 'COMPLETED'
  } else if (anyProcessing) {
    projectStatus = 'PROCESSING'
  } else if (anyFailed && statuses.some((s) => s === 'COMPLETED')) {
    projectStatus = 'PARTIAL'
  } else if (anyFailed) {
    projectStatus = 'FAILED'
  } else {
    projectStatus = 'PENDING'
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { status: projectStatus },
  })
}

// Event handlers
worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`)
})

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message)
})

worker.on('error', (err) => {
  console.error('[Worker] Worker error:', err)
})

worker.on('ready', () => {
  console.log('[Worker] Worker is ready and waiting for jobs')
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Worker] SIGTERM received, closing worker...')
  await worker.close()
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('[Worker] SIGINT received, closing worker...')
  await worker.close()
  await prisma.$disconnect()
  process.exit(0)
})

console.log('[Worker] Transcription worker started')

export { worker }
