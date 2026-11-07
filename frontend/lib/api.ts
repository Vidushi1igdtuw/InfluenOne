import axios from 'axios'
import { tokenStore } from './token-store'

// Get API base URL
// In production (HTTPS), use Next.js API proxy to avoid Mixed Content errors
// In development, use backend directly
function getApiBaseUrl(): string {
  // In browser (client-side)
  if (typeof window !== 'undefined') {
    // Production (HTTPS) - use proxy to avoid Mixed Content
    if (window.location.protocol === 'https:') {
      return '/api/proxy'
    }
    // Development - use backend directly
    return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8023'
  }
  
  // Server-side - use backend directly
  return process.env.NEXT_PUBLIC_API_BASE || process.env.BACKEND_URL || 'http://localhost:8023'
}

const api = axios.create({ 
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 360000, // 360 seconds (6 minutes) timeout for image generation
})

api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    // Don't set Authorization header if token is invalid
    delete config.headers.Authorization
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

export default api

