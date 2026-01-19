import {
  TranscriptionProvider,
  TranscriptionConfig,
  TranscriptionJob,
  UnifiedTranscript,
} from '../base'

export class SpeechmaticsProvider extends TranscriptionProvider {
  readonly name = 'Speechmatics'
  readonly supportedFeatures = {
    diarization: true,
    timestamps: true,
    confidence: true,
    languages: ['auto', 'en', 'de', 'es', 'fr', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'ko', 'zh'],
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://asr.api.speechmatics.com/v2/jobs', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      })
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
      // Fetch audio file
      const audioResponse = await fetch(audioUrl)
      if (!audioResponse.ok) {
        throw new Error('Failed to fetch audio file')
      }

      const audioBlob = await audioResponse.blob()
      const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' })

      // Create form data
      const formData = new FormData()
      formData.append('data_file', audioFile)

      const configJson = {
        type: 'transcription',
        transcription_config: {
          language: config.language === 'auto' ? 'en' : config.language,
          enable_entities: true,
          diarization: config.enableDiarization ? 'speaker' : 'none',
          max_speakers: config.enableDiarization ? 4 : undefined,
        },
      }

      formData.append('config', JSON.stringify(configJson))

      // Submit job
      const response = await fetch('https://asr.api.speechmatics.com/v2/jobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Speechmatics API error: ${error.detail || response.statusText}`)
      }

      const result = await response.json()

      return {
        id: Date.now().toString(),
        provider: this.name,
        status: 'processing',
        externalJobId: result.id,
      }
    } catch (error) {
      this.handleError(error, 'transcribe')
    }
  }

  async getJobStatus(jobId: string, apiKey: string): Promise<TranscriptionJob> {
    try {
      const response = await fetch(
        `https://asr.api.speechmatics.com/v2/jobs/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Speechmatics API error: ${response.statusText}`)
      }

      const result = await response.json()

      let status: TranscriptionJob['status']
      switch (result.job.status) {
        case 'running':
        case 'waiting':
          status = 'processing'
          break
        case 'done':
          status = 'completed'
          break
        case 'rejected':
        case 'expired':
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
    try {
      const response = await fetch(
        `https://asr.api.speechmatics.com/v2/jobs/${jobId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to cancel job: ${response.statusText}`)
      }
    } catch (error) {
      this.handleError(error, 'cancelJob')
    }
  }

  async getTranscript(jobId: string, apiKey: string): Promise<UnifiedTranscript> {
    try {
      const response = await fetch(
        `https://asr.api.speechmatics.com/v2/jobs/${jobId}/transcript?format=json-v2`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Speechmatics API error: ${response.statusText}`)
      }

      const result = await response.json()

      const segments = result.results?.map((item: any, index: number) => ({
        text: item.alternatives?.[0]?.content || '',
        startTime: item.start_time,
        endTime: item.end_time,
        confidence: item.alternatives?.[0]?.confidence,
        speaker: item.alternatives?.[0]?.speaker,
        sequenceNumber: index,
      })) || []

      const fullText = segments.map((s: any) => s.text).join(' ')
      return {
        provider: this.name,
        status: 'completed',
        fullText,
        wordCount: fullText.split(/\s+/).filter(Boolean).length,
        segments,
        language: result.metadata?.language || 'en',
      }
    } catch (error) {
      this.handleError(error, 'getTranscript')
    }
  }
}
