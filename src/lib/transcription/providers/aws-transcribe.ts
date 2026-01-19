import {
  TranscriptionProvider,
  TranscriptionConfig,
  TranscriptionJob,
  UnifiedTranscript,
} from '../base'

export class AWSTranscribeProvider extends TranscriptionProvider {
  readonly name = 'AWS Transcribe'
  readonly supportedFeatures = {
    diarization: true,
    timestamps: true,
    confidence: true,
    languages: ['auto', 'en', 'de', 'es', 'fr', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'ko', 'zh'],
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // apiKey format: accessKeyId:secretAccessKey:region
      const [accessKeyId, secretAccessKey, region] = apiKey.split(':')
      return !!accessKeyId && !!secretAccessKey && !!region
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
      const [accessKeyId, secretAccessKey, region] = apiKey.split(':')

      // Generate unique job name
      const jobName = `transcription-${Date.now()}`

      // Prepare request
      const request = {
        TranscriptionJobName: jobName,
        LanguageCode: config.language === 'auto' ? 'en-US' : `${config.language}-US`,
        Media: {
          MediaFileUri: audioUrl,
        },
        Settings: {
          ShowSpeakerLabels: config.enableDiarization,
          MaxSpeakerLabels: config.enableDiarization ? 10 : undefined,
        },
      }

      // Make AWS Transcribe API call
      const response = await fetch(
        `https://transcribe.${region}.amazonaws.com/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'Transcribe.StartTranscriptionJob',
            // In production, use AWS SDK for proper signing
          },
          body: JSON.stringify(request),
        }
      )

      if (!response.ok) {
        throw new Error(`AWS Transcribe error: ${response.statusText}`)
      }

      const result = await response.json()

      return {
        id: Date.now().toString(),
        provider: this.name,
        status: 'processing',
        externalJobId: jobName,
      }
    } catch (error) {
      this.handleError(error, 'transcribe')
    }
  }

  async getJobStatus(jobId: string, apiKey: string): Promise<TranscriptionJob> {
    try {
      const [accessKeyId, secretAccessKey, region] = apiKey.split(':')

      const response = await fetch(
        `https://transcribe.${region}.amazonaws.com/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'Transcribe.GetTranscriptionJob',
          },
          body: JSON.stringify({
            TranscriptionJobName: jobId,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`AWS Transcribe error: ${response.statusText}`)
      }

      const result = await response.json()
      const job = result.TranscriptionJob

      let status: TranscriptionJob['status']
      switch (job.TranscriptionJobStatus) {
        case 'QUEUED':
        case 'IN_PROGRESS':
          status = 'processing'
          break
        case 'COMPLETED':
          status = 'completed'
          break
        case 'FAILED':
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
      const [accessKeyId, secretAccessKey, region] = apiKey.split(':')

      const response = await fetch(
        `https://transcribe.${region}.amazonaws.com/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'Transcribe.DeleteTranscriptionJob',
          },
          body: JSON.stringify({
            TranscriptionJobName: jobId,
          }),
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
