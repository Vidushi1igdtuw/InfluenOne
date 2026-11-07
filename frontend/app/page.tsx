'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LabHome } from '@/components/landing/lab-home'

export default function HomePage() {
  const { jwt, user, fetchUserProfile } = useAuth()

  useEffect(() => {
    if (jwt && !user) {
      fetchUserProfile()
    }
  }, [jwt, user, fetchUserProfile])

  return <LabHome />
}
