import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BRAND } from '@/lib/brand'

export function BrandMark({
  href = '/',
  compact = false,
  className,
}: {
  href?: string
  compact?: boolean
  className?: string
}) {
  return (
    <Link href={href} className={cn('flex items-center gap-2.5 min-w-0', className)}>
      <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#5F43F1] to-[#3D8BD3] shadow-[0_0_20px_hsl(248_86%_60%_/_0.45)]">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" aria-hidden>
          <path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="2.2" fill="currentColor" />
        </svg>
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold tracking-tight">{BRAND.name}</span>
          <span className="block truncate font-mono text-[10px] uppercase tracking-[0.18em] text-[#3D8BD3]">
            Powered by {BRAND.poweredBy}
          </span>
        </span>
      )}
    </Link>
  )
}
