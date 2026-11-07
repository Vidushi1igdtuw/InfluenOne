'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-primary/20 shadow-2xl"
      >
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop&q=80"
            alt="Get Started"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/60 to-primary/10" />
        </div>
        <div className="relative z-10 text-center p-6 sm:p-8 md:p-12 lg:p-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4">
          Ready to save time?
        </h2>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8">
          Start creating better LinkedIn content in minutes, not hours.
        </p>
        <Link href="/signup">
          <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8">
            Try InfluenOne for free
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </Link>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4">No credit card required</p>
        </div>
      </motion.div>
    </section>
  )
}

