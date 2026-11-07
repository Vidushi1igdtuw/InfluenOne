'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Matt Barker',
    role: '175K+ LinkedIn followers',
    content: 'I stopped using ChatGPT to write LinkedIn posts. InfluenOne changed everything.',
    avatar: 'MB',
    imageId: '1472099645785-5658abf4ff4e',
  },
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    content: 'InfluenOne has transformed how we create content. It\'s a game-changer for our team.',
    avatar: 'SJ',
    imageId: '1438761681033-6461ffad8d80',
  },
  {
    name: 'Alex Chen',
    role: 'Entrepreneur',
    content: 'The AI understands my voice perfectly. My engagement has increased 3x since using InfluenOne.',
    avatar: 'AC',
    imageId: '1507003211169-0a1dd7228f2d',
  },
]

export function TestimonialsSection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8 sm:mb-10 md:mb-12 px-2"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4">
          Already +20,000 InfluenOne fans
        </h2>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground">
          Find out what they think of our solution.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">"{testimonial.content}"</p>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Image
                      src={`https://images.unsplash.com/photo-${testimonial.imageId}?w=100&h=100&fit=crop&q=80`}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm sm:text-base truncate">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground truncate">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

