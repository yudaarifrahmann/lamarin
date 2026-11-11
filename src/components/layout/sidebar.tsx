'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Send, Sparkles, LogOut } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { NAV_ITEMS } from '@/components/layout/nav-items'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { logoutAction } from '@/app/auth/actions'
import type { ProfileData } from '@/services/auth'

interface SidebarProps {
  className?: string
  user?: User | null
  profile?: ProfileData | null
}

export function Sidebar({ className, user, profile }: SidebarProps) {
  const pathname = usePathname()

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0] : 'Owner')

  const email = user?.email || 'owner@lamarin.app'

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0].toUpperCase())
    .join('') || 'LM'

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col w-64 border-r border-border bg-card/60 backdrop-blur-xl h-screen sticky top-0 shrink-0 select-none transition-all',
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-border/60 gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
          <Send className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold tracking-tight text-foreground text-base">
              lamarin
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
              v0.1
            </Badge>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Automated Job Application
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
          Menu Utama
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform group-hover:scale-105',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span className="truncate">{item.title}</span>
              {isActive && (
                <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary-foreground/80 animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer Info & User Card */}
      <div className="p-3 border-t border-border/60 space-y-3">
        {user ? (
          <div className="rounded-xl border border-border/70 bg-muted/40 p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-8 w-8 border border-border shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-muted-foreground truncate font-mono">
                  {email}
                </p>
              </div>
            </div>
            <button
              onClick={() => logoutAction()}
              title="Keluar (Logout)"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              aria-label="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-border/70 bg-muted/40 p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Mode Personal</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Tersambung aman dengan Supabase Auth & PostgreSQL.
            </p>
          </div>
        )}

        <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground px-1">
          <span>&copy; 2026 Lamarin</span>
          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors underline underline-offset-2"
          >
            Kebijakan Privasi
          </Link>
        </div>
      </div>
    </aside>
  )
}
