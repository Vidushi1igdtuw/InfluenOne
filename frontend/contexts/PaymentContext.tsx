'use client'

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { toast } from 'sonner'
import api from '@/lib/api'

interface PaymentContextType {
  hasPaid: boolean
  loading: boolean
  paymentDate: string | null
  txHash: string | null
  amount: string | null
  checkPaymentStatus: () => Promise<void>
  refreshPaymentStatus: () => Promise<void>
}

const PaymentContext = createContext<PaymentContextType | null>(null)

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [hasPaid, setHasPaid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [paymentDate, setPaymentDate] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [amount, setAmount] = useState<string | null>(null)

  const checkPaymentStatus = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/api/payment/status')
      
      setHasPaid(data.has_paid || false)
      setPaymentDate(data.payment_date || null)
      setTxHash(data.tx_hash || null)
      setAmount(data.amount || null)
    } catch (error: any) {
      setHasPaid(false)
    } finally {
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
      checkPaymentStatus,
      refreshPaymentStatus,
    }),
    [hasPaid, loading, paymentDate, txHash, amount, checkPaymentStatus, refreshPaymentStatus]
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

