'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useLinkedIn } from '@/contexts/LinkedInContext'
import { usePayment } from '@/contexts/PaymentContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/theme-toggle'
import { BrandMark } from '@/components/brand/mark'
import { AgentStatus } from '@/components/agent-status'
import {
  LayoutDashboard,
  PenSquare,
  Sparkles,
  Calendar,
  LogOut,
  Link2,
  Link2Off,
  Loader2,
  CheckCircle2,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  FileText,
  History,
  BarChart3,
  Mic,
  Images,
  Radio,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Command' },
  { href: '/ai', icon: Sparkles, label: 'Studio' },
  { href: '/url-to-post', icon: Link2, label: 'URL → post' },
  { href: '/voice', icon: Mic, label: 'Voice kit' },
  { href: '/gallery', icon: Images, label: 'Gallery' },
  { href: '/create', icon: PenSquare, label: 'Write' },
  { href: '/schedule', icon: Calendar, label: 'Schedule' },
  { href: '/posts', icon: FileText, label: 'Posts' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/agent', icon: Radio, label: 'Agentverse' },
  { href: '/transactions', icon: History, label: 'Payments' },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { connected, checking, profile, connect, disconnect } = useLinkedIn()
  const { creditsRemaining, packSize, hasPaid } = usePayment()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) setIsMobileOpen(false)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const SidebarContent = ({ isMobileView = false }: { isMobileView?: boolean }) => {
    const showLabel = !isCollapsed || isMobileView
    return (
      <div className="flex h-full flex-col">
        {!isMobileView && (
          <div className={cn('flex items-center border-b border-border p-3', isCollapsed ? 'flex-col gap-2' : 'justify-between p-4')}>
            <BrandMark compact={isCollapsed} href="/dashboard" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        )}

        <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} className="block">
                  <Button
                    variant="ghost"
                    title={item.label}
                    className={cn(
                      'h-10 w-full gap-3 rounded-xl',
                      isActive
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      showLabel ? 'justify-start px-3' : 'justify-center px-0'
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {showLabel && <span className="truncate text-sm">{item.label}</span>}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {showLabel && (
            <div className="lab-glass space-y-2 rounded-xl p-3">
              <Badge variant="outline" className="border-[#3D8BD3]/40 text-secondary">Innovation Lab</Badge>
              <p className="text-xs text-muted-foreground">
                {hasPaid ? `${creditsRemaining} / ${packSize} ASI:One uses` : 'Stripe pack · 10 uses'}
              </p>
              <AgentStatus />
            </div>
          )}

          <div className="lab-glass space-y-2 rounded-xl p-3">
            {showLabel && <div className="text-xs font-medium">LinkedIn</div>}
            {checking ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {showLabel && <span>Checking…</span>}
              </div>
            ) : connected ? (
              <>
                {profile && showLabel && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.picture} alt={profile.name || 'LinkedIn'} />
                      <AvatarFallback>
                        {profile.name ? profile.name.charAt(0).toUpperCase() : <User className="h-3 w-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium">{profile.name || 'LinkedIn'}</div>
                    </div>
                  </div>
                )}
                <Badge variant="outline" className="w-full justify-center gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {showLabel && 'Live'}
                </Badge>
                <Button onClick={disconnect} variant="outline" size="sm" className="w-full">
                  <Link2Off className="h-4 w-4" />
                  {showLabel && <span className="ml-2">Disconnect</span>}
                </Button>
              </>
            ) : (
              <Button onClick={connect} size="sm" className="w-full">
                <Link2 className="h-4 w-4" />
                {showLabel && <span className="ml-2">Connect</span>}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2 border-t border-border p-3">
          <ThemeToggle />
          <Button onClick={logout} variant="ghost" className={cn('flex-1 gap-2', showLabel ? 'justify-start' : 'justify-center px-0')}>
            <LogOut className="h-4 w-4" />
            {showLabel && 'Logout'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md md:hidden">
        <div className="flex min-h-[52px] items-center justify-between px-3">
          <BrandMark href="/dashboard" />
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(!isMobileOpen)}>
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <aside
        className={cn(
          'sticky top-0 hidden h-screen flex-col border-r border-border bg-card/40 backdrop-blur-xl md:flex',
          isCollapsed ? 'w-16 min-w-[64px]' : 'w-full max-w-[272px]'
        )}
      >
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {isMobileOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed left-0 top-[52px] z-50 h-[calc(100vh-52px)] w-[280px] overflow-y-auto border-r border-border bg-card/95 backdrop-blur-xl md:hidden"
            >
              <SidebarContent isMobileView />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
