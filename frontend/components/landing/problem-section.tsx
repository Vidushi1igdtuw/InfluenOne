'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, X } from 'lucide-react'

export function ProblemSection() {
  const problems = [
    "I spend hours writing posts.",
    "I'm running out of content ideas.",
    "My posts barely get engagement.",
    "I can't stay consistent.",
    "I'm juggling multiple tools.",
    "I don't understand my results.",
  ]

  return (
    <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl">
      
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10 md:mb-12 px-2"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4">
            Tired of spending hours writing your next LinkedIn post?
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground">
            InfluenOne brings your ideas to life in just a few clicks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 rounded-lg border bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <X className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
              </div>
              <span className="text-sm sm:text-base">{problem}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border-2 border-primary/20 shadow-xl"
        >
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1762341123798-0e0ef3e37723?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="LinkedIn Solution"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background/70 to-primary/20" />
          </div>
          <div className="relative z-10 text-center p-6 sm:p-8 md:p-12">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-2">There's just one solution: InfluenOne.</h3>
            <Link href="/signup">
              <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8">
                Try InfluenOne Now
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
      
    </section>
  )
}

