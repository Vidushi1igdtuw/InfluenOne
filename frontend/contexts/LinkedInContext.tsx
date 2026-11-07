'use client'

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { toast } from 'sonner'
import api from '@/lib/api'

interface LinkedInProfile {
  name?: string
  picture?: string
  email?: string
  sub?: string
}

interface LinkedInContextType {
  connected: boolean
  checking: boolean
  profile: LinkedInProfile | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  checkStatus: () => Promise<void>
}

const LinkedInContext = createContext<LinkedInContextType | null>(null)

export function LinkedInProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [checking, setChecking] = useState(true)
  const [profile, setProfile] = useState<LinkedInProfile | null>(null)

  const checkStatus = useCallback(async () => {
    try {
      setChecking(true)
      const { data } = await api.get('/linkedin/status')
      
      // Handle both snake_case (backend) and camelCase (frontend)
      const isConnected = data.is_connected ?? data.isConnected ?? false
      const profileData = data.profile || null
      
      setConnected(isConnected)
      setProfile(profileData)
    } catch (error: any) {
      // Silent fail - don't show error to user
    } finally {
      setChecking(false)
    }
  }, [])

  const connect = useCallback(async () => {
    try {
      const { data } = await api.get('/linkedin/connect')
      
      // Try both camelCase and snake_case
      const authUrl = data?.authUrl || data?.auth_url
      if (authUrl) {
        window.location.href = authUrl
      } else {
        toast.error(data?.error || 'Failed to get LinkedIn auth URL')
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.response?.data?.message || e.message || 'Connection failed')
    }
  }, [])

  const disconnect = useCallback(async () => {
    try {
      await api.post('/linkedin/disconnect')
      setConnected(false)
      setProfile(null)
      toast.success('LinkedIn account disconnected')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e.message || 'Failed to disconnect')
    }
  }, [])

  useEffect(() => {
    // Handle OAuth callback redirect from backend
    const params = new URLSearchParams(window.location.search)
    const linkedinStatus = params.get('linkedin')

    if (linkedinStatus === 'connected') {
      toast.success('LinkedIn connected!')
      window.history.replaceState({}, document.title, window.location.pathname)
      
      // Wait a bit for backend to save the connection, then check status
      // Use a small delay to ensure backend has processed the callback
      setTimeout(() => {
        checkStatus()
      }, 1000) // 1 second delay
      
      // Also check again after a longer delay to ensure we get the profile
      setTimeout(() => {
        checkStatus()
      }, 3000) // 3 seconds delay
    } else if (linkedinStatus === 'error') {
      const message = params.get('message')
      toast.error(message || 'LinkedIn connection failed')
      window.history.replaceState({}, document.title, window.location.pathname)
      checkStatus()
    } else {
      // Initial check on mount
      checkStatus()
    }
  }, [checkStatus])

  const value = useMemo(
    () => ({ connected, checking, profile, connect, disconnect, checkStatus }),
    [connected, checking, profile, connect, disconnect, checkStatus]
  )

  return (
    <LinkedInContext.Provider value={value}>{children}</LinkedInContext.Provider>
  )
}

export function useLinkedIn() {
  const context = useContext(LinkedInContext)
  if (!context) {
    throw new Error('useLinkedIn must be used within LinkedInProvider')
  }
  return context
}

