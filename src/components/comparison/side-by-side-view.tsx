'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, User, Zap, CheckCircle } from 'lucide-react'

interface Transcript {
  id: string
  provider: string
  fullText: string
  language: string
  confidence?: number
  wordCount: number
  processingTimeMs: number
  segments: Array<{
    text: string
    startTime: number
    endTime: number
    confidence?: number
    speaker?: string
  }>
}

interface SideBySideViewProps {
  transcripts: Transcript[]
  audioUrl: string
  onTimestampClick?: (time: number) => void
}

export function SideBySideView({
  transcripts,
  audioUrl,
  onTimestampClick,
}: SideBySideViewProps) {
  const [selectedTime, setSelectedTime] = useState<number | null>(null)

  const handleTimestampClick = (time: number) => {
    setSelectedTime(time)
    onTimestampClick?.(time)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      OPENAI_WHISPER: 'bg-blue-100 text-blue-700',
      ASSEMBLYAI: 'bg-purple-100 text-purple-700',
      DEEPGRAM: 'bg-green-100 text-green-700',
      GOOGLE_SPEECH: 'bg-red-100 text-red-700',
      AWS_TRANSCRIBE: 'bg-orange-100 text-orange-700',
      ELEVENLABS: 'bg-indigo-100 text-indigo-700',
      GLADIA: 'bg-pink-100 text-pink-700',
      SPEECHMATICS: 'bg-cyan-100 text-cyan-700',
      OPENROUTER: 'bg-yellow-100 text-yellow-700',
    }
    return colors[provider] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-4">
      {/* Audio Player */}
      <Card className="p-4">
        <audio src={audioUrl} controls className="w-full" />
      </Card>

      {/* Grid of Transcripts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transcripts.map((transcript) => (
          <Card key={transcript.id} className="flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-4 border-b space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={getProviderColor(transcript.provider)}>
                  {transcript.provider.replace(/_/g, ' ')}
                </Badge>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-3 h-3" />
                  {(transcript.processingTimeMs / 1000).toFixed(1)}s
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Zap className="w-3 h-3" />
                  {transcript.confidence
                    ? `${(transcript.confidence * 100).toFixed(0)}%`
                    : 'N/A'}
                </div>
              </div>

              <div className="text-xs text-gray-500">
                {transcript.wordCount} words • {transcript.language}
              </div>
            </div>

            {/* Transcript Content */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {transcript.segments.map((segment, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedTime !== null &&
                      selectedTime >= segment.startTime &&
                      selectedTime <= segment.endTime
                        ? 'bg-primary/10'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleTimestampClick(segment.startTime)}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-gray-500 font-mono mt-0.5">
                        {formatTime(segment.startTime)}
                      </span>
                      {segment.speaker && (
                        <Badge variant="outline" className="text-xs">
                          <User className="w-2 h-2 mr-1" />
                          {segment.speaker}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm mt-1">{segment.text}</p>
                    {segment.confidence && (
                      <div className="mt-1 text-xs text-gray-400">
                        {(segment.confidence * 100).toFixed(0)}% confidence
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        ))}
      </div>
    </div>
  )
}
