'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LandingHeader } from '@/components/landing/header'
import { HeroSection } from '@/components/landing/hero-section'
import { ProblemSection } from '@/components/landing/problem-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { AIFeaturesSection } from '@/components/landing/ai-features-section'
import { UpcomingFeaturesSection } from '@/components/landing/upcoming-features-section'
import { PaymentSection } from '@/components/landing/payment-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { TechSupportSection } from '@/components/landing/tech-support-section'
import { CTASection } from '@/components/landing/cta-section'
import { LandingFooter } from '@/components/landing/footer'

export default function HomePage() {
  const { jwt, user, fetchUserProfile } = useAuth()

  useEffect(() => {
    if (jwt && !user) {
      fetchUserProfile()
    }
  }, [jwt, user, fetchUserProfile])

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <AIFeaturesSection />
      <UpcomingFeaturesSection />
      <PaymentSection />
      <TestimonialsSection />
      <TechSupportSection />
      <CTASection />
      <LandingFooter />
    </div>
  )
}
