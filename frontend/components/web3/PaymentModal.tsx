'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePayment } from '@/contexts/PaymentContext'
import { WEB_PACK_USES, type PaymentConfig, type ServiceKey } from '@/lib/payments'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, CheckCircle2, Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

import type { StripeVerifyResult } from '@/contexts/PaymentContext'

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
  const { verifyStripeReturn, creditsRemaining, loading, refreshPaymentStatus } = usePayment()
  const [config, setConfig] = useState<PaymentConfig | null>(null)
  const [method, setMethod] = useState<'pay' | 'success'>('pay')
  const [processing, setProcessing] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  // Pack-credit flow: when the user still has uses left from a previously paid
  // pack, the service runs directly ("covered") instead of demanding payment.
  const [coveredState, setCoveredState] = useState<'idle' | 'running' | 'error'>('idle')
  const coveredAttemptedRef = useRef(false)

  useEffect(() => {
    api.get('/api/payment/config').then(({ data }) => setConfig(data)).catch(() => setConfig(null))
  }, [])

  // Runs the service against the user's remaining pack credits.
  const runCovered = useCallback(async () => {
    setCoveredState('running')
    try {
      await onServiceCall()
      // The service consumed a credit server-side — sync the new balance
      // before handing control back to the page.
      await refreshPaymentStatus()
      onSuccess('')
      setCoveredState('idle')
    } catch {
      // The call failed — possibly because credits ran out between the balance
      // check and this call. Re-sync so the fallback UI reflects reality.
      try {
        await refreshPaymentStatus()
      } catch {
        /* balance stays as-is */
      }
      setCoveredState('error')
    }
  }, [onServiceCall, refreshPaymentStatus, onSuccess])

  // Stripe redirects back to this page with ?stripe_session=... — verify the
  // session via the shared context helper (deduped with the provider-level
  // auto-verify, so the session is never verified twice).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      let result: StripeVerifyResult
      try {
        result = await verifyStripeReturn()
      } catch {
        return
      }
      if (cancelled) return
      if (result.verified) {
        setTxHash(result.txHash)
        setMethod('success')
        try {
          await onServiceCall()
          onSuccess(result.txHash || '')
        } catch {
          /* service call failures are surfaced by the caller */
        }
      } else if (result.error) {
        toast.error(result.error)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [verifyStripeReturn, onServiceCall, onSuccess])

  // Pack-credit auto-run: with uses remaining, skip the payment form entirely
  // and execute the service. Skipped on Stripe returns — that flow runs the
  // service in the effect above after verifying the session.
  useEffect(() => {
    if (coveredAttemptedRef.current) return
    if (
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).has('stripe_session')
    ) {
      coveredAttemptedRef.current = true
      return
    }
    // Wait for the balance check to settle so creditsRemaining is the real
    // server value rather than the default 0 while it is still in flight.
    if (loading) return
    if (creditsRemaining <= 0) return
    coveredAttemptedRef.current = true
    runCovered()
  }, [loading, creditsRemaining, runCovered])

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

  const isStripeReturn =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('stripe_session')
  // Computed during render (not only in the effect) so a covered user never
  // sees the payment form flash before the service starts running.
  const creditsCovered = !loading && !isStripeReturn && creditsRemaining > 0

  if (method === 'success') {
    return (
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <CheckCircle2 className="h-16 w-16 text-neutral-500" />
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

  if (coveredState === 'error') {
    const outOfCredits = creditsRemaining <= 0
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>{outOfCredits ? 'Pack finished' : 'Action failed'}</CardTitle>
          <CardDescription>
            {outOfCredits
              ? `Your pack uses are finished. Buy a new pack to keep using ${serviceName}.`
              : `${serviceName} could not be completed. Please try again.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {outOfCredits ? (
            <Button onClick={() => setCoveredState('idle')} size="lg" className="w-full">
              <CreditCard className="mr-2 h-4 w-4" />
              Buy a pack — ${price}
            </Button>
          ) : (
            <Button onClick={runCovered} size="lg" className="w-full">
              <Zap className="mr-2 h-4 w-4" />
              Try again
            </Button>
          )}
          <Button onClick={onCancel} variant="ghost" className="w-full">
            Cancel
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (creditsCovered || coveredState === 'running') {
    return (
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-neutral-500" />
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold">Using a pack credit</h3>
              <p className="text-sm text-muted-foreground">Running {serviceName}…</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // The balance is still loading — don't flash the payment form for users who
  // may still be covered by their pack.
  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="h-10 w-10 animate-spin text-neutral-500" />
            <p className="text-sm text-muted-foreground">Checking your pack balance…</p>
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