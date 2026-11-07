'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { usePayment } from '@/contexts/PaymentContext'
import { LabAtmosphere } from '@/components/brand/atmosphere'
import { BrandMark } from '@/components/brand/mark'
import { PoweredByAsi } from '@/components/brand/powered-by'
import { PaymentModal } from './PaymentModal'

export function PaymentGate({ children }: { children: React.ReactNode }) {
  const { hasPaid, loading, refreshPaymentStatus, packSize } = usePayment()
  const router = useRouter()
  const [checkingPayment, setCheckingPayment] = useState(true)

  useEffect(() => {
    const checkPayment = async () => {
      setCheckingPayment(true)
      try {
        await refreshPaymentStatus()
      } finally {
        setCheckingPayment(false)
      }
    }
    checkPayment()
  }, [refreshPaymentStatus])

  const handlePaymentSuccess = async () => {
    await refreshPaymentStatus()
    toast.success('Creator pack unlocked')
  }

  if (loading || checkingPayment) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <LabAtmosphere />
        <Loader2 className="relative z-10 h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!hasPaid) {
    return (
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <LabAtmosphere />
        <div className="lab-glass relative z-10 w-full max-w-md rounded-3xl p-8 text-center">
          <BrandMark className="mb-6 justify-center" />
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold">Unlock the studio</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Stripe only — {packSize} uses of ASI:One generate, image, and publish.
          </p>
          <div className="mt-4 flex justify-center">
            <PoweredByAsi />
          </div>
          <div className="mt-6 text-left">
            <PaymentModal
              service="dashboard_access"
              serviceName="Dashboard Access"
              onSuccess={handlePaymentSuccess}
              onCancel={() => router.push('/onboarding')}
              onServiceCall={async () => {
                await refreshPaymentStatus()
                return {}
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
