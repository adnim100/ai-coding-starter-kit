'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

interface AudioTypeSelectorProps {
  value: 'MONO' | 'STEREO'
  onChange: (value: 'MONO' | 'STEREO') => void
}

export function AudioTypeSelector({ value, onChange }: AudioTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Audio Type</Label>
      <RadioGroup value={value} onValueChange={(v) => onChange(v as 'MONO' | 'STEREO')}>
        <Card className="p-4">
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="MONO" id="mono" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="mono" className="font-medium cursor-pointer">
                Mono (Single Channel)
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Single speaker or mixed audio. Best for podcasts, interviews, voiceovers.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="STEREO" id="stereo" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="stereo" className="font-medium cursor-pointer">
                Stereo (Dual Channel)
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Left/right channels or multiple speakers. Best for music, spatial audio,
                multi-speaker recordings.
              </p>
            </div>
          </div>
        </Card>
      </RadioGroup>
    </div>
  )
}
