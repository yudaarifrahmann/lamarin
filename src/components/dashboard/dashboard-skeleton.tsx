import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Header Banner Skeleton */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 space-y-4">
        <Skeleton className="h-5 w-36 rounded-full" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </div>

      {/* 4 Stat Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/80 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <div className="px-4 pb-4 space-y-2">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Shortcuts Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="border-border/80 bg-card">
            <CardContent className="p-5 flex items-start justify-between gap-4">
              <div className="space-y-3 w-full">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-6 w-6 rounded-full mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card className="border-border/80 bg-card">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-6 w-28 rounded-md" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Skeleton className="h-48 w-full rounded-md" />
        </CardContent>
      </Card>

      {/* 2-Column Grid: Activities & Companies Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="border-border/80 bg-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex justify-between items-center py-2">
                  <div className="space-y-1.5 w-2/3">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-md" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

