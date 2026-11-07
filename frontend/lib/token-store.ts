// Token store - uses sessionStorage (not localStorage)
// sessionStorage clears when tab closes, but persists during page refreshes
// Token is verified with backend on page load via /auth/me
const TOKEN_KEY = 'SOCIANTRA_JWT'

export const tokenStore = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null
    try {
      const stored = sessionStorage.getItem(TOKEN_KEY)
      if (stored && stored !== 'null' && stored !== 'undefined' && stored.trim() !== '') {
        return stored
      }
      return null
    } catch (error) {
      return null
    }
  },
  set: (newToken: string | null): void => {
    if (typeof window === 'undefined') return
    try {
      if (newToken) {
        sessionStorage.setItem(TOKEN_KEY, newToken)
      } else {
        sessionStorage.removeItem(TOKEN_KEY)
      }
    } catch (error) {
      // Failed to write token
    }
  },
  clear: (): void => {
    if (typeof window === 'undefined') return
    try {
      sessionStorage.removeItem(TOKEN_KEY)
    } catch (error) {
      // Failed to clear token
    }
  },
}

