import * as React from 'react'
import { LucideIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number | string
  description?: string
  icon: LucideIcon
  className?: string
  iconColor?: string
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  className,
  iconColor = 'text-muted-foreground',
}: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden transition-all duration-200 hover:shadow-sm border-border/80', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn('p-2 rounded-lg bg-muted/60', iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <div className="px-4 pb-4">
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
    </Card>
  )
}

