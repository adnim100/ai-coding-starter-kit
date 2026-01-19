/**
 * Queue module for transcription jobs
 *
 * This is a simplified version that works without Redis for initial deployment.
 * In production, you would replace this with proper BullMQ + Redis setup.
 */

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

// In-memory job store (for development/MVP)
// In production, replace with Redis + BullMQ
const jobStore = new Map<string, {
  data: TranscriptionJobData
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress?: number
  result?: TranscriptionJobResult
  createdAt: Date
}>()

/**
 * Add transcription job to queue
 */
export async function addTranscriptionJob(data: TranscriptionJobData) {
  jobStore.set(data.jobId, {
    data,
    status: 'queued',
    createdAt: new Date(),
  })

  console.log(`[Queue] Job added: ${data.jobId} for provider ${data.provider}`)

  // In production, this would be processed by a worker
  // For now, we just store it and the status API routes can check it
  return {
    id: data.jobId,
    data,
  }
}

/**
 * Get job status
 */
export async function getTranscriptionJobStatus(jobId: string) {
  const job = jobStore.get(jobId)
  if (!job) return null

  return {
    id: jobId,
    state: job.status,
    progress: job.progress,
    data: job.data,
    returnvalue: job.result,
    failedReason: job.status === 'failed' ? 'Processing failed' : undefined,
    attemptsMade: 1,
    timestamp: job.createdAt.getTime(),
    processedOn: job.status !== 'queued' ? job.createdAt.getTime() : undefined,
    finishedOn: job.status === 'completed' || job.status === 'failed' ? Date.now() : undefined,
  }
}

/**
 * Cancel transcription job
 */
export async function cancelTranscriptionJob(jobId: string) {
  const job = jobStore.get(jobId)
  if (!job) return false

  if (job.status === 'queued' || job.status === 'processing') {
    jobStore.delete(jobId)
    console.log(`[Queue] Job cancelled: ${jobId}`)
    return true
  }

  return false
}

/**
 * Get queue metrics
 */
export async function getQueueMetrics() {
  let waiting = 0
  let active = 0
  let completed = 0
  let failed = 0

  for (const job of jobStore.values()) {
    switch (job.status) {
      case 'queued':
        waiting++
        break
      case 'processing':
        active++
        break
      case 'completed':
        completed++
        break
      case 'failed':
        failed++
        break
    }
  }

  return {
    waiting,
    active,
    completed,
    failed,
    delayed: 0,
    total: waiting + active + completed + failed,
  }
}

/**
 * Clean old jobs from queue
 */
export async function cleanQueue(grace: number = 24 * 3600 * 1000) {
  const now = Date.now()
  const cleaned: string[] = []

  for (const [jobId, job] of jobStore.entries()) {
    if (now - job.createdAt.getTime() > grace) {
      if (job.status === 'completed' || job.status === 'failed') {
        jobStore.delete(jobId)
        cleaned.push(jobId)
      }
    }
  }

  return cleaned
}
