// Base interface for all transcription providers

export interface TranscriptionConfig {
  language?: string // "de", "en", "auto"
  enableDiarization?: boolean // Speaker diarization
  enableTimestamps?: boolean // Word/sentence level timestamps
  enableConfidence?: boolean // Confidence scores
  modelName?: string // Provider-specific model selection
}

export interface TranscriptionJob {
  id: string
  provider: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  externalJobId?: string // Provider's job ID
}

export interface TranscriptSegment {
  startTime: number // Seconds
  endTime: number
  text: string
  confidence?: number
  speaker?: string // "Speaker 1", "Speaker 2", etc.
}

export interface UnifiedTranscript {
  provider: string
  status: 'completed' | 'failed'
  fullText: string
  language?: string
  wordCount: number
  avgConfidence?: number
  segments: TranscriptSegment[]
  metadata?: {
    processingTimeMs: number
    costUsd?: number
  }
}

export abstract class TranscriptionProvider {
  abstract readonly name: string
  abstract readonly supportedFeatures: {
    diarization: boolean
    timestamps: boolean
    confidence: boolean
    languages: string[]
  }

  /**
   * Validate API key by making a test request
   */
  abstract validateApiKey(apiKey: string): Promise<boolean>

  /**
   * Start transcription job
   * @param audioUrl - Public URL to audio file
   * @param config - Transcription configuration
   * @param apiKey - User's API key for this provider
   */
  abstract transcribe(
    audioUrl: string,
    config: TranscriptionConfig,
    apiKey: string
  ): Promise<TranscriptionJob>

  /**
   * Get current job status
   */
  abstract getJobStatus(
    jobId: string,
    apiKey: string
  ): Promise<TranscriptionJob>

  /**
   * Cancel running job (if supported)
   */
  abstract cancelJob(jobId: string, apiKey: string): Promise<void>

  /**
   * Retrieve and parse transcript when job is completed
   */
  abstract getTranscript(
    jobId: string,
    apiKey: string
  ): Promise<UnifiedTranscript>

  /**
   * Helper to handle errors consistently
   */
  protected handleError(error: any, context: string): never {
    console.error(`[${this.name}] ${context}:`, error)
    throw new Error(
      `${this.name} error: ${error.message || 'Unknown error'}`
    )
  }
}
