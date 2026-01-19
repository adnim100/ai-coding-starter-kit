import {
  TranscriptionProvider,
  TranscriptionConfig,
  TranscriptionJob,
  UnifiedTranscript,
} from '../base'

export class OpenRouterProvider extends TranscriptionProvider {
  readonly name = 'OpenRouter'
  readonly supportedFeatures = {
    diarization: false, // Depends on underlying model
    timestamps: true,
    confidence: false,
    languages: ['auto', 'en', 'de', 'es', 'fr', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'ko', 'zh'],
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // Test with models list request
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      })
      return response.ok
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
      // Fetch audio file
      const audioResponse = await fetch(audioUrl)
      if (!audioResponse.ok) {
        throw new Error('Failed to fetch audio file')
      }

      const audioBlob = await audioResponse.blob()
      const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' })

      // Create form data
      const formData = new FormData()
      formData.append('file', audioFile)
      formData.append('model', config.modelName || 'openai/whisper-large-v3')
      if (config.language && config.language !== 'auto') {
        formData.append('language', config.language)
      }
      formData.append('response_format', config.enableTimestamps ? 'verbose_json' : 'json')

      // Make transcription request
      const response = await fetch('https://openrouter.ai/api/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenRouter API error: ${error.message || response.statusText}`)
      }

      // OpenRouter returns result immediately (proxies to Whisper)
      return {
        id: Date.now().toString(),
        provider: this.name,
        status: 'completed',
        externalJobId: undefined,
      }
    } catch (error) {
      this.handleError(error, 'transcribe')
    }
  }

  async getJobStatus(jobId: string, apiKey: string): Promise<TranscriptionJob> {
    // OpenRouter/Whisper is synchronous
    return {
      id: jobId,
      provider: this.name,
      status: 'completed',
    }
  }

  async cancelJob(jobId: string, apiKey: string): Promise<void> {
    throw new Error('OpenRouter does not support job cancellation')
  }

  async getTranscript(jobId: string, apiKey: string): Promise<UnifiedTranscript> {
    throw new Error('Transcript retrieval not implemented - store result after transcribe()')
  }
}
