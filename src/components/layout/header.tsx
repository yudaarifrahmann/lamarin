'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PlusCircle, ShieldCheck, LogOut, Settings2, FolderArchive, User as UserIcon } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { MobileNav } from '@/components/layout/mobile-nav'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/components/layout/nav-items'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { logoutAction } from '@/app/auth/actions'
import type { ProfileData } from '@/services/auth'

interface HeaderProps {
  user?: User | null
  profile?: ProfileData | null
}

export function Header({ user, profile }: HeaderProps) {
  const pathname = usePathname()

  const currentItem = NAV_ITEMS.find((item) =>
    item.href === '/'
      ? pathname === '/'
      : pathname === item.href || pathname.startsWith(`${item.href}/`)
  ) || {
    title: 'Dashboard',
    description: 'Aplikasi Otomasi Lamaran Kerja',
  }

  // Derive display values
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
    <header className="sticky top-0 z-40 h-16 w-full border-b border-border/60 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 transition-all">
      {/* Left Section: Mobile Nav + Current View Info */}
      <div className="flex items-center gap-3">
        <MobileNav />
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
            {currentItem.title}
          </h1>
          <p className="hidden sm:block text-xs text-muted-foreground">
            {currentItem.description}
          </p>
        </div>
      </div>

      {/* Right Section: Actions & Utilities */}
      <div className="flex items-center gap-2 sm:gap-3">
        {pathname !== '/kirim-lamaran' && (
          <Link
            href="/kirim-lamaran"
            className={cn(
              buttonVariants({ size: 'sm' }),
              'h-8 gap-1.5 shadow-xs font-medium text-xs hidden sm:inline-flex'
            )}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Kirim Lamaran</span>
          </Link>
        )}

        <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Supabase Status Pill */}
        <Tooltip>
          <TooltipTrigger
            render={
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-[11px] text-muted-foreground border border-border/50 select-none cursor-default" />
            }
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Supabase Ready</span>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Koneksi database PostgreSQL & Storage siap dihubungkan
          </TooltipContent>
        </Tooltip>

        {/* User Profile & Logout Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                aria-label="Menu akun pengguna"
              />
            }
          >
            <Avatar className="h-8 w-8 border border-border text-xs hover:border-primary/50 transition-colors">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-semibold leading-none text-foreground truncate">
                  {displayName}
                </p>
                <p className="text-[11px] leading-none text-muted-foreground truncate font-mono">
                  {email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              render={<Link href="/konfigurasi-email" />}
              className="cursor-pointer flex items-center gap-2"
            >
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <span>Pengaturan Email</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              render={<Link href="/manajemen-dokumen" />}
              className="cursor-pointer flex items-center gap-2"
            >
              <FolderArchive className="h-4 w-4 text-muted-foreground" />
              <span>Manajemen Dokumen</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Logout item via form action */}
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer flex items-center gap-2 text-destructive focus:text-destructive"
              onClick={() => logoutAction()}
            >
              <LogOut className="h-4 w-4 text-destructive" />
              <span>Keluar (Logout)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
