'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarClock, Copy, Image as ImageIcon, Linkedin, MessageCircle, Radio, Sparkles, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { BRAND, PILLARS } from '@/lib/brand'
import { LabAtmosphere } from '@/components/brand/atmosphere'
import { LandingHeader } from '@/components/landing/header'
import { LandingFooter } from '@/components/landing/footer'
import { Button } from '@/components/ui/button'
import { PoweredByAsi } from '@/components/brand/powered-by'
import { ProblemSection } from '@/components/landing/problem-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { AIFeaturesSection } from '@/components/landing/ai-features-section'
import { PaymentSection } from '@/components/landing/payment-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { UpcomingFeaturesSection } from '@/components/landing/upcoming-features-section'
import { TechSupportSection } from '@/components/landing/tech-support-section'

const FLOW = [
  { n: '01', t: 'Intent', d: 'Topic, URL, or a sentence in ASI:One chat.' },
  { n: '02', t: 'ASI:One', d: 'Only model. Writes in your voice, scrapes the web, draws the graphic.' },
  { n: '03', t: 'Pay', d: 'Stripe pack on the site. Payment Protocol inside ASI:One.' },
  { n: '04', t: 'Action', d: 'Approve, schedule, or post to LinkedIn. Done.' },
]

export function LabHome() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <LabAtmosphere />
      <div className="relative z-10">
        <LandingHeader />
        <Hero />
        <Pillars />
        <IntentFlow />
        <WorkflowAnimation />
        <PostsShowcase />
        <AgentCard />
        <ProblemSection />
        <FeaturesSection />
        <AIFeaturesSection />
        <PaymentSection />
        <TestimonialsSection />
        <UpcomingFeaturesSection />
        <TechSupportSection />
        <Cta />
        <LandingFooter />
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 sm:pt-36 lg:pt-40">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl text-center"
      >
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-medium tracking-wide text-secondary">
            {BRAND.lab}
          </span>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium tracking-wide text-primary">
            {BRAND.event}
          </span>
          <PoweredByAsi />
        </div>
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          Something strange is brewing
        </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          LinkedIn, from intent to action.
          <span className="mt-2 block bg-gradient-to-r from-neutral-900 via-neutral-500 to-neutral-400 bg-clip-text text-transparent">
            Powered by ASI:One.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
          {BRAND.name} is the ghostwriter agent for influencers. ASI:One writes the post,
          draws the graphic, and the agent publishes — on the web or inside an ASI:One conversation.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="lab-glow w-full rounded-full px-8">
              Open the studio
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href={BRAND.asiOneUrl} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full rounded-full border-border bg-muted px-8">
              <MessageCircle className="h-4 w-4" />
              Chat on ASI:One
            </Button>
          </a>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-auto mt-16 max-w-5xl"
      >
        <Preview />
      </motion.div>
    </section>
  )
}

function Preview() {
  return (
    <div className="lab-glass relative overflow-hidden rounded-3xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="h-2 w-2 animate-pulse-glow rounded-full bg-foreground" />
          Live studio · ASI:One
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] text-primary">
          Challenge 1 + 2
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-border bg-card/70 p-5 text-left">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">ASI:One draft</p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            Most LinkedIn tools stop at a chatbot. InfluenOne does not. You give it an intent —
            a topic, a URL, a half-formed thought — and the agent writes, illustrates, takes payment,
            and posts. That is Fetch.ai: from intent to action.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">#ASI1 #InnovationLab #StrangerBuilds</p>
        </div>
        <div className="relative min-h-[180px] overflow-hidden rounded-2xl">
          <Image
            src="https://images.unsplash.com/photo-1611926653458-09294b3142bf?q=80&w=1200&auto=format&fit=crop"
            alt="Creator publishing on LinkedIn with ASI:One"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 480px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="relative flex h-full flex-col justify-end p-5">
            <Sparkles className="mb-auto h-6 w-6 text-white/80" />
            <p className="text-sm font-medium text-white">Innovation Lab graphic</p>
            <p className="text-xs text-white/70">ASI:One image · 1792×1024</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Pillars() {
  return (
    <section id="pillars" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Three pillars</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Built on the Fetch.ai stack.</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {PILLARS.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="lab-glass rounded-2xl p-6"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">0{i + 1}</p>
            <h3 className="mt-2 text-xl font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.copy}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function IntentFlow() {
  return (
    <section id="flow" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Challenge 1</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Intent → action, not a chatbot.</h2>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FLOW.map((s) => (
          <div key={s.n} className="rounded-2xl border border-border bg-muted p-5">
            <p className="font-mono text-xs text-primary">{s.n}</p>
            <h3 className="mt-1 text-lg font-semibold">{s.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

const SHOWCASE_POSTS = [
  {
    img: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?q=80&w=900&auto=format&fit=crop',
    title: 'From intent to post',
    meta: 'Topic → ASI:One draft + graphic',
    tag: 'Generated post',
  },
  {
    img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=900&auto=format&fit=crop',
    title: 'URL → LinkedIn in one paste',
    meta: 'Article scraped, rewritten, illustrated',
    tag: 'URL to post',
  },
  {
    img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=900&auto=format&fit=crop',
    title: 'Scheduled while you sleep',
    meta: 'Cron-scheduled publish, no babysitting',
    tag: 'Scheduler',
  },
  {
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=900&auto=format&fit=crop',
    title: 'Analytics that close the loop',
    meta: 'Impressions feed the next draft',
    tag: 'Analytics',
  },
]

function PostsShowcase() {
  return (
    <section id="showcase" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Made with the agent</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Four posts, zero manual work.</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SHOWCASE_POSTS.map((post, i) => (
          <motion.div
            key={post.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="group overflow-hidden rounded-2xl border border-border bg-card"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={post.img}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                {post.tag}
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold leading-snug">{post.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{post.meta}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

const WORKFLOW_STEPS = [
  { icon: MessageCircle, label: 'Chat intent' },
  { icon: Sparkles, label: 'ASI:One draft' },
  { icon: ImageIcon, label: 'Graphic' },
  { icon: Wallet, label: 'Stripe / FET' },
  { icon: CalendarClock, label: 'Schedule' },
  { icon: Linkedin, label: 'Published' },
]

function WorkflowAnimation() {
  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-4 py-16 sm:px-6">
      <p className="text-center font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Live workflow</p>
      <h2 className="mt-2 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
        Watch one intent become a published post.
      </h2>
      <div className="relative mt-12">
        <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-neutral-400/60 to-transparent lg:block" />
        <motion.div
          aria-hidden
          className="absolute top-[18px] hidden h-3 w-3 rounded-full bg-primary shadow-[0_0_16px_4px_rgba(0,0,0,0.35)] lg:block"
          animate={{ left: ['2%', '94%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {WORKFLOW_STEPS.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div className="lab-glass flex h-12 w-12 items-center justify-center rounded-full border border-primary/30">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">{step.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AgentCard() {
  const copy = async () => {
    await navigator.clipboard.writeText(BRAND.agentAddress)
    toast.success('Agent address copied')
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="lab-glass grid gap-8 rounded-3xl p-6 md:grid-cols-2 md:p-10">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Discoverable</p>
          <h2 className="mt-2 text-3xl font-semibold">Talk to it on ASI:One.</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Full workflow in chat: topic or URL → ASI:One draft + image → Stripe Payment Protocol → post.
            Agent Chat Protocol. Payment Protocol. ASI:One only.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={copy} variant="outline" className="rounded-full border-border">
              <Copy className="h-4 w-4" />
              Copy address
            </Button>
            <a href={BRAND.asiOneUrl} target="_blank" rel="noreferrer">
              <Button className="rounded-full">Open ASI:One</Button>
            </a>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card/70 p-5 font-mono text-xs leading-relaxed">
          <p className="text-muted-foreground">agent.name</p>
          <p className="mt-1 text-foreground">{BRAND.agentName}</p>
          <p className="mt-4 text-muted-foreground">agent.address</p>
          <p className="mt-1 break-all text-foreground/80">{BRAND.agentAddress}</p>
          <p className="mt-4 text-muted-foreground">protocols</p>
          <p className="mt-1">ACP · Payment Protocol · REST</p>
          <p className="mt-4 flex items-center gap-2 text-neutral-400">
            <Radio className="h-3.5 w-3.5" /> mailbox=True
          </p>
        </div>
      </div>
    </section>
  )
}

function Cta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-r from-neutral-900/20 via-neutral-400/60 to-neutral-900/20 p-8 text-center sm:p-12">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ship the post. Win the room.</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Stripe pack is $4.99 for 10 studio uses. ASI:One chat is 1 use per payment.
          ASI:One is the only brain.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="lab-glow rounded-full px-8">
              <Wallet className="h-4 w-4" />
              Start with Stripe
            </Button>
          </Link>
          <Link href="/tech-stack">
            <Button variant="outline" size="lg" className="rounded-full border-border">
              See the tech
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
