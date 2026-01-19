import { Queue, QueueEvents, Worker, Job } from 'bullmq'
import Redis from 'ioredis'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Redis connection
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
console.log('[Queue] Connecting to Redis:', redisUrl.replace(/:[^:@]+@/, ':****@')) // Log URL with hidden password

const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
})

export interface TranscriptionJobData {
  jobId: string
  projectId: string
  audioFileId: string
  provider: string
  audioUrl: string
  config: {
    language?: string
    enableDiarization?: boolean
    enableTimestamps?: boolean
    modelName?: string
  }
  apiKey: string
  userId: string
}

export interface TranscriptionJobResult {
  success: boolean
  transcript?: {
    fullText: string
    language: string
    confidence?: number
    segments: Array<{
      text: string
      startTime: number
      endTime: number
      confidence?: number
      speaker?: string
      sequenceNumber: number
    }>
  }
  error?: string
  processingTimeMs?: number
  costUsd?: number
}

// Create transcription queue
export const transcriptionQueue = new Queue<TranscriptionJobData, TranscriptionJobResult>(
  'transcription',
  {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        count: 1000, // Keep last 1000 completed jobs
        age: 24 * 3600, // Keep for 24 hours
      },
      removeOnFail: {
        count: 5000, // Keep last 5000 failed jobs
      },
    },
  }
)

// Queue events for monitoring
export const transcriptionQueueEvents = new QueueEvents('transcription', {
  connection,
})

/**
 * Add transcription job to queue
 */
export async function addTranscriptionJob(data: TranscriptionJobData) {
  const job = await transcriptionQueue.add(
    `transcribe-${data.provider}-${data.jobId}`,
    data,
    {
      jobId: data.jobId,
    }
  )

  return job
}

/**
 * Get job status
 */
export async function getTranscriptionJobStatus(jobId: string) {
  const job = await transcriptionQueue.getJob(jobId)
  if (!job) return null

  const state = await job.getState()
  const progress = job.progress

  return {
    id: job.id,
    state,
    progress,
    data: job.data,
    returnvalue: job.returnvalue,
    failedReason: job.failedReason,
    attemptsMade: job.attemptsMade,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
  }
}

/**
 * Cancel transcription job
 */
export async function cancelTranscriptionJob(jobId: string) {
  const job = await transcriptionQueue.getJob(jobId)
  if (!job) return false

  try {
    await job.remove()
    return true
  } catch (error) {
    console.error('Failed to cancel job:', error)
    return false
  }
}

/**
 * Get queue metrics
 */
export async function getQueueMetrics() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    transcriptionQueue.getWaitingCount(),
    transcriptionQueue.getActiveCount(),
    transcriptionQueue.getCompletedCount(),
    transcriptionQueue.getFailedCount(),
    transcriptionQueue.getDelayedCount(),
  ])

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  }
}

/**
 * Clean old jobs from queue
 */
export async function cleanQueue(grace: number = 24 * 3600 * 1000) {
  // grace period in milliseconds (default: 24 hours)
  const cleaned = await transcriptionQueue.clean(grace, 1000)
  return cleaned
}

// Export connection for worker
export { connection as redisConnection }
