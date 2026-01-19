import OpenAI from 'openai'
import {
  TranscriptionProvider,
  TranscriptionConfig,
  TranscriptionJob,
  UnifiedTranscript,
} from '../base'

export class OpenAIWhisperProvider extends TranscriptionProvider {
  readonly name = 'OpenAI Whisper'
  readonly supportedFeatures = {
    diarization: false, // Whisper doesn't support diarization natively
    timestamps: true,
    confidence: false, // Whisper doesn't return confidence scores
    languages: ['auto', 'en', 'de', 'es', 'fr', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'ko', 'zh'],
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const openai = new OpenAI({ apiKey })
      // Test with models list request
      await openai.models.list()
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
      const openai = new OpenAI({ apiKey })

      // Fetch audio file
      const audioResponse = await fetch(audioUrl)
      if (!audioResponse.ok) {
        throw new Error('Failed to fetch audio file')
      }

      const audioBlob = await audioResponse.blob()
      const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' })

      // Transcribe
      const response = await openai.audio.transcriptions.create({
        file: audioFile,
        model: config.modelName || 'whisper-1',
        language: config.language === 'auto' ? undefined : config.language,
        response_format: config.enableTimestamps ? 'verbose_json' : 'json',
        timestamp_granularities: config.enableTimestamps ? ['segment'] : undefined,
      })

      // OpenAI Whisper returns result immediately (no async job)
      return {
        id: Date.now().toString(), // Generate local ID
        provider: this.name,
        status: 'completed',
        externalJobId: undefined,
      }
    } catch (error) {
      this.handleError(error, 'transcribe')
    }
  }

  async getJobStatus(jobId: string, apiKey: string): Promise<TranscriptionJob> {
    // OpenAI Whisper is synchronous, so job is always completed
    return {
      id: jobId,
      provider: this.name,
      status: 'completed',
    }
  }

  async cancelJob(jobId: string, apiKey: string): Promise<void> {
    // Cannot cancel - Whisper is synchronous
    throw new Error('OpenAI Whisper does not support job cancellation')
  }

  async getTranscript(jobId: string, apiKey: string): Promise<UnifiedTranscript> {
    // This would need to be stored after transcribe() call
    // For now, return error - implement proper storage
    throw new Error('Transcript retrieval not implemented - store result after transcribe()')
  }
}
