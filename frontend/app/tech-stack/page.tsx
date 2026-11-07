'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code2, Database, Zap, Shield, Coins, Globe } from 'lucide-react'
import { MermaidDiagram } from '@/components/mermaid-diagram'
import { LandingHeader } from '@/components/landing/header'
import { LandingFooter } from '@/components/landing/footer'

export default function TechStackPage() {

  const techStack = [
    {
      category: 'Frontend',
      items: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Space Grotesk'],
      icon: Code2,
      color: 'text-neutral-500',
    },
    {
      category: 'Fetch.ai',
      items: ['uAgents', 'Agent Chat Protocol', 'Payment Protocol', 'Agentverse', 'mailbox'],
      icon: Zap,
      color: 'text-neutral-500',
    },
    {
      category: 'Payments',
      items: ['Stripe Checkout', 'Payment Protocol embedded_page', 'FET on Fetch Network'],
      icon: Coins,
      color: 'text-neutral-500',
    },
    {
      category: 'Database',
      items: ['Supabase', 'PostgreSQL', 'Storage images bucket', 'JWT Auth'],
      icon: Database,
      color: 'text-neutral-500',
    },
    {
      category: 'ASI:One',
      items: ['ASI:One only', 'ChatOpenAI → api.asi1.ai/v1', 'Image generate b64_json', 'web_search high'],
      icon: Globe,
      color: 'text-neutral-500',
    },
    {
      category: 'Security & Auth',
      items: ['JWT Authentication', 'OAuth 2.0 (LinkedIn)', 'CORS Protection', 'Payment Verification', 'Session Management'],
      icon: Shield,
      color: 'text-neutral-500',
    },
  ]

  return (
    <div className="relative min-h-screen">
      <div className="lab-mesh pointer-events-none absolute inset-0" />
      <LandingHeader />
      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12 md:py-20 max-w-7xl pt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-3">Powered by ASI:One</p>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tight mb-4">
            Tech
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto px-4">
            Next.js 16 · uAgents · ASI:One only · Stripe Payment Protocol · Supabase
          </p>
        </motion.div>

        {/* Tech Stack Cards */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {techStack.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-2 hover:shadow-lg transition-all">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <tech.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${tech.color}`} />
                    <CardTitle className="text-lg sm:text-xl">{tech.category}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {tech.items.map((item, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Simple Architecture Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8 sm:mb-12"
        >
          <Card className="border-2">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">System Overview</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                High-level architecture of InfluenOne platform
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <MermaidDiagram
                chart={`graph TD
    A[User Browser] -->|HTTPS| B[Next.js Frontend]
    B -->|REST API| C[Python uAgents Backend]
    U[User on ASI:One] -->|Chat Protocol + Cards| C
    C -->|SQL| D[(Supabase Database)]
    C -->|OAuth| E[LinkedIn API]
    C -->|AI API| F[ASI:One]
    C -->|FET Payments| G[Fetch Network]
    C -->|Stripe Pack| S[Stripe Checkout]

    style A fill:#171717,stroke:#000000,color:#fff
    style B fill:#171717,stroke:#000000,color:#fff
    style C fill:#404040,stroke:#262626,color:#fff
    style D fill:#525252,stroke:#404040,color:#fff
    style E fill:#262626,stroke:#0a0a0a,color:#fff
    style F fill:#0a0a0a,stroke:#737373,color:#fff
    style G fill:#404040,stroke:#262626,color:#fff
    style S fill:#404040,stroke:#262626,color:#fff
    style U fill:#171717,stroke:#000000,color:#fff`}
                id="architecture-diagram"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Flow - Simplified */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8 sm:mb-12"
        >
          <Card className="border-2">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">Payment Flow</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Stripe pack on web - FET Payment Protocol in agent chat
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <MermaidDiagram
                chart={`sequenceDiagram
    participant U as User
    participant F as Frontend / Chat UI
    participant B as uAgent Backend
    participant P as Stripe / Fetch Wallet
    Note over U,P: Web - Stripe pack $4.99 for 10 uses
    U->>F: Choose a service
    F->>P: Open Stripe Checkout
    U->>P: Pay with card
    P-->>B: Payment confirmed
    B->>B: Verify and credit 10 uses
    B-->>F: Uses unlocked
    F->>B: Run service (1 use deducted)
    Note over U,B: Agent chat - FET Payment Protocol
    U->>B: Request a service on ASI:One
    B-->>U: Interactive card with FET payment request
    U->>B: Send FET from Fetch Wallet
    B->>B: Verify transaction (1 use)
    B-->>U: Draft, graphic, publish or schedule in chat`}
                id="payment-flow-diagram"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Service Execution - Simplified */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-8 sm:mb-12"
        >
          <Card className="border-2">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">Service Execution</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                How services work after payment verification
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <MermaidDiagram
                chart={`flowchart TD
    Start([User Requests Service]) --> Check{Payment<br/>Paid?}
    Check -->|Yes| Execute[Execute Service]
    Check -->|No| Pay[Request Payment]
    Pay --> Execute

    Execute --> Type{Service Type}
    Type -->|AI Post| AI[Generate with ASI:One]
    Type -->|LinkedIn| LI[Post to LinkedIn]
    Type -->|Schedule| Sched[Save Schedule]
    Type -->|Templates| Temp[Save Template]

    AI --> Save[(Save to Database)]
    LI --> Save
    Sched --> Save
    Temp --> Save

    Save --> Done([Service Complete])

    style Start fill:#171717,stroke:#000000,color:#fff
    style Execute fill:#525252,stroke:#404040,color:#fff
    style Save fill:#262626,stroke:#0a0a0a,color:#fff
    style Done fill:#525252,stroke:#404040,color:#fff`}
                id="service-flow-diagram"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Backend Services Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mb-8 sm:mb-12"
        >
          <Card className="border-2">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">Backend Services</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Main services and their responsibilities
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <MermaidDiagram
                chart={`graph LR
    API[REST API Server] --> Auth[Auth Service]
    API --> Payment[Payment Service]
    API --> LinkedIn[LinkedIn Service]
    API --> AI[AI Service]
    API --> Scheduler[Scheduler Service]
    API --> Analytics[Analytics Service]

    Payment --> Stripe[Stripe API]
    LinkedIn --> LI_API[LinkedIn API]
    AI --> ASI1[ASI:One]
    Scheduler --> Cron[Background Jobs]
    Auth --> DB[(Supabase)]
    Payment --> DB
    LinkedIn --> DB
    AI --> DB
    Scheduler --> DB
    Analytics --> DB

    style API fill:#404040,stroke:#262626,color:#fff
    style DB fill:#525252,stroke:#404040,color:#fff
    style Stripe fill:#404040,stroke:#262626,color:#fff
    style LI_API fill:#262626,stroke:#0a0a0a,color:#fff
    style ASI1 fill:#0a0a0a,stroke:#737373,color:#fff`}
                id="backend-services-diagram"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Storage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mb-8 sm:mb-12"
        >
          <Card className="border-2">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">Data Storage</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                How data is stored in Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <MermaidDiagram
                chart={`graph TD
    App[Application] --> DB[(Supabase PostgreSQL)]
    DB --> Users[users table]
    DB --> Payments[payments table]
    DB --> Posts[generated_posts table]
    DB --> Schedules[scheduled_posts table]
    DB --> LinkedIn[linkedin_connections table]
    DB --> Templates[templates table]

    Users --> RLS[Row Level Security]
    Payments --> RLS
    Posts --> RLS
    Schedules --> RLS
    LinkedIn --> RLS
    Templates --> RLS

    style DB fill:#525252,stroke:#404040,color:#fff
    style RLS fill:#404040,stroke:#0a0a0a,color:#fff`}
                id="data-storage-diagram"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* FET/Stripe Usage Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
        >
          <Card className="border-2">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">Stripe and FET Usage</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                How FET/Stripe is used across different services and technologies
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <MermaidDiagram
                chart={`graph TB
    subgraph "Payment Entry Points"
        User[User] -->|Web Dashboard| Web[Stripe Checkout $4.99 / 10 uses]
        User -->|Agent Chat| Chat[ASI:One FET Payment Protocol]
        Web --> Payment[Payment Service]
        Chat --> Payment
        Payment -->|Verify| PayAPI[Stripe API + Fetch Ledger]
    end

    subgraph "Services Using Payments"
        Payment -->|Payment Verified| AI[AI Post Generation]
        Payment -->|Payment Verified| LinkedIn[LinkedIn Posting]
        Payment -->|Payment Verified| Schedule[Post Scheduling]
        Payment -->|Payment Verified| URL[URL to Post]
        Payment -->|Payment Verified| Template[Template Management]
    end

    subgraph "Technologies"
        AI -->|Uses| ASI1[ASI:One]
        LinkedIn -->|Uses| LinkedIn_API[LinkedIn API]
        Schedule -->|Uses| Cron[Background Scheduler]
        URL -->|Uses| ASI1
        Template -->|Uses| Supabase[(Supabase DB)]
    end

    subgraph "Deployment"
        PayAPI -->|Runs on| Railway[Railway]
        ASI1 -->|Runs on| Railway
        Cron -->|Runs on| Railway
        Supabase -->|Hosted on| SupaCloud[Supabase Cloud]
    end

    style User fill:#171717,stroke:#000000,color:#fff
    style Web fill:#171717,stroke:#000000,color:#fff
    style Chat fill:#171717,stroke:#000000,color:#fff
    style Payment fill:#404040,stroke:#262626,color:#fff
    style PayAPI fill:#404040,stroke:#262626,color:#fff
    style AI fill:#262626,stroke:#0a0a0a,color:#fff
    style LinkedIn fill:#262626,stroke:#0a0a0a,color:#fff
    style Schedule fill:#262626,stroke:#0a0a0a,color:#fff
    style URL fill:#262626,stroke:#0a0a0a,color:#fff
    style Template fill:#262626,stroke:#0a0a0a,color:#fff
    style ASI1 fill:#0a0a0a,stroke:#737373,color:#fff
    style Railway fill:#404040,stroke:#262626,color:#fff
    style SupaCloud fill:#525252,stroke:#404040,color:#fff
    style Supabase fill:#525252,stroke:#404040,color:#fff`}
                id="payment-usage-diagram"
              />
            </CardContent>
          </Card>
        </motion.div>
        <LandingFooter />
      </div>
    </div>
  )
}