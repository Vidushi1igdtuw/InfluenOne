import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/utils'

export function PoweredByAsi({ className }: { className?: string }) {
  return (
    <a
      href={BRAND.asiOneUrl}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium tracking-wide text-primary hover:bg-primary/10',
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#737373] shadow-[0_0_8px_hsl(0_0%_0%_/_0.35)]" />
      Powered by ASI:One only
    </a>
  )
}
