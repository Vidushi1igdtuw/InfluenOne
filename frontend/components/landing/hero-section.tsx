'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, ArrowRight, Coins } from 'lucide-react'
import { FloatingShapes } from './svg-animations'

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 md:pt-32 lg:pt-40 pb-12 sm:pb-16 md:pb-20 lg:pb-32 max-w-7xl relative">
      <FloatingShapes />
      <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4">
            <Badge variant="outline" className="bg-[#3D8BD3]/10 text-[#3D8BD3] border-[#3D8BD3]/30 text-xs sm:text-sm">
              Innovation Lab
            </Badge>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
              Stranger Builds
            </Badge>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
              ASI:One
            </Badge>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
              <Shield className="h-3 w-3 mr-2" />
              Chat Protocol
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold tracking-tight px-2 sm:px-4">
            LinkedIn content agent, powered by{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ASI:One
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-muted-foreground max-w-2xl mx-auto px-2 sm:px-4">
            Generate, schedule, and post. Website packs are Stripe only — 10 uses of full access.
          </p>
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 md:p-5 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-2 border-primary/20 max-w-2xl mx-auto">
            <div className="flex items-start gap-2 sm:gap-3">
              <Coins className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-left flex-1 min-w-0">
                <p className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-foreground mb-1">
                  Stripe creator pack
                </p>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground break-words">
                  $4.99 for 10 website uses. ASI:One chat is 1 use per card payment.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2"
        >
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
              Try InfluenOne
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
            Contact sales
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 sm:mt-12 md:mt-16 relative px-2 sm:px-4"
        >
          <div className="relative w-full max-w-5xl mx-auto aspect-video rounded-xl sm:rounded-2xl overflow-hidden border-2 border-border shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="LinkedIn Dashboard"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

