'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Calendar, BarChart3, Zap, Link2, PenSquare, Bot, Globe, FileText } from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'ASI:One Post Generation',
    description: 'Create engaging LinkedIn posts in seconds. ASI:One is the only model doing the thinking.',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Schedule your posts and never miss the perfect time to engage with your audience.',
  },
  {
    icon: Link2,
    title: 'URL to Post',
    description: 'Convert any URL into a beautifully crafted LinkedIn post with AI-powered content extraction.',
  },
  {
    icon: FileText,
    title: 'Post Templates',
    description: 'Save and reuse your best-performing post templates for consistent content creation.',
  },
  {
    icon: Bot,
    title: 'Post Ideas Generator',
    description: 'Never run out of content ideas. Generate creative post topics tailored to your niche.',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description: 'Create posts in 7+ languages including English, French, Spanish, Italian, German, Portuguese, and Dutch.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Track your performance and understand what content resonates with your audience.',
  },
  {
    icon: Zap,
    title: '10x Faster Content Creation',
    description: 'Save hours every week with automated content generation and scheduling.',
  },
]

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8 sm:mb-12 md:mb-16 px-2"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4">
          LinkedIn content that captures your voice
        </h2>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
          InfluenOne is your all-in-one platform for creating effortlessly engaging content on LinkedIn.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 md:mb-16">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 sm:mb-4">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm sm:text-base">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative w-full max-w-6xl mx-auto aspect-video rounded-xl sm:rounded-2xl overflow-hidden border-2 border-border shadow-2xl"
      >
        <Image
          src="https://images.unsplash.com/photo-1542744173-05336fcc7ad4?q=80&w=1702&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Content Creation"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
      </motion.div>
    </section>
  )
}

