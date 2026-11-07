'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Coins, Zap, Shield, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const services = [
  {
    name: 'Dashboard Access',
    price: 'Stripe or FET',
    description: 'Unlock full access to all features',
    icon: Shield,
  },
  {
    name: 'AI Post Generation',
    price: 'Stripe or FET',
    description: 'Generate engaging posts with AI',
    icon: Zap,
  },
  {
    name: 'Create & Post',
    price: 'Stripe or FET',
    description: 'Create and publish posts instantly',
    icon: CheckCircle2,
  },
  {
    name: 'Schedule Posts',
    price: 'Stripe or FET',
    description: 'Schedule posts for optimal timing',
    icon: CheckCircle2,
  },
  {
    name: 'URL to Post',
    price: 'Stripe or FET',
    description: 'Convert URLs into LinkedIn posts',
    icon: CheckCircle2,
  },
  {
    name: 'Post Ideas',
    price: 'FREE',
    description: 'Generate creative post ideas (no payment required)',
    icon: CheckCircle2,
  },
  {
    name: 'Templates',
    price: 'Stripe or FET',
    description: 'Save and reuse post templates',
    icon: CheckCircle2,
  },
]

export function PaymentSection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8 sm:mb-12 md:mb-16 px-2"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-sm sm:text-base md:text-lg px-3 sm:px-4 py-1.5 sm:py-2">
            <Coins className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Stripe and FET
          </Badge>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4">
          Pay with <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">card or FET</span>
        </h2>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4 sm:mb-6">
          Card via Stripe, or FET on Fetch Network. Same unlock either way.
        </p>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Stripe Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Instant transactions</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Near-zero fees</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Blockchain verified</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 border-2">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <service.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <Badge variant="secondary" className="text-sm sm:text-base md:text-lg font-bold">
                    {service.price}
                  </Badge>
                </div>
                <CardTitle className="text-lg sm:text-xl">{service.name}</CardTitle>
                <CardDescription className="mt-2 text-sm sm:text-base">{service.description}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto"
      >
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="text-center space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Why FET/Stripe?</h3>
              <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Lightning Fast
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Transactions complete in under a second via 1Sat Ordinals protocol
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Fully Collateralized
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    1:1 backed by U.S. Treasury bills and cash equivalents
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    Low Fees
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Near-zero transaction fees, perfect for micropayments
                  </p>
                </div>
              </div>
              <div className="pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  Use Stripe test cards locally, or send testnet FET to the address shown at checkout.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  )
}

