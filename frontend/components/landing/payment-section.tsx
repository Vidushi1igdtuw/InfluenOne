'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Zap, Shield, CheckCircle2 } from 'lucide-react'

const services = [
  {
    name: 'Creator pack',
    price: '$4.99',
    description: '10 uses of full access: generate, URL-to-post, schedule, publish',
    icon: Shield,
  },
  {
    name: 'ASI:One generation',
    price: '1 use',
    description: 'Each pack use writes a post with live web search + optional image',
    icon: Zap,
  },
  {
    name: 'ASI:One chat',
    price: '1 / pay',
    description: 'In ASI:One, one card payment unlocks one generation',
    icon: CreditCard,
  },
  {
    name: 'Create & Post',
    price: 'In pack',
    description: 'Publish to LinkedIn while uses remain',
    icon: CheckCircle2,
  },
  {
    name: 'Schedule Posts',
    price: 'In pack',
    description: 'Schedule while your pack still has uses',
    icon: CheckCircle2,
  },
  {
    name: 'URL to Post',
    price: '1 use',
    description: 'Scrape the page, search the live web, write the post',
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
            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Stripe packs
          </Badge>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4">
          Simple SaaS pricing. <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Card only on the web.</span>
        </h2>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4 sm:mb-6">
          $4.99 unlocks 10 uses of full access. ASI:One chat is 1 use per payment.
        </p>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Stripe Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>10 website uses</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>1 ASI:One use</span>
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
    </section>
  )
}
