'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { LabAtmosphere } from '@/components/brand/atmosphere'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col md:flex-row">
      <LabAtmosphere />
      <AppSidebar />
      <main className="relative z-10 flex-1 w-full max-w-full overflow-auto pt-[56px] sm:pt-[64px] md:pt-0 p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
