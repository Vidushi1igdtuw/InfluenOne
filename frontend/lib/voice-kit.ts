export type VoiceKit = {
  tone: string
  audience: string
  cta: string
  avoid: string
}

const KEY = 'influenone_voice_kit'

export const EMPTY_VOICE: VoiceKit = {
  tone: '',
  audience: '',
  cta: '',
  avoid: '',
}

export function loadVoiceKit(): VoiceKit {
  if (typeof window === 'undefined') return EMPTY_VOICE
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY_VOICE
    return { ...EMPTY_VOICE, ...JSON.parse(raw) }
  } catch {
    return EMPTY_VOICE
  }
}

export function saveVoiceKit(kit: VoiceKit) {
  localStorage.setItem(KEY, JSON.stringify(kit))
}

export function voiceKitPrefix(kit: VoiceKit): string {
  const bits = [
    kit.tone && `tone: ${kit.tone}`,
    kit.audience && `audience: ${kit.audience}`,
    kit.cta && `end with CTA: ${kit.cta}`,
    kit.avoid && `never: ${kit.avoid}`,
  ].filter(Boolean)
  if (!bits.length) return ''
  return `[Voice kit — ${bits.join('; ')}]\n\n`
}

export function hasVoiceKit(kit: VoiceKit): boolean {
  return Boolean(kit.tone || kit.audience || kit.cta || kit.avoid)
}
