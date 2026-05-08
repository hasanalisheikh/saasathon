"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"

type Tone = "friendly" | "professional" | "firm"

interface TonePickerProps {
  value: Tone
  onChange: (tone: Tone) => void
  className?: string
}

const TONES: Tone[] = ["friendly", "professional", "firm"]

function TonePicker({ value, onChange, className }: TonePickerProps) {
  return (
    <div data-slot="tone-picker" className={cn("flex gap-1", className)}>
      {TONES.map((t) => (
        <Button
          key={t}
          type="button"
          variant={value === t ? "default" : "outline"}
          size="xs"
          onClick={() => onChange(t)}
          className="capitalize"
        >
          {t}
        </Button>
      ))}
    </div>
  )
}

export { TonePicker, TONES }
export type { Tone, TonePickerProps }
