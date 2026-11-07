'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import api from '@/lib/api'
import { WEB_PACK_USES } from '@/lib/payments'

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
}

const PaymentContext = createContext<PaymentContextType | null>(null)

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

  const checkingRef = useRef(false)

  const checkPaymentStatus = useCallback(async () => {
    // Guard against duplicate concurrent checks (multiple gates mounting at once)
    if (checkingRef.current) return
    checkingRef.current = true
    try {
      setLoading(true)
      const { data } = await api.get('/api/payment/status')

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
      checkingRef.current = false
      setLoading(false)
    }
  }, [])

  const refreshPaymentStatus = useCallback(async () => {
    await checkPaymentStatus()
  }, [checkPaymentStatus])

  useEffect(() => {
    checkPaymentStatus()
  }, [checkPaymentStatus])

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
    }),
    [hasPaid, loading, paymentDate, txHash, amount, creditsRemaining, packSize, checkPaymentStatus, refreshPaymentStatus]
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
