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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Show nothing if not authenticated (redirect will happen)
  if (!jwt) {
    return null
  }

  return <>{children}</>
}

