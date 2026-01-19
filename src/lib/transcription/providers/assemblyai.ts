import { AssemblyAI } from 'assemblyai'
import {
  TranscriptionProvider,
  TranscriptionConfig,
  TranscriptionJob,
  UnifiedTranscript,
} from '../base'

export class AssemblyAIProvider extends TranscriptionProvider {
  readonly name = 'AssemblyAI'
  readonly supportedFeatures = {
    diarization: true,
    timestamps: true,
    confidence: true,
    languages: ['auto', 'en', 'de', 'es', 'fr', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'ko', 'zh'],
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const client = new AssemblyAI({ apiKey })
      // Test with account info request
      await client.transcripts.list({ limit: 1 })
      return true
    } catch (error) {
      return false
    }
  }

  async transcribe(
    audioUrl: string,
    config: TranscriptionConfig,
    apiKey: string
  ): Promise<TranscriptionJob> {
    try {
      const client = new AssemblyAI({ apiKey })

      const transcript = await client.transcripts.submit({
        audio_url: audioUrl,
        language_code: config.language === 'auto' ? undefined : config.language,
        speaker_labels: config.enableDiarization,
        punctuate: true,
        format_text: true,
      })

      return {
        id: Date.now().toString(),
        provider: this.name,
        status: 'processing',
        externalJobId: transcript.id,
      }
    } catch (error) {
      this.handleError(error, 'transcribe')
    }
  }

  async getJobStatus(jobId: string, apiKey: string): Promise<TranscriptionJob> {
    try {
      const client = new AssemblyAI({ apiKey })
      const transcript = await client.transcripts.get(jobId)

      let status: TranscriptionJob['status']
      switch (transcript.status) {
        case 'queued':
          status = 'processing'
          break
        case 'processing':
          status = 'processing'
          break
        case 'completed':
          status = 'completed'
          break
        case 'error':
          status = 'failed'
          break
        default:
          status = 'processing'
      }

      return {
        id: jobId,
        provider: this.name,
        status,
        externalJobId: jobId,
      }
    } catch (error) {
      this.handleError(error, 'getJobStatus')
    }
  }

  async cancelJob(jobId: string, apiKey: string): Promise<void> {
    // AssemblyAI doesn't support job cancellation
    throw new Error('AssemblyAI does not support job cancellation')
  }

  async getTranscript(jobId: string, apiKey: string): Promise<UnifiedTranscript> {
    try {
      const client = new AssemblyAI({ apiKey })
      const transcript = await client.transcripts.get(jobId)

      if (transcript.status !== 'completed') {
        throw new Error(`Transcript not ready. Status: ${transcript.status}`)
      }

      // Build segments
      const segments = transcript.words?.map((word, index) => ({
        text: word.text,
        startTime: word.start / 1000, // Convert ms to seconds
        endTime: word.end / 1000,
        confidence: word.confidence || undefined,
        speaker: word.speaker ? `Speaker ${word.speaker}` : undefined,
        sequenceNumber: index,
      })) || []

      return {
        fullText: transcript.text || '',
        language: transcript.language_code || 'en',
        confidence: transcript.confidence,
        segments,
      }
    } catch (error) {
      this.handleError(error, 'getTranscript')
    }
  }
}
