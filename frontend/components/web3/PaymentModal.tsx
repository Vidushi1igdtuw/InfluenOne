'use client'

import { useEffect, useState } from 'react'
import { usePayment } from '@/contexts/PaymentContext'
import { SERVICE_PRICES, type PaymentConfig, type ServiceKey } from '@/lib/payments'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CreditCard, Coins, CheckCircle2, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

interface PaymentModalProps {
  service: keyof typeof SERVICE_PRICES
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
  const [method, setMethod] = useState<'pick' | 'stripe' | 'fet' | 'success'>('pick')
  const [processing, setProcessing] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null)
  const [fetHash, setFetHash] = useState('')

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

  const payFet = async () => {
    if (!fetHash.trim()) {
      toast.error('Paste the FET transaction hash')
      return
    }
    setProcessing(true)
    try {
      const { data } = await api.post('/api/payment/verify', {
        txHash: fetHash.trim(),
        service,
        amount: config?.fet_amount || '5',
        method: 'fet',
      })
      if (!data.success) throw new Error(data.error || 'FET verification failed')
      setTxHash(data.tx_hash)
      setExplorerUrl(data.explorer_url || null)
      setMethod('success')
      await refreshPaymentStatus()
      await onServiceCall()
      onSuccess(data.tx_hash)
    } catch (error: any) {
      toast.error(error?.message || 'FET payment failed')
      setProcessing(false)
    }
  }

  if (method === 'success') {
    return (
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">Payment Successful</h3>
              {txHash && <p className="text-xs text-muted-foreground font-mono break-all">{txHash}</p>}
              {explorerUrl && (
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                  <ExternalLink className="h-4 w-4" />
                  View on explorer
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Unlock {serviceName}</CardTitle>
        <CardDescription>Pay by card (Stripe) or FET. Same unlock either way.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {method === 'pick' && (
          <div className="grid gap-3">
            <Button onClick={payStripe} disabled={processing || config?.stripe_ready === false} size="lg" className="w-full">
              {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
              Pay ${config?.stripe_amount_usd || '4.99'} with card
            </Button>
            <Button onClick={() => setMethod('fet')} variant="outline" size="lg" className="w-full" disabled={processing}>
              <Coins className="mr-2 h-4 w-4" />
              Pay {config?.fet_amount || '5'} FET
            </Button>
            <Button onClick={onCancel} variant="ghost" disabled={processing}>
              Cancel
            </Button>
          </div>
        )}

        {method === 'fet' && (
          <div className="space-y-3">
            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Network</span>
                <span className="font-medium">{config?.fet_network || 'testnet'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">{config?.fet_amount || '5'} FET</span>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Send to</p>
                <p className="font-mono text-xs break-all">{config?.fet_address || 'Set FET_WALLET_ADDRESS on the backend'}</p>
              </div>
            </div>
            <Input
              placeholder="Paste FET transaction hash"
              value={fetHash}
              onChange={(e) => setFetHash(e.target.value)}
              disabled={processing}
            />
            <div className="flex gap-2">
              <Button onClick={() => setMethod('pick')} variant="outline" className="flex-1" disabled={processing}>
                Back
              </Button>
              <Button onClick={payFet} className="flex-1" disabled={processing}>
                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                I paid, verify
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
