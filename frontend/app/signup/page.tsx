'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const { signup, loading, jwt } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [updates, setUpdates] = useState(false)

  useEffect(() => {
    if (jwt) {
      router.replace('/onboarding')
    }
  }, [jwt, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    signup(name, email, password)
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Section - Marketing */}
      <div className="hidden lg:flex lg:w-[60%] flex-col justify-between p-16 bg-gradient-to-br from-primary/5 via-background to-muted/20">
        <div className="space-y-16">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">InfluenOne</div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg space-y-8"
          >
            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              The one tool you need for everything related to LinkedIn content.
            </h1>
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg">Easy to use</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg">Verified LinkedIn Partner</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg">AI that captures your writing style</span>
              </div>
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-0">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-background -ml-2 first:ml-0"
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-500 text-xl">★</span>
              ))}
            </div>
            <span className="text-muted-foreground ml-1">Join 100,000+ users</span>
          </div>
        </motion.div>
      </div>

      {/* Right Section - Signup Form */}
      <div className="flex-1 lg:w-[40%] flex items-center justify-center p-4 sm:p-8 lg:p-16">
        <div className="w-full max-w-7xl">
          <div className="flex justify-between items-center mb-8 lg:hidden">
            <div className="text-xl font-bold">InfluenOne</div>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border shadow-lg w-full">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold">Free signup</CardTitle>
                <CardDescription className="text-base">Create your InfluenOne account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <span className="text-xs text-muted-foreground">Min. 10 characters</span>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={10}
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 pt-1">
                    <Checkbox
                      id="updates"
                      checked={updates}
                      onCheckedChange={(checked) => setUpdates(checked === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="updates" className="text-sm font-normal cursor-pointer leading-relaxed">
                      Send me updates and exclusive offers
                    </Label>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 text-base font-medium"
                    size="lg"
                  >
                    {loading ? 'Creating account...' : 'Create an account'}
                  </Button>
                </form>
                <div className="text-center text-sm text-muted-foreground pt-2">
                  Already registered?{' '}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Log in
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
