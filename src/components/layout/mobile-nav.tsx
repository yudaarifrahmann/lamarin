'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Send, Sparkles } from 'lucide-react'
import { NAV_ITEMS } from '@/components/layout/nav-items'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
            aria-label="Buka menu navigasi"
          />
        }
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-0 flex flex-col justify-between">
        <div>
          {/* Brand Header */}
          <SheetHeader className="h-16 px-6 border-b border-border/60 flex flex-row items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <Send className="h-4 w-4" />
            </div>
            <div className="flex flex-col text-left">
              <SheetTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-1.5">
                lamarin
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                  v0.1
                </Badge>
              </SheetTitle>
              <span className="text-[11px] text-muted-foreground">
                Automated Job Application
              </span>
            </div>
          </SheetHeader>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
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
                  onClick={() => setOpen(false)}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                    )}
                  />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Info Box */}
        <div className="p-4 border-t border-border/60">
          <div className="rounded-lg border border-border/70 bg-muted/40 p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Mode Personal</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Tersambung ke Supabase Storage & Database PostgreSQL.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

