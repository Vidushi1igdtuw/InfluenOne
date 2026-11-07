import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/utils'

export function PoweredByAsi({ className }: { className?: string }) {
  return (
    <a
      href={BRAND.asiOneUrl}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-[#5F43F1]/40 bg-[#5F43F1]/10 px-3 py-1 text-[11px] font-medium tracking-wide text-primary hover:bg-[#5F43F1]/20',
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#3D8BD3] shadow-[0_0_8px_#3D8BD3]" />
      Powered by ASI:One only
    </a>
  )
}
