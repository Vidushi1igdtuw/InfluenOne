'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import api from '@/lib/api'
import { WEB_PACK_USES } from '@/lib/payments'

interface StripeVerifyResult {
  verified: boolean
  txHash: string | null
  error: string | null
}

interface PaymentContextType {
  hasPaid: boolean
  loading: boolean
  paymentDate: string | null
  txHash: string | null
  amount: string | null
  creditsRemaining: number
  packSize: number
  checkPaymentStatus: () => Promise<void>
  refreshPaymentStatus: () => Promise<void>
  verifyStripeReturn: () => Promise<StripeVerifyResult>
}

const PaymentContext = createContext<PaymentContextType | null>(null)

// Remove stripe_session/service query params after a successful verification so
// refreshing the page doesn't trigger another verification round-trip.
function cleanStripeReturnParams() {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (!url.searchParams.has('stripe_session')) return
  url.searchParams.delete('stripe_session')
  url.searchParams.delete('service')
  window.history.replaceState({}, '', url.toString())
}

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  // Hydrate from localStorage so a page reload / transient API error doesn't re-prompt payment.
  // The backend remains the source of truth and re-verifies credits on every service call.
  const [hasPaid, setHasPaid] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.localStorage.getItem('influenone_has_paid') === 'true'
    } catch {
      return false
    }
  })
  const [loading, setLoading] = useState(true)
  const [paymentDate, setPaymentDate] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [amount, setAmount] = useState<string | null>(null)
  const [creditsRemaining, setCreditsRemaining] = useState(0)
  const [packSize, setPackSize] = useState(WEB_PACK_USES)

  // Monotonic sequence so only the most recently issued status check can write
  // state — a slow in-flight response can never overwrite a fresher result.
  const statusSeq = useRef(0)
  // In-flight Stripe return verification, shared by every caller (provider-level
  // auto-verify + any mounted PaymentModal) so a session is never double-verified.
  const verifyingRef = useRef<Promise<StripeVerifyResult> | null>(null)

  const checkPaymentStatus = useCallback(async () => {
    const seq = ++statusSeq.current
    try {
      setLoading(true)
      const { data } = await api.get('/api/payment/status')

      // A newer check was issued while this one was in flight — drop this
      // stale result instead of overwriting fresh state with it.
      if (seq !== statusSeq.current) return

      // Backend returns has_paid=false together with an error (e.g. "Authentication required")
      // when the request isn't authenticated. Treat that as "unknown", NOT as "not paid",
      // so a transient auth failure right after login doesn't wipe a valid paid state.
      if (data?.error) {
        return
      }

      setHasPaid(Boolean(data.has_paid))
      setPaymentDate(data.payment_date || null)
      setTxHash(data.tx_hash || null)
      setAmount(data.amount || null)
      setCreditsRemaining(Number(data.credits_remaining || 0))
      setPackSize(Number(data.pack_size || WEB_PACK_USES))

      try {
        window.localStorage.setItem('influenone_has_paid', Boolean(data.has_paid) ? 'true' : 'false')
      } catch {
        /* storage unavailable — ignore */
      }
    } catch {
      // Network / 401 errors: KEEP the previous hasPaid state instead of resetting to false.
      // Resetting here caused the payment gate to re-appear for users who already bought a pack.
    } finally {
      if (seq === statusSeq.current) {
        setLoading(false)
      }
    }
  }, [])

  const refreshPaymentStatus = useCallback(async () => {
    await checkPaymentStatus()
  }, [checkPaymentStatus])

  const verifyStripeReturn = useCallback(async (): Promise<StripeVerifyResult> => {
    if (typeof window === 'undefined') {
      return { verified: false, txHash: null, error: null }
    }
    const params = new URLSearchParams(window.location.search)
    const session = params.get('stripe_session')
    if (!session) {
      return { verified: false, txHash: null, error: null }
    }
    // Dedup concurrent callers (provider effect + mounted PaymentModal effects).
    if (verifyingRef.current) {
      return verifyingRef.current
    }
    const service = params.get('service') || 'dashboard_access'
    verifyingRef.current = (async (): Promise<StripeVerifyResult> => {
      try {
        const { data } = await api.post('/api/payment/stripe/verify', { session_id: session, service })
        if (!data?.success) {
          throw new Error(data?.error || 'Stripe verification failed')
        }
        // The verify call granted credits on the backend — fetch the fresh state.
        await checkPaymentStatus()
        // Clean the URL so a refresh doesn't re-verify the same session.
        cleanStripeReturnParams()
        return { verified: true, txHash: data.tx_hash || session, error: null }
      } catch (e) {
        // Keep the query params so a refresh can retry a transient failure.
        const message = e instanceof Error ? e.message : 'Card payment could not be verified'
        return { verified: false, txHash: null, error: message }
      } finally {
        verifyingRef.current = null
      }
    })()
    return verifyingRef.current
  }, [checkPaymentStatus])

  useEffect(() => {
    checkPaymentStatus()
  }, [checkPaymentStatus])

  // Verify Stripe checkout redirects on ANY page. Page-level PaymentModals are
  // usually conditionally mounted (e.g. only while posting on /ai, /create,
  // /schedule), so when Stripe redirects back the modal is gone and nobody
  // verified the session — credits were never granted and the payment gate
  // kept re-appearing even after a successful payment. Handling it here makes
  // verification work globally, whether or not a modal is still mounted.
  useEffect(() => {
    verifyStripeReturn()
  }, [verifyStripeReturn])

  const value = useMemo(
    () => ({
      hasPaid,
      loading,
      paymentDate,
      txHash,
      amount,
      creditsRemaining,
      packSize,
      checkPaymentStatus,
      refreshPaymentStatus,
      verifyStripeReturn,
    }),
    [hasPaid, loading, paymentDate, txHash, amount, creditsRemaining, packSize, checkPaymentStatus, refreshPaymentStatus, verifyStripeReturn]
  )

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
}

export function usePayment() {
  const context = useContext(PaymentContext)
  if (!context) {
    throw new Error('usePayment must be used within PaymentProvider')
  }
  return context
}

export type { StripeVerifyResult }