import * as React from 'react'
import Link from 'next/link'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground mx-auto border border-border/80">
          <FileQuestion className="h-8 w-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Halaman yang Anda tuju tidak ditemukan atau telah dipindahkan. Periksa kembali tautan yang Anda masukkan.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className={cn(buttonVariants({ size: 'default' }), 'gap-2 shadow-xs')}
          >
            <Home className="h-4 w-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

