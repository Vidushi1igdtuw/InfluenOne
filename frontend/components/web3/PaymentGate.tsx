'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePayment } from '@/contexts/PaymentContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PaymentModal } from './PaymentModal'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'

export function PaymentGate({ children }: { children: React.ReactNode }) {
  const { hasPaid, loading, refreshPaymentStatus } = usePayment()
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
    toast.success('Dashboard access granted')
  }

  if (loading || checkingPayment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!hasPaid) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Dashboard Access Required</CardTitle>
            <CardDescription className="mt-2">Pay with Stripe or FET to unlock the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
