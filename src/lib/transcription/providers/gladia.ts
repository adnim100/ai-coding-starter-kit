import {
  TranscriptionProvider,
  TranscriptionConfig,
  TranscriptionJob,
  UnifiedTranscript,
} from '../base'

export class GladiaProvider extends TranscriptionProvider {
  readonly name = 'Gladia'
  readonly supportedFeatures = {
    diarization: true,
    timestamps: true,
    confidence: true,
    languages: ['auto', 'en', 'de', 'es', 'fr', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'ko', 'zh'],
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.gladia.io/v2/pre-recorded', {
        method: 'POST',
        headers: {
          'x-gladia-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: 'https://example.com/test.mp3', // Dummy URL for validation
        }),
      })
      // Even if it fails, if we get a proper error response, the key is valid
      return response.status !== 401 && response.status !== 403
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
      const request = {
        audio_url: audioUrl,
        diarization: config.enableDiarization,
        detect_language: config.language === 'auto',
        language: config.language !== 'auto' ? config.language : undefined,
        enable_code_switching: true,
        subtitles: config.enableTimestamps,
      }

      const response = await fetch('https://api.gladia.io/v2/pre-recorded', {
        method: 'POST',
        headers: {
          'x-gladia-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Gladia API error: ${error.message || response.statusText}`)
      }

      const result = await response.json()

      return {
        id: Date.now().toString(),
        provider: this.name,
        status: 'processing',
        externalJobId: result.result_url || result.id,
      }
    } catch (error) {
      this.handleError(error, 'transcribe')
    }
  }

  async getJobStatus(jobId: string, apiKey: string): Promise<TranscriptionJob> {
    try {
      const response = await fetch(jobId, {
        headers: {
          'x-gladia-key': apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`Gladia API error: ${response.statusText}`)
      }

      const result = await response.json()

      let status: TranscriptionJob['status']
      switch (result.status) {
        case 'queued':
        case 'processing':
          status = 'processing'
          break
        case 'done':
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
    throw new Error('Gladia does not support job cancellation')
  }

  async getTranscript(jobId: string, apiKey: string): Promise<UnifiedTranscript> {
    try {
      const response = await fetch(jobId, {
        headers: {
          'x-gladia-key': apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`Gladia API error: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.status !== 'done') {
        throw new Error(`Transcript not ready. Status: ${result.status}`)
      }

      const segments = result.result?.transcription?.utterances?.map((utterance: any, index: number) => ({
        text: utterance.text,
        startTime: utterance.start,
        endTime: utterance.end,
        confidence: utterance.confidence,
        speaker: utterance.speaker ? `Speaker ${utterance.speaker}` : undefined,
        sequenceNumber: index,
      })) || []

      const fullText = result.result?.transcription?.full_transcript || ''
      return {
        provider: this.name,
        status: 'completed',
        fullText,
        wordCount: fullText.split(/\s+/).filter(Boolean).length,
        segments,
        language: result.result?.language?.language_code || 'en',
        avgConfidence: result.result?.transcription?.confidence,
      }
    } catch (error) {
      this.handleError(error, 'getTranscript')
    }
  }
}
