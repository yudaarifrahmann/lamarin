'use client'

import * as React from 'react'
import { BarChart3, TrendingUp, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/empty-state'
import { cn } from '@/lib/utils'

export interface DailyActivityItem {
  date: string // YYYY-MM-DD
  label: string // e.g. "09 Nov"
  dayName: string // e.g. "Sen"
  count: number
}

interface ActivityChartProps {
  data: DailyActivityItem[]
}

export function ActivityChart({ data }: ActivityChartProps) {
  const [activeItem, setActiveItem] = React.useState<DailyActivityItem | null>(null)

  const totalCount = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.count, 0)
  }, [data])

  const maxCount = React.useMemo(() => {
    const max = Math.max(...data.map((d) => d.count), 0)
    return max > 0 ? max : 1
  }, [data])

  const activeDaysCount = React.useMemo(() => {
    return data.filter((d) => d.count > 0).length
  }, [data])

  if (totalCount === 0) {
    return (
      <Card className="border-border/80 bg-card">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2 text-foreground">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span>Grafik Aktivitas Pengiriman</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Tren volume pengiriman lamaran kerja dalam 14 hari terakhir
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md">
              <Calendar className="h-3.5 w-3.5" />
              <span>14 Hari Terakhir</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <EmptyState
            icon={BarChart3}
            title="Belum Ada Aktivitas Pengiriman"
            description="Grafik pengiriman akan otomatis terbentuk setelah Anda mengirimkan lamaran pertama melalui sistem."
            className="border-dashed py-8"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/80 bg-card">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-0.5">
            <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2 text-foreground">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span>Grafik Aktivitas Pengiriman</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Frekuensi dan volume lamaran kerja per hari dalam 14 hari terakhir
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-md border border-border/60">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold text-foreground">{totalCount}</span>
              <span>lamaran ({activeDaysCount} hari aktif)</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Active item hover banner */}
        <div className="h-6 mb-3 flex items-center justify-between text-xs text-muted-foreground">
          {activeItem ? (
            <div className="flex items-center gap-2 font-medium">
              <span className="text-foreground">{activeItem.dayName}, {activeItem.label}:</span>
              <span className="text-primary font-bold">{activeItem.count} lamaran dikirim</span>
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground/80">
              Arahkan kursor pada batang grafik untuk melihat rincian tanggal
            </span>
          )}
        </div>

        {/* Bar Chart Container */}
        <div className="w-full overflow-x-auto pb-2">
          <div className="min-w-[500px] h-48 flex items-end gap-2 sm:gap-3 pt-6 pb-2 px-1 border-b border-border/60">
            {data.map((item) => {
              const heightPercentage = item.count > 0 ? Math.max((item.count / maxCount) * 100, 14) : 4
              const isHovered = activeItem?.date === item.date

              return (
                <div
                  key={item.date}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setActiveItem(item)}
                  onMouseLeave={() => setActiveItem(null)}
                >
                  {/* Count indicator above bar */}
                  <span
                    className={cn(
                      'text-[10px] font-semibold mb-1 transition-opacity duration-150',
                      item.count > 0
                        ? isHovered
                          ? 'text-primary opacity-100 font-bold scale-110'
                          : 'text-muted-foreground opacity-80'
                        : 'opacity-0'
                    )}
                  >
                    {item.count}
                  </span>

                  {/* Visual Bar */}
                  <div className="w-full max-w-[28px] h-full flex items-end">
                    <div
                      style={{ height: `${heightPercentage}%` }}
                      className={cn(
                        'w-full rounded-t-sm transition-all duration-200',
                        item.count > 0
                          ? isHovered
                            ? 'bg-primary ring-2 ring-primary/30'
                            : 'bg-primary/90 hover:bg-primary'
                          : 'bg-muted/40 hover:bg-muted/80'
                      )}
                    />
                  </div>

                  {/* Day Label */}
                  <div className="mt-2 text-center select-none">
                    <span
                      className={cn(
                        'block text-[10px] leading-tight transition-colors',
                        isHovered
                          ? 'text-foreground font-semibold'
                          : item.count > 0
                            ? 'text-foreground/80 font-medium'
                            : 'text-muted-foreground/70'
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="block text-[9px] text-muted-foreground/60 leading-none mt-0.5">
                      {item.dayName}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

