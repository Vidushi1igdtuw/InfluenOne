'use client'

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import api from '@/lib/api'
import { tokenStore } from '@/lib/token-store'

interface UserProfile {
  id?: string
  name?: string
  email?: string
  picture?: string
}

interface AuthContextType {
  jwt: string | null
  loading: boolean
  user: UserProfile | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  fetchUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [jwt, setJwt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true) // Start with loading=true for initial check
  const [user, setUser] = useState<UserProfile | null>(null)
  const router = useRouter()

  const fetchUserProfile = useCallback(async () => {
    if (!jwt) {
      setUser(null)
      return
    }
    
    try {
      // Fetch user from backend API
      const { data } = await api.get('/auth/me')
      if (data && data.success && data.user) {
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          picture: data.user.picture,
        })
      } else if (data && data.user) {
        // Handle case where success field might be missing
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          picture: data.user.picture,
        })
      }
    } catch (error: any) {
      // If unauthorized, clear token
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        tokenStore.clear()
        setJwt(null)
        setUser(null)
      }
    }
  }, [jwt])

  // Handle Supabase hash-based redirect (email confirmation, password reset, etc.)
  useEffect(() => {
    // Check if URL has hash with access_token (Supabase redirect)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1) // Remove #
      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const type = params.get('type') // 'signup', 'recovery', etc.
      
      if (accessToken) {
        // Store token from Supabase redirect
        tokenStore.set(accessToken)
        setJwt(accessToken)
        
        // Show success message based on type
        if (type === 'signup') {
          toast.success('Email confirmed! Welcome to InfluenOne!')
        } else if (type === 'recovery') {
          toast.success('Password reset link verified!')
        } else {
          toast.success('Authentication successful!')
        }
        
        // Clean up URL - remove hash
        window.history.replaceState({}, document.title, window.location.pathname)
        
        // Fetch user profile
        fetchUserProfile()
      }
    }
  }, [fetchUserProfile])

  // Check authentication status from backend on mount - only once
  // Load token from sessionStorage and verify with backend
  useEffect(() => {
    let mounted = true
    
    const checkAuth = async () => {
      setLoading(true)
      // First, try to get token from sessionStorage
      const savedToken = tokenStore.get()
      if (savedToken) {
        // Set token in state so API interceptor can use it
        setJwt(savedToken)
        
        // Verify token is still valid by fetching user from backend
        try {
          const { data } = await api.get('/auth/me')
          if (mounted) {
            if (data && (data.success || data.user)) {
              // Token is valid, user is authenticated
              setUser({
                id: data.user?.id,
                name: data.user?.name,
                email: data.user?.email,
                picture: data.user?.picture,
              })
            } else {
              // Token is invalid, clear it
              tokenStore.clear()
              setJwt(null)
              setUser(null)
            }
          }
        } catch (error: any) {
          // Token is invalid or expired, clear it
          if (mounted) {
            tokenStore.clear()
            setJwt(null)
            setUser(null)
          }
        }
      } else {
        // No token found, user is not authenticated
        if (mounted) {
          setJwt(null)
          setUser(null)
        }
      }
      
      if (mounted) {
        setLoading(false)
      }
    }
    
    checkAuth()
    
    return () => {
      mounted = false
    }
  }, []) // Only run once on mount

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      
      // Try accessToken first, fallback to token
      const token = data.accessToken || data.token
      if (!token) {
        toast.error('Login failed: No token received')
        return
      }
      
      tokenStore.set(token)
      setJwt(token)
      toast.success('Welcome back!')
      // Fetch user profile
      await fetchUserProfile()
      // Don't auto-redirect - let user stay on current page or navigate manually
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/signup', { name, email, password })
      
      // Check if signup was successful
      if (!data.success) {
        const errorMsg = data.error || data.message || 'Signup failed'
        toast.error(errorMsg)
        return
      }
      
      // Try accessToken first, fallback to token
      const token = data.accessToken || data.token
      
      // If no token but success=true, it means email confirmation is required
      if (!token) {
        const message = data.message || 'Please check your email to confirm your account'
        toast.success(message)
        // Redirect to login page with message
        router.push(`/login?message=${encodeURIComponent(message)}`)
        return
      }
      
      // Token received, store it and proceed
      tokenStore.set(token)
      setJwt(token)
      toast.success('Account created!')
      // Don't auto-redirect - let user navigate manually
    } catch (e: any) {
      const errorMsg = e?.response?.data?.error || e?.response?.data?.message || e.message || 'Signup failed'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    tokenStore.clear()
    setJwt(null)
    setUser(null)
    toast.success('Logged out')
    // Don't auto-redirect - let user stay on current page
  }

  const value = useMemo(
    () => ({ jwt, loading, user, login, signup, logout, fetchUserProfile }),
    [jwt, loading, user, fetchUserProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

