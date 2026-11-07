'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { LabAtmosphere } from '@/components/brand/atmosphere'
import { BrandMark } from '@/components/brand/mark'
import { PoweredByAsi } from '@/components/brand/powered-by'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function SignupPage() {
  const { signup, loading, jwt } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [updates, setUpdates] = useState(false)

  useEffect(() => {
    if (jwt) router.replace('/onboarding')
  }, [jwt, router])

  return (
    <div className="relative min-h-screen">
      <LabAtmosphere />
      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="hidden lg:block">
          <BrandMark />
          <h1 className="mt-10 text-5xl font-semibold tracking-tight">
            Join the lab.
            <span className="mt-2 block bg-gradient-to-r from-neutral-900 to-neutral-900 bg-clip-text text-transparent">
              Powered by ASI:One.
            </span>
          </h1>
          <ul className="mt-6 space-y-3 text-muted-foreground">
            <li>ASI:One is the only model</li>
            <li>uAgents + Chat Protocol + Payment Protocol</li>
            <li>Generate, illustrate, pay, post</li>
          </ul>
          <PoweredByAsi className="mt-6" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lab-glass mx-auto w-full max-w-md rounded-3xl p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <BrandMark />
            <Link href="/login" className="text-sm text-muted-foreground">Log in</Link>
          </div>
          <h2 className="text-2xl font-semibold">Create account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Then connect LinkedIn and unlock a Stripe pack</p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              signup(name, email, password)
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={10}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="updates" checked={updates} onCheckedChange={(c) => setUpdates(c === true)} />
              <Label htmlFor="updates" className="text-sm font-normal">Send lab updates</Label>
            </div>
            <Button type="submit" disabled={loading} className="h-11 w-full rounded-full" size="lg">
              {loading ? 'Creating…' : 'Enter the lab'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already in? <Link href="/login" className="text-primary">Log in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
