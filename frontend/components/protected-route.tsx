'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { jwt, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !jwt) {
      router.replace('/login')
    }
  }, [jwt, loading, router, mounted])

  // Show loading during initial auth check
  if (!mounted || loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="lab-mesh pointer-events-none absolute inset-0" />
        <Loader2 className="relative z-10 h-8 w-8 animate-spin text-[#5F43F1]" />
      </div>
    )
  }

  // Show nothing if not authenticated (redirect will happen)
  if (!jwt) {
    return null
  }

  return <>{children}</>
}

