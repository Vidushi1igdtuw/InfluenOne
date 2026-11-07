'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useAuth } from './AuthContext'
import api from '@/lib/api'
import { toast } from 'sonner'

interface SlackConnection {
  team_id: string
  team_name: string
  connected_at: string
}

interface SlackContextType {
  connected: boolean
  checking: boolean
  connection: SlackConnection | null
  connect: () => void
  disconnect: () => Promise<void>
  refreshStatus: () => Promise<void>
}

const SlackContext = createContext<SlackContextType | undefined>(undefined)

export function SlackProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [connected, setConnected] = useState(false)
  const [checking, setChecking] = useState(true)
  const [connection, setConnection] = useState<SlackConnection | null>(null)

  const checkStatus = useCallback(async () => {
    if (!user) {
      setChecking(false)
      return
    }

    try {
      const response = await api.get('/slack/status')
      if (response.data.is_connected) {
        setConnected(true)
        setConnection({
          team_id: response.data.team_id || '',
          team_name: response.data.team_name || '',
          connected_at: response.data.connected_at || '',
        })
      } else {
        setConnected(false)
        setConnection(null)
      }
    } catch (error) {
      setConnected(false)
      setConnection(null)
    } finally {
      setChecking(false)
    }
  }, [user])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  useEffect(() => {
    // Handle OAuth callback
    const params = new URLSearchParams(window.location.search)
    const slackStatus = params.get('slack')
    
    if (slackStatus === 'connected') {
      toast.success('Slack connected successfully!')
      // Refresh status after connection
      setTimeout(() => {
        checkStatus()
      }, 1000)
      // Remove query params
      window.history.replaceState({}, '', window.location.pathname)
    } else if (slackStatus === 'error') {
      const message = params.get('message')
      toast.error(message || 'Slack connection failed')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [checkStatus])

  const connect = useCallback(() => {
    if (!user) return
    
    api.get('/slack/connect')
      .then(response => {
        const authUrl = response.data.auth_url || response.data.authUrl
        if (authUrl) {
          window.location.href = authUrl
        } else {
          toast.error('Failed to get Slack OAuth URL')
        }
      })
      .catch((error: any) => {
        console.error('Failed to get Slack OAuth URL:', error)
        toast.error(error?.response?.data?.error || 'Failed to connect Slack')
      })
  }, [user])

  const disconnect = useCallback(async () => {
    try {
      await api.post('/slack/disconnect')
      setConnected(false)
      setConnection(null)
      toast.success('Slack disconnected successfully')
    } catch (error: any) {
      console.error('Failed to disconnect Slack:', error)
      toast.error(error?.response?.data?.error || 'Failed to disconnect Slack')
      // Still clear local state even if API call fails
      setConnected(false)
      setConnection(null)
    }
  }, [])

  const refreshStatus = async () => {
    setChecking(true)
    await checkStatus()
  }

  return (
    <SlackContext.Provider
      value={{
        connected,
        checking,
        connection,
        connect,
        disconnect,
        refreshStatus,
      }}
    >
      {children}
    </SlackContext.Provider>
  )
}

export function useSlack() {
  const context = useContext(SlackContext)
  if (context === undefined) {
    throw new Error('useSlack must be used within a SlackProvider')
  }
  return context
}

