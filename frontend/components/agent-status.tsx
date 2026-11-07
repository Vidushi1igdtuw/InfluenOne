'use client'

import { useEffect, useState } from 'react'
import { Radio } from 'lucide-react'
import api from '@/lib/api'
import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/utils'

export function AgentStatus({ className }: { className?: string }) {
  const [live, setLive] = useState<boolean | null>(null)

  useEffect(() => {
    let gone = false
    api
      .get('/api/health')
      .then((res) => {
        if (!gone) setLive(res.data?.status === 'healthy')
      })
      .catch(() => {
        if (!gone) setLive(false)
      })
    return () => {
      gone = true
    }
  }, [])

  return (
    <div className={cn('flex items-center gap-2 text-xs', className)}>
      <Radio className={cn('h-3.5 w-3.5', live ? 'text-neutral-400' : live === false ? 'text-neutral-400' : 'text-muted-foreground')} />
      <span className="font-mono uppercase tracking-widest">
        {live ? `${BRAND.agentName} live` : live === false ? 'Agent offline' : 'Pinging agent…'}
      </span>
    </div>
  )
}
