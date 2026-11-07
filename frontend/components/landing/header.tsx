'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, User, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { BrandMark } from '@/components/brand/mark'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
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
  const [open, setOpen] = useState(false)
  const { jwt, user, logout } = useAuth()

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6">
        <div className="lab-glass flex min-h-[52px] items-center justify-between gap-3 rounded-2xl px-3 py-2 sm:px-4">
          <BrandMark />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/#pillars" className="hover:text-foreground">Pillars</Link>
            <Link href="/#flow" className="hover:text-foreground">Flow</Link>
            <Link href="/tech-stack" className="hover:text-foreground">Tech</Link>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {jwt ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user?.picture} alt={user?.name || 'User'} />
                      <AvatarFallback>
                        {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline">{user?.name || user?.email || 'Studio'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-sm">{user?.name || 'User'}</p>
                    {user?.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Command center</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="rounded-full">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button className="rounded-full">Enter lab</Button>
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setOpen(!open)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {open && (
          <div className="lab-glass mt-2 space-y-2 rounded-2xl p-3 md:hidden">
            {jwt ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-full">Command center</Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start rounded-full" onClick={() => { logout(); setOpen(false) }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/signup" onClick={() => setOpen(false)}>
                  <Button className="w-full rounded-full">Enter lab</Button>
                </Link>
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full rounded-full">Login</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
