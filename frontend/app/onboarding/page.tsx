'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useLinkedIn } from '@/contexts/LinkedInContext'
import { usePayment } from '@/contexts/PaymentContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link2, Bot, Calendar, CheckCircle2, Link2Off, LayoutDashboard, Coins } from 'lucide-react'
import { PaymentModal } from '@/components/web3/PaymentModal'
import { useState } from 'react'

const steps = [
  {
    icon: Coins,
    title: 'Pay with Stripe or FET',
    description: 'Pay Stripe or FET to unlock dashboard access and all features.',
    required: true,
  },
  {
    icon: Link2,
    title: 'Connect LinkedIn',
    description: 'Securely connect your LinkedIn account to post and schedule.',
  },
  {
    icon: Bot,
    title: 'Enable AI Posts',
    description: 'Let AI draft high-impact posts tailored to your topics.',
  },
  {
    icon: Calendar,
    title: 'Create a Schedule',
    description: 'Set it once—keep your presence consistent automatically.',
  },
]

export default function OnboardingPage() {
  const { connected, connect, disconnect } = useLinkedIn()
  const { hasPaid, refreshPaymentStatus } = usePayment()
  const router = useRouter()
  const [showPayment, setShowPayment] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-4xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Let's get you set up
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Three quick steps to start posting like a pro.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, index) => {
            const isPaymentStep = step.title === 'Pay with Stripe or FET'
            const isCompleted = isPaymentStep ? hasPaid : (step.title === 'Connect LinkedIn' ? connected : false)
            
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`h-full border-2 hover:shadow-lg transition-shadow ${isCompleted ? 'border-green-500/50 bg-green-500/5' : ''} ${step.required && !isCompleted ? 'border-primary/50' : ''}`}>
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl grid place-items-center mb-2 ${isCompleted ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-primary/10 text-primary'}`}>
                      {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
                    </div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {step.title}
                      {step.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                    </CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                    {isPaymentStep && !hasPaid && (
                      <Button
                        onClick={() => setShowPayment(true)}
                        className="mt-4 w-full"
                        size="sm"
                      >
                        <Coins className="mr-2 h-4 w-4" />
                        Pay Now
                      </Button>
                    )}
                  </CardHeader>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-2">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                <div>
                  <CardTitle>LinkedIn Status</CardTitle>
                  <CardDescription className="mt-2">
                    {connected ? (
                      <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                        <CheckCircle2 className="mr-2 h-3 w-3" />
                        Connected
                      </Badge>
                    ) : (
                      'Not connected'
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {connected ? (
                    <Button onClick={disconnect} variant="outline">
                      <Link2Off className="mr-2 h-4 w-4" />
                      Disconnect Account
                    </Button>
                  ) : (
                    <Button onClick={connect}>
                      <Link2 className="mr-2 h-4 w-4" />
                      Connect LinkedIn
                    </Button>
                  )}
                  <Button 
                    onClick={() => router.push('/dashboard')} 
                    variant="outline"
                    disabled={!hasPaid}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {showPayment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PaymentModal
              service="dashboard_access"
              serviceName="Dashboard Access"
              onSuccess={async (txHash) => {
                await refreshPaymentStatus()
                setShowPayment(false)
                router.push('/dashboard')
              }}
              onCancel={() => setShowPayment(false)}
              onServiceCall={async () => {
                await refreshPaymentStatus()
                return {}
              }}
            />
          </motion.div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          You can always change settings from the sidebar later.
        </p>
      </div>
    </div>
  )
}

