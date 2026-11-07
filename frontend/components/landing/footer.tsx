'use client'

import Link from 'next/link'
import { BrandMark } from '@/components/brand/mark'
import { BRAND } from '@/lib/brand'

export function LandingFooter() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row">
        <BrandMark />
        <div className="flex flex-wrap justify-center gap-5 text-sm text-muted-foreground">
          <Link href="/tech-stack" className="hover:text-foreground">Tech</Link>
          <Link href="/agent" className="hover:text-foreground">Agentverse</Link>
          <a href={BRAND.hackpackUrl} target="_blank" rel="noreferrer" className="hover:text-foreground">
            Hackpack
          </a>
          <a href={BRAND.asiOneUrl} target="_blank" rel="noreferrer" className="hover:text-foreground">
            ASI:One
          </a>
        </div>
      </div>
      <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {BRAND.lab} · {BRAND.event} · Powered by ASI:One
      </p>
    </footer>
  )
}
