'use client'

import * as React from 'react'
import { Loader2, CheckCircle2, XCircle, X, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SendJob } from '@/components/applications/application-form'

interface SendingJobsIndicatorProps {
  jobs: SendJob[]
  onRetry: (jobId: string) => void
  onDismiss: (jobId: string) => void
}

function JobCard({
  job,
  onRetry,
  onDismiss,
}: {
  job: SendJob
  onRetry: (id: string) => void
  onDismiss: (id: string) => void
}) {
  const [expanded, setExpanded] = React.useState(false)

  // Auto-dismiss completed jobs after 5 seconds
  React.useEffect(() => {
    if (job.status === 'done') {
      const timer = setTimeout(() => {
        onDismiss(job.id)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [job.status, job.id, onDismiss])

  return (
    <div
      className={[
        'relative flex flex-col gap-1.5 rounded-lg border shadow-lg p-3 text-xs',
        'bg-background/95 backdrop-blur-sm w-full',
        job.status === 'done'
          ? 'border-emerald-500/40'
          : job.status === 'error'
          ? 'border-destructive/40'
          : 'border-border',
      ].join(' ')}
    >
      {/* Top row: icon + text + dismiss */}
      <div className="flex items-start gap-2">
        <span className="shrink-0 mt-0.5">
          {job.status === 'sending' && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          )}
          {job.status === 'done' && (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          )}
          {job.status === 'error' && (
            <XCircle className="h-3.5 w-3.5 text-destructive" />
          )}
        </span>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground leading-tight">
            {job.status === 'sending' && (
              <span>Mengirim lamaran ke <strong>{job.companyName}</strong></span>
            )}
            {job.status === 'done' && (
              <span>Lamaran ke <strong>{job.companyName}</strong> berhasil dikirim.</span>
            )}
            {job.status === 'error' && (
              <span>Gagal mengirim lamaran ke <strong>{job.companyName}</strong>.</span>
            )}
          </p>
          {job.position && (
            <p className="text-muted-foreground text-[10px] mt-0.5 truncate">
              Posisi: {job.position}
            </p>
          )}
        </div>

        {/* Dismiss button — always visible except while sending */}
        {job.status !== 'sending' && (
          <button
            type="button"
            onClick={() => onDismiss(job.id)}
            aria-label="Tutup notifikasi"
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Error actions */}
      {job.status === 'error' && (
        <div className="flex items-center gap-2 pl-5">
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="h-6 text-[10px] px-2 gap-1"
            onClick={() => onRetry(job.id)}
          >
            <RefreshCw className="h-3 w-3" />
            Coba Lagi
          </Button>

          {job.error && (
            <button
              type="button"
              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
              onClick={() => setExpanded((p) => !p)}
            >
              Detail
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          )}
        </div>
      )}

      {/* Error detail — expandable */}
      {job.status === 'error' && expanded && job.error && (
        <p className="pl-5 text-[10px] text-destructive/80 break-words leading-relaxed">
          {job.error}
        </p>
      )}
    </div>
  )
}

export function SendingJobsIndicator({
  jobs,
  onRetry,
  onDismiss,
}: SendingJobsIndicatorProps) {
  if (jobs.length === 0) return null

  return (
    <div
      className="fixed top-4 left-4 z-50 flex flex-col gap-2 w-[min(calc(100vw-2rem),22rem)] pointer-events-none"
      aria-live="polite"
      aria-label="Status pengiriman lamaran"
    >
      {jobs.map((job) => (
        <div key={job.id} className="pointer-events-auto animate-in fade-in-0 slide-in-from-left-4 duration-300">
          <JobCard job={job} onRetry={onRetry} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}

