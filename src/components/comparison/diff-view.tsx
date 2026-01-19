'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { diffWords } from 'diff'

interface Transcript {
  id: string
  provider: string
  fullText: string
  language: string
  confidence?: number
}

interface DiffViewProps {
  transcripts: Transcript[]
}

export function DiffView({ transcripts }: DiffViewProps) {
  const [leftProvider, setLeftProvider] = useState(transcripts[0]?.id || '')
  const [rightProvider, setRightProvider] = useState(transcripts[1]?.id || '')

  const leftTranscript = transcripts.find((t) => t.id === leftProvider)
  const rightTranscript = transcripts.find((t) => t.id === rightProvider)

  // Calculate diff
  const diff = useMemo(() => {
    if (!leftTranscript || !rightTranscript) return []

    return diffWords(leftTranscript.fullText, rightTranscript.fullText)
  }, [leftTranscript, rightTranscript])

  const stats = useMemo(() => {
    const added = diff.filter((d) => d.added).reduce((acc, d) => acc + d.count!, 0)
    const removed = diff.filter((d) => d.removed).reduce((acc, d) => acc + d.count!, 0)
    const unchanged = diff.filter((d) => !d.added && !d.removed).reduce((acc, d) => acc + d.count!, 0)
    const total = added + removed + unchanged

    return {
      added,
      removed,
      unchanged,
      total,
      similarity: total > 0 ? ((unchanged / total) * 100).toFixed(1) : '0',
    }
  }, [diff])

  return (
    <div className="space-y-4">
      {/* Provider Selection */}
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Left Provider</label>
            <Select value={leftProvider} onValueChange={setLeftProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transcripts.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.provider.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Right Provider</label>
            <Select value={rightProvider} onValueChange={setRightProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transcripts.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.provider.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-200 rounded" />
            <span className="text-sm">Added: {stats.added} words</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-200 rounded" />
            <span className="text-sm">Removed: {stats.removed} words</span>
          </div>
          <div className="flex-1" />
          <Badge variant="outline" className="text-sm">
            {stats.similarity}% Similar
          </Badge>
        </div>
      </Card>

      {/* Diff Display */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left Side - Original */}
        <Card>
          <div className="p-4 border-b">
            <h3 className="font-semibold">
              {leftTranscript?.provider.replace(/_/g, ' ')}
            </h3>
            <p className="text-sm text-gray-500">
              {leftTranscript?.confidence
                ? `${(leftTranscript.confidence * 100).toFixed(0)}% confidence`
                : 'No confidence data'}
            </p>
          </div>
          <ScrollArea className="h-[600px] p-4">
            <div className="space-y-1 text-sm leading-relaxed">
              {diff.map((part, idx) => (
                <span
                  key={idx}
                  className={
                    part.removed
                      ? 'bg-red-100 text-red-800 px-1 rounded line-through'
                      : !part.added
                      ? ''
                      : 'hidden'
                  }
                >
                  {part.value}
                </span>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Right Side - Modified */}
        <Card>
          <div className="p-4 border-b">
            <h3 className="font-semibold">
              {rightTranscript?.provider.replace(/_/g, ' ')}
            </h3>
            <p className="text-sm text-gray-500">
              {rightTranscript?.confidence
                ? `${(rightTranscript.confidence * 100).toFixed(0)}% confidence`
                : 'No confidence data'}
            </p>
          </div>
          <ScrollArea className="h-[600px] p-4">
            <div className="space-y-1 text-sm leading-relaxed">
              {diff.map((part, idx) => (
                <span
                  key={idx}
                  className={
                    part.added
                      ? 'bg-green-100 text-green-800 px-1 rounded'
                      : !part.removed
                      ? ''
                      : 'hidden'
                  }
                >
                  {part.value}
                </span>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Legend */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Legend</h4>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded line-through">
              Text
            </span>
            <span className="text-gray-600">
              Only in {leftTranscript?.provider.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Text</span>
            <span className="text-gray-600">
              Only in {rightTranscript?.provider.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1">Text</span>
            <span className="text-gray-600">Same in both</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
