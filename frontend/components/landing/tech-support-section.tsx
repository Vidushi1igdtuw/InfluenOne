'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Code2, LogIn, ArrowRight } from 'lucide-react'
import Image from 'next/image'

const techStack = [
  { name: 'Next.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
  { name: 'React', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { name: 'TypeScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
  { name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { name: 'Azure', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg' },
  { name: 'Supabase', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
]

export function TechSupportSection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8 sm:mb-12"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Code2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            Built with Modern Tech Stack
          </h2>
        </div>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Powered by industry-leading technologies for performance, security, and scalability
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="mb-8 sm:mb-12"
      >
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8">
          {techStack.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 p-3 sm:p-4 rounded-lg bg-card border border-border hover:shadow-lg transition-all"
            >
              <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                <Image
                  src={tech.logo}
                  alt={tech.name}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-sm sm:text-base font-medium">{tech.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-2 bg-gradient-to-br from-primary/5 via-background to-primary/5">
          <CardContent className="p-6 sm:p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                  Ready to Get Started?
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-4">
                  Join thousands of creators using InfluenOne to create better LinkedIn content
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Sign Up
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  )
}

