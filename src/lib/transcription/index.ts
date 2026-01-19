import { TranscriptionProvider } from './base'
import { OpenAIWhisperProvider } from './providers/openai-whisper'
import { AssemblyAIProvider } from './providers/assemblyai'
import { GoogleSpeechProvider } from './providers/google-speech'
import { AWSTranscribeProvider } from './providers/aws-transcribe'
import { ElevenLabsProvider } from './providers/elevenlabs'
import { DeepgramProvider } from './providers/deepgram'
import { GladiaProvider } from './providers/gladia'
import { SpeechmaticsProvider } from './providers/speechmatics'
import { OpenRouterProvider } from './providers/openrouter'

// Provider Registry
export const PROVIDERS: Record<string, TranscriptionProvider> = {
  OPENAI_WHISPER: new OpenAIWhisperProvider(),
  ASSEMBLYAI: new AssemblyAIProvider(),
  GOOGLE_SPEECH: new GoogleSpeechProvider(),
  AWS_TRANSCRIBE: new AWSTranscribeProvider(),
  ELEVENLABS: new ElevenLabsProvider(),
  DEEPGRAM: new DeepgramProvider(),
  GLADIA: new GladiaProvider(),
  SPEECHMATICS: new SpeechmaticsProvider(),
  OPENROUTER: new OpenRouterProvider(),
}

/**
 * Get provider instance by name
 */
export function getProvider(providerName: string): TranscriptionProvider | null {
  return PROVIDERS[providerName] || null
}

/**
 * Get all available provider names
 */
export function getAllProviderNames(): string[] {
  return Object.keys(PROVIDERS)
}

/**
 * Get provider display information
 */
export function getProviderInfo(providerName: string) {
  const provider = PROVIDERS[providerName]
  if (!provider) return null

  return {
    name: provider.name,
    key: providerName,
    supportedFeatures: provider.supportedFeatures,
  }
}

/**
 * Get all providers with their information
 */
export function getAllProvidersInfo() {
  return Object.entries(PROVIDERS).map(([key, provider]) => ({
    name: provider.name,
    key,
    supportedFeatures: provider.supportedFeatures,
  }))
}

// Re-export types
export * from './base'
