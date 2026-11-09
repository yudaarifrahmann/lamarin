import * as React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center animate-in fade-in-50 sm:p-12',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground ring-1 ring-border shadow-xs mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight mb-1">
        {title}
      </h3>
      <p className="max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
        {description}
      </p>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  )
}

