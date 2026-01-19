'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle, XCircle, Clock, Users, Zap } from 'lucide-react'

interface Provider {
  key: string
  name: string
  hasApiKey: boolean
  supportedFeatures: {
    diarization: boolean
    timestamps: boolean
    confidence: boolean
    languages: string[]
  }
  estimatedCost?: string
  processingSpeed?: 'fast' | 'medium' | 'slow'
}

interface ProviderGridProps {
  providers: Provider[]
  selectedProviders: string[]
  onSelectionChange: (providers: string[]) => void
  onApiKeySetup?: (provider: string) => void
}

export function ProviderGrid({
  providers,
  selectedProviders,
  onSelectionChange,
  onApiKeySetup,
}: ProviderGridProps) {
  const toggleProvider = (providerKey: string, hasApiKey: boolean) => {
    if (!hasApiKey && onApiKeySetup) {
      onApiKeySetup(providerKey)
      return
    }

    if (selectedProviders.includes(providerKey)) {
      onSelectionChange(selectedProviders.filter((p) => p !== providerKey))
    } else {
      onSelectionChange([...selectedProviders, providerKey])
    }
  }

  const getSpeedBadge = (speed?: string) => {
    const config = {
      fast: { color: 'bg-green-100 text-green-700', label: 'Fast' },
      medium: { color: 'bg-yellow-100 text-yellow-700', label: 'Medium' },
      slow: { color: 'bg-red-100 text-red-700', label: 'Slow' },
    }
    const item = config[speed as keyof typeof config] || config.medium
    return <Badge className={item.color}>{item.label}</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Select Providers</h3>
          <p className="text-sm text-gray-500">
            Choose up to 9 providers to compare transcription quality
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {selectedProviders.length} / 9 selected
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((provider) => {
          const isSelected = selectedProviders.includes(provider.key)
          const canSelect = provider.hasApiKey

          return (
            <Card
              key={provider.key}
              className={`p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'ring-2 ring-primary bg-primary/5'
                  : canSelect
                  ? 'hover:shadow-md'
                  : 'opacity-60'
              }`}
              onClick={() => toggleProvider(provider.key, canSelect)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium">{provider.name}</h4>
                  {provider.processingSpeed && (
                    <div className="mt-1">{getSpeedBadge(provider.processingSpeed)}</div>
                  )}
                </div>
                <div>
                  {canSelect ? (
                    <Checkbox checked={isSelected} />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>

              {/* API Key Status */}
              {!canSelect && (
                <div className="mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      onApiKeySetup?.(provider.key)
                    }}
                  >
                    Setup API Key
                  </Button>
                </div>
              )}

              {/* Features */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {provider.supportedFeatures.diarization ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300" />
                  )}
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Speaker Diarization</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  {provider.supportedFeatures.timestamps ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300" />
                  )}
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Timestamps</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  {provider.supportedFeatures.confidence ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300" />
                  )}
                  <Zap className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Confidence Scores</span>
                </div>
              </div>

              {/* Languages */}
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">
                  {provider.supportedFeatures.languages.length} languages supported
                </p>
              </div>

              {/* Estimated Cost */}
              {provider.estimatedCost && (
                <div className="mt-2 text-xs text-gray-600">
                  Est. cost: {provider.estimatedCost}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
