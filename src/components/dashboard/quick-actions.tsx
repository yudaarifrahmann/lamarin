import * as React from 'react'
import Link from 'next/link'
import { Send, FileText, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Shortcut: Kirim Lamaran */}
      <Link
        href="/kirim-lamaran"
        className="group block"
      >
        <Card className="h-full border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30 transition-all duration-200">
          <CardContent className="p-5 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary w-fit border border-primary/20">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                  Kirim Lamaran Kerja
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Tulis pesan resmi, sematkan placeholder otomatis, dan lampirkan portofolio langsung ke email HRD.
                </p>
              </div>
            </div>

            <div className="p-2 rounded-full text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-1">
              <ArrowRight className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Shortcut: Manajemen Dokumen */}
      <Link
        href="/manajemen-dokumen"
        className="group block"
      >
        <Card className="h-full border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30 transition-all duration-200">
          <CardContent className="p-5 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary w-fit border border-primary/20">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                  Manajemen Dokumen
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Unggah CV terbaru, ijazah, dan sertifikat pendukung ke Supabase Storage privat berstandar RLS.
                </p>
              </div>
            </div>

            <div className="p-2 rounded-full text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-1">
              <ArrowRight className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}

