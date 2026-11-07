'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EMPTY_VOICE, loadVoiceKit, saveVoiceKit, type VoiceKit } from '@/lib/voice-kit'

export default function VoicePage() {
  const [kit, setKit] = useState<VoiceKit>(EMPTY_VOICE)

  useEffect(() => {
    setKit(loadVoiceKit())
  }, [])

  const save = () => {
    saveVoiceKit(kit)
    toast.success('Voice kit saved — Studio will use it on generate')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#3D8BD3]">ASI:One only</p>
        <h1 className="text-3xl font-semibold tracking-tight">Voice kit</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ASI:One writes in this voice on every generate. No other model. Kept on this device.
        </p>
      </div>

      <div className="lab-glass space-y-4 rounded-2xl p-6">
        <Field label="Tone" id="tone">
          <Input
            id="tone"
            value={kit.tone}
            onChange={(e) => setKit({ ...kit, tone: e.target.value })}
            placeholder="Direct, founder, no fluff"
          />
        </Field>
        <Field label="Audience" id="audience">
          <Input
            id="audience"
            value={kit.audience}
            onChange={(e) => setKit({ ...kit, audience: e.target.value })}
            placeholder="Operators building on Fetch.ai / ASI:One"
          />
        </Field>
        <Field label="Close with this CTA" id="cta">
          <Input
            id="cta"
            value={kit.cta}
            onChange={(e) => setKit({ ...kit, cta: e.target.value })}
            placeholder="Comment “agent” if you want the playbook"
          />
        </Field>
        <Field label="Never say" id="avoid">
          <Textarea
            id="avoid"
            value={kit.avoid}
            onChange={(e) => setKit({ ...kit, avoid: e.target.value })}
            placeholder="hustle, 10x, delulu, other LLMs"
          />
        </Field>
        <div className="flex gap-2">
          <Button className="rounded-full" onClick={save}>Save kit</Button>
          <Link href="/ai">
            <Button variant="outline" className="rounded-full">Open Studio</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}
