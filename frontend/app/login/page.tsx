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

export default function LoginPage() {
  const { login, loading, jwt } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (jwt) router.replace('/')
  }, [jwt, router])

  return (
    <div className="relative min-h-screen">
      <LabAtmosphere />
      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="hidden lg:block">
          <BrandMark />
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.28em] text-[#3D8BD3]">
            Fetch.ai Innovation Lab
          </p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight">
            Intent in.
            <span className="mt-2 block bg-gradient-to-r from-[#5F43F1] to-[#3D8BD3] bg-clip-text text-transparent">
              LinkedIn out.
            </span>
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            ASI:One writes. The agent posts. Powered by ASI:One.
          </p>
          <PoweredByAsi className="mt-6" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lab-glass mx-auto w-full max-w-md rounded-3xl p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <BrandMark />
            <Link href="/signup" className="text-sm text-muted-foreground">Sign up</Link>
          </div>
          <h2 className="text-2xl font-semibold">Enter the lab</h2>
          <p className="mt-1 text-sm text-muted-foreground">Log in to the ASI:One studio</p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              login(email, password)
            }}
          >
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="h-11 w-full rounded-full" size="lg">
              {loading ? 'Opening…' : 'Continue'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            New here? <Link href="/signup" className="text-primary">Create an account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
