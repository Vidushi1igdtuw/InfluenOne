'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Link2, Menu, X, User } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { jwt, user, logout } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-background/95 dark:bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 md:py-4 max-w-7xl">
        <div className="bg-background/80 dark:bg-background/90 backdrop-blur-md border border-border/50 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 shadow-lg">
          <div className="flex items-center justify-between gap-2 min-h-[44px] sm:min-h-[48px]">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-0"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg bg-primary text-primary-foreground grid place-items-center flex-shrink-0">
                  <Link2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                </div>
                <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold truncate">InfluenOne</span>
              </motion.div>
            </Link>
            <div className="hidden md:flex items-center gap-2 lg:gap-4 flex-shrink-0">
              <ThemeToggle />
              {jwt ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="rounded-full flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={user?.picture} alt={user?.name || 'User'} />
                          <AvatarFallback>
                            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden lg:inline">{user?.name || user?.email || 'User'}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                          {user?.email && (
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                          )}
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/signup">
                    <Button className="rounded-full">Try for free</Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="ghost" className="rounded-full">Login</Button>
                  </Link>
                </>
              )}
            </div>
            <div className="md:hidden flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9 sm:h-10 sm:w-10 touch-manipulation"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50 space-y-2 sm:space-y-3 overflow-hidden pb-2"
            >
              {jwt ? (
                <>
                  <div className="p-3 sm:p-4 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                        <AvatarImage src={user?.picture} alt={user?.name || 'User'} />
                        <AvatarFallback>
                          {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm sm:text-base font-medium truncate">{user?.name || user?.email || 'User'}</div>
                      </div>
                    </div>
                  </div>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block w-full">
                    <Button variant="ghost" className="w-full rounded-full text-sm sm:text-base h-10 sm:h-11 touch-manipulation justify-start">Dashboard</Button>
                  </Link>
                  <Button 
                    onClick={() => { logout(); setMobileMenuOpen(false); }} 
                    variant="ghost" 
                    className="w-full rounded-full text-sm sm:text-base h-10 sm:h-11 touch-manipulation justify-start"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block w-full">
                    <Button className="w-full rounded-full text-sm sm:text-base h-10 sm:h-11 touch-manipulation">Try for free</Button>
                  </Link>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full">
                    <Button variant="ghost" className="w-full rounded-full text-sm sm:text-base h-10 sm:h-11 touch-manipulation">Login</Button>
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </header>
  )
}

