'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useLinkedIn } from '@/contexts/LinkedInContext'
// Slack integration temporarily disabled
// import { useSlack } from '@/contexts/SlackContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  LayoutDashboard,
  PenSquare,
  Bot,
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
  MessageSquare,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/create', icon: PenSquare, label: 'Create Post' },
  { href: '/ai', icon: Bot, label: 'AI Generator' },
  { href: '/schedule', icon: Calendar, label: 'Scheduler' },
  { href: '/posts', icon: FileText, label: 'My Posts' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/transactions', icon: History, label: 'Transaction History' },
  { href: '/settings/slack', icon: MessageSquare, label: 'Slack' },
]

function SlackStatusCard({ isCollapsed, isMobileView }: { isCollapsed: boolean; isMobileView: boolean }) {
  // Slack integration temporarily disabled - showing "Coming Soon"
  return (
    <Card className="p-3 sm:p-4 space-y-2 sm:space-y-3 border-border/50">
      <AnimatePresence>
        {(!isCollapsed || isMobileView) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm font-semibold"
          >
            Slack
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-2">
        <Badge 
          variant="outline" 
          className={cn(
            "w-full gap-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
            (isCollapsed && !isMobileView) ? "justify-center px-2" : "justify-center"
          )}
        >
          <Clock className="h-3 w-3 flex-shrink-0" />
          <AnimatePresence>
            {(!isCollapsed || isMobileView) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
              >
                Coming Soon
              </motion.span>
            )}
          </AnimatePresence>
        </Badge>
        {(!isCollapsed || isMobileView) && (
          <p className="text-xs text-muted-foreground">
            Slack integration coming soon!
          </p>
        )}
      </div>
    </Card>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { connected, checking, profile, connect, disconnect } = useLinkedIn()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const SidebarContent = ({ isMobileView = false }: { isMobileView?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Header with Toggle - Hidden on mobile since we have fixed header */}
      {!isMobileView && (
        <div className={cn(
          "p-4 sm:p-5 border-b border-border/50 flex items-center gap-2",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {isCollapsed ? (
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground grid place-items-center flex-shrink-0">
              <Link2 className="h-4 w-4" />
            </div>
          ) : (
            <>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary text-primary-foreground grid place-items-center flex-shrink-0">
                      <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm sm:text-base font-bold truncate">InfluenOne</div>
                      <div className="text-xs text-muted-foreground truncate">Automation</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 flex-shrink-0"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-4 pb-2">
        {/* Navigation */}
        <nav className="space-y-1.5">
          <AnimatePresence>
            {(!isCollapsed || isMobileView) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-3"
              >
                Overview
              </motion.div>
            )}
          </AnimatePresence>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="block">
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full gap-3 h-11 rounded-lg transition-all duration-200',
                    isActive 
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                    (isCollapsed && !isMobileView) ? 'justify-center px-0' : 'justify-start px-3'
                  )}
                  title={(isCollapsed && !isMobileView) ? item.label : undefined}
                >
                  <item.icon className={cn(
                    "h-4 w-4 flex-shrink-0",
                    isActive && "text-primary-foreground"
                  )} />
                  <AnimatePresence>
                    {(!isCollapsed || isMobileView) && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="truncate text-sm"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </Link>
            )
          })}
        </nav>

        {(!isCollapsed || isMobileView) && (
          <Card className="p-3 sm:p-4 border-border/50 space-y-2">
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">Innovation Lab</Badge>
            <p className="text-xs text-muted-foreground">ASI-1 · Stripe or FET</p>
          </Card>
        )}

        {/* LinkedIn Status */}
        <Card className="p-3 sm:p-4 space-y-2 sm:space-y-3 border-border/50">
          <AnimatePresence>
            {(!isCollapsed || isMobileView) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-semibold"
              >
                LinkedIn
              </motion.div>
            )}
          </AnimatePresence>
          <div className="space-y-2">
            {checking ? (
              <div className={cn(
                "flex items-center gap-2 text-muted-foreground text-sm",
                (isCollapsed && !isMobileView) && "justify-center"
              )}>
                <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                <AnimatePresence>
                  {(!isCollapsed || isMobileView) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                    >
                      Checking...
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            ) : connected ? (
              <>
                {profile && (!isCollapsed || isMobileView) && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={profile.picture} alt={profile.name || 'LinkedIn'} />
                      <AvatarFallback>
                        {profile.name ? profile.name.charAt(0).toUpperCase() : <User className="h-3 w-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{profile.name || 'LinkedIn User'}</div>
                      {profile.email && (
                        <div className="text-xs text-muted-foreground truncate">{profile.email}</div>
                      )}
                    </div>
                  </div>
                )}
                <Badge 
                  variant="outline" 
                  className={cn(
                    "w-full gap-2 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
                    (isCollapsed && !isMobileView) ? "justify-center px-2" : "justify-center"
                  )}
                >
                  <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                  <AnimatePresence>
                    {(!isCollapsed || isMobileView) && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                      >
                        Connected
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Badge>
                <Button
                  onClick={disconnect}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full",
                    (isCollapsed && !isMobileView) ? "justify-center px-0" : ""
                  )}
                  title={(isCollapsed && !isMobileView) ? "Disconnect" : undefined}
                >
                  <Link2Off className="h-4 w-4 flex-shrink-0" />
                  <AnimatePresence>
                    {(!isCollapsed || isMobileView) && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="ml-2"
                      >
                        Disconnect
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </>
            ) : (
              <Button 
                onClick={connect} 
                className={cn(
                  "w-full",
                  (isCollapsed && !isMobileView) ? "justify-center px-0" : ""
                )}
                size="sm"
                title={(isCollapsed && !isMobileView) ? "Connect LinkedIn" : undefined}
              >
                <Link2 className="h-4 w-4 flex-shrink-0" />
                <AnimatePresence>
                  {(!isCollapsed || isMobileView) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-2"
                    >
                      Connect LinkedIn
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            )}
          </div>
        </Card>

        {/* Slack Status */}
        <SlackStatusCard isCollapsed={isCollapsed} isMobileView={isMobileView} />
      </div>

      {/* Bottom Section - Theme Toggle & Logout */}
      <div className="p-3 sm:p-4 border-t border-border/50 space-y-2 mt-auto flex-shrink-0">
        <div className={cn(
          "flex items-center gap-2",
          (isCollapsed && !isMobileView) && "justify-center"
        )}>
          <ThemeToggle />
          <Button
            onClick={logout}
            variant="ghost"
            className={cn(
              "gap-2",
              (isCollapsed && !isMobileView) ? "flex-1 justify-center px-0" : "flex-1 justify-start"
            )}
            title={(isCollapsed && !isMobileView) ? "Logout" : undefined}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <AnimatePresence>
              {(!isCollapsed || isMobileView) && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 dark:bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 max-w-7xl">
          <div className="flex items-center justify-between gap-2 min-h-[44px] sm:min-h-[48px]">
            <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary text-primary-foreground grid place-items-center flex-shrink-0">
                <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <span className="text-sm sm:text-base font-bold truncate">InfluenOne</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 touch-manipulation"
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 h-screen sticky top-0 shadow-sm",
        isCollapsed ? "w-16 min-w-[64px]" : "w-full max-w-[280px]"
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed left-0 top-[48px] sm:top-[56px] h-[calc(100vh-48px)] sm:h-[calc(100vh-56px)] w-[280px] max-w-[85vw] z-50 bg-card/50 backdrop-blur-sm border-r border-border/50 shadow-sm overflow-y-auto"
            >
              <SidebarContent isMobileView={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
