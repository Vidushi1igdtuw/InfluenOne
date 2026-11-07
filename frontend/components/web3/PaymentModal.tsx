'use client'

import { useEffect, useState } from 'react'
import { usePayment } from '@/contexts/PaymentContext'
import { WEB_PACK_USES, type PaymentConfig, type ServiceKey } from '@/lib/payments'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

interface PaymentModalProps {
  service: ServiceKey
  serviceName: string
  onSuccess: (txHash: string) => void
  onCancel: () => void
  onServiceCall: () => Promise<any>
}

export function PaymentModal({
  service,
  serviceName,
  onSuccess,
  onCancel,
  onServiceCall,
}: PaymentModalProps) {
  const { refreshPaymentStatus } = usePayment()
  const [config, setConfig] = useState<PaymentConfig | null>(null)
  const [method, setMethod] = useState<'pay' | 'success'>('pay')
  const [processing, setProcessing] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  useEffect(() => {
    api.get('/api/payment/config').then(({ data }) => setConfig(data)).catch(() => setConfig(null))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const session = params.get('stripe_session')
    const svc = (params.get('service') as ServiceKey) || service
    if (!session) return
    ;(async () => {
      setProcessing(true)
      try {
        const { data } = await api.post('/api/payment/stripe/verify', { session_id: session, service: svc })
        if (!data.success) throw new Error(data.error || 'Stripe verification failed')
        setTxHash(data.tx_hash || session)
        setMethod('success')
        await refreshPaymentStatus()
        await onServiceCall()
        onSuccess(data.tx_hash || session)
      } catch (error: any) {
        toast.error(error?.message || 'Card payment could not be verified')
        setProcessing(false)
      }
    })()
  }, [service, onServiceCall, onSuccess, refreshPaymentStatus])

  const payStripe = async () => {
    setProcessing(true)
    try {
      const origin = window.location.origin
      const path = window.location.pathname
      const { data } = await api.post('/api/payment/stripe/checkout', {
        service,
        success_url: `${origin}${path}?stripe_session={CHECKOUT_SESSION_ID}&service=${service}`,
        cancel_url: `${origin}${path}`,
      })
      if (!data.success || !data.checkout_url) throw new Error(data.error || 'Could not start Stripe Checkout')
      window.location.href = data.checkout_url
    } catch (error: any) {
      toast.error(error?.message || 'Stripe checkout failed')
      setProcessing(false)
    }
  }

  const packUses = config?.pack_uses || WEB_PACK_USES
  const price = config?.stripe_amount_usd || '4.99'

  if (method === 'success') {
    return (
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">Pack unlocked</h3>
              <p className="text-sm text-muted-foreground">{packUses} uses added. Generate, URL-to-post, and schedule are included.</p>
              {txHash && <p className="text-xs text-muted-foreground font-mono break-all">{txHash}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Creator pack — {serviceName}</CardTitle>
        <CardDescription>
          ${price} on Stripe. {packUses} uses of full access (generate, URL-to-post, schedule, post).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>{packUses} AI generations on the website</li>
          <li>ASI:One chat is 1 use per card payment</li>
          <li>Test card: 4242 4242 4242 4242</li>
        </ul>
        <Button onClick={payStripe} disabled={processing || config?.stripe_ready === false} size="lg" className="w-full">
          {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
          Pay ${price} with Stripe
        </Button>
        <Button onClick={onCancel} variant="ghost" disabled={processing} className="w-full">
          Cancel
        </Button>
      </CardContent>
    </Card>
  )
}
