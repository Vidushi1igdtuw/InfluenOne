'use client'

import { Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { BRAND, PILLARS } from '@/lib/brand'
import { Button } from '@/components/ui/button'
import { AgentStatus } from '@/components/agent-status'
import { PoweredByAsi } from '@/components/brand/powered-by'

export default function AgentPage() {
  const copy = async () => {
    await navigator.clipboard.writeText(BRAND.agentAddress)
    toast.success('Copied agent address')
  }

  return (
    <div className="space-y-6">
      <div className="lab-glass rounded-2xl p-6 sm:p-8">
        <PoweredByAsi />
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Agentverse</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Judges and users can run the full LinkedIn workflow inside ASI:One. Search {BRAND.agentName},
          send a topic or URL, pay with Stripe, and post.
        </p>
        <div className="mt-4">
          <AgentStatus />
        </div>
      </div>

      <div className="lab-glass space-y-3 rounded-2xl p-6 font-mono text-sm">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">agent.address</p>
        <p className="break-all">{BRAND.agentAddress}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={copy} variant="outline" className="rounded-full">
            <Copy className="h-4 w-4" /> Copy
          </Button>
          <a href={BRAND.asiOneUrl} target="_blank" rel="noreferrer">
            <Button className="rounded-full">
              Open ASI:One <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PILLARS.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-muted p-5">
            <h2 className="font-semibold">{p.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{p.copy}</p>
          </div>
        ))}
      </div>

      <ol className="lab-glass space-y-3 rounded-2xl p-6 text-sm">
        <li>1. Open ASI:One and search <strong>{BRAND.agentName}</strong>.</li>
        <li>2. Send a topic or article URL.</li>
        <li>3. Review the ASI:One draft + Innovation Lab graphic.</li>
        <li>4. Complete Stripe via the Payment Protocol card.</li>
        <li>5. Approve to publish on LinkedIn.</li>
      </ol>
    </div>
  )
}
