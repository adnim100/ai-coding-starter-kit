import {
  TranscriptionProvider,
  TranscriptionConfig,
  TranscriptionJob,
  UnifiedTranscript,
} from '../base'

export class ElevenLabsProvider extends TranscriptionProvider {
  readonly name = 'ElevenLabs'
  readonly supportedFeatures = {
    diarization: false,
    timestamps: true,
    confidence: false,
    languages: ['auto', 'en', 'de', 'es', 'fr', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'ko', 'zh'],
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: {
          'xi-api-key': apiKey,
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
      const formData = new FormData()
      formData.append('audio', audioBlob, 'audio.mp3')

      if (config.language && config.language !== 'auto') {
        formData.append('language', config.language)
      }

      // ElevenLabs Speech-to-Text API
      const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`ElevenLabs API error: ${error.detail || response.statusText}`)
      }

      // ElevenLabs returns results immediately
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
    // ElevenLabs is synchronous
    return {
      id: jobId,
      provider: this.name,
      status: 'completed',
    }
  }

  async cancelJob(jobId: string, apiKey: string): Promise<void> {
    throw new Error('ElevenLabs does not support job cancellation')
  }

  async getTranscript(jobId: string, apiKey: string): Promise<UnifiedTranscript> {
    // This would need to be stored after transcribe() call
    // For now, return a placeholder response
    const fullText = ''
    return {
      provider: this.name,
      status: 'completed',
      fullText,
      wordCount: fullText.split(/\s+/).filter(Boolean).length,
      segments: [],
    }
  }
}
