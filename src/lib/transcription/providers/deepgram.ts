import { createClient, PrerecordedSchema } from '@deepgram/sdk'
import {
  TranscriptionProvider,
  TranscriptionConfig,
  TranscriptionJob,
  UnifiedTranscript,
} from '../base'

export class DeepgramProvider extends TranscriptionProvider {
  readonly name = 'Deepgram'
  readonly supportedFeatures = {
    diarization: true,
    timestamps: true,
    confidence: true,
    languages: ['auto', 'en', 'de', 'es', 'fr', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'ko', 'zh'],
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const deepgram = createClient(apiKey)
      // Test with a small request
      await deepgram.manage.getProjectBalance('test')
      return true
    } catch (error: any) {
      // If we get a 401/403, key is invalid
      // If we get 404 (project not found), key is valid but project doesn't exist
      return error?.status !== 401 && error?.status !== 403
    }
  }

  async transcribe(
    audioUrl: string,
    config: TranscriptionConfig,
    apiKey: string
  ): Promise<TranscriptionJob> {
    try {
      const deepgram = createClient(apiKey)

      const options: PrerecordedSchema = {
        model: 'nova-2',
        language: config.language === 'auto' ? undefined : config.language,
        punctuate: true,
        diarize: config.enableDiarization,
        smart_format: true,
        utterances: true,
      }

      const { result } = await deepgram.listen.prerecorded.transcribeUrl(
        { url: audioUrl },
        options
      )

      // Deepgram returns results immediately (synchronous)
      return {
        id: Date.now().toString(),
        provider: this.name,
        status: 'completed',
        externalJobId: result.metadata?.request_id,
      }
    } catch (error) {
      this.handleError(error, 'transcribe')
    }
  }

  async getJobStatus(jobId: string, apiKey: string): Promise<TranscriptionJob> {
    // Deepgram is synchronous, so job is always completed
    return {
      id: jobId,
      provider: this.name,
      status: 'completed',
    }
  }

  async cancelJob(jobId: string, apiKey: string): Promise<void> {
    // Cannot cancel - Deepgram is synchronous
    throw new Error('Deepgram does not support job cancellation')
  }

  async getTranscript(jobId: string, apiKey: string): Promise<UnifiedTranscript> {
    // This would need to be stored after transcribe() call
    // For now, return error - implement proper storage
    throw new Error('Transcript retrieval not implemented - store result after transcribe()')
  }
}
