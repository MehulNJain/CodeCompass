import { AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import type { RepositoryStatus } from '@/types/api'

/*
 * Status is never carried by colour alone — each state has its own icon and
 * word, so it survives a colour-blind reader and a greyscale printout.
 */
const styles: Record<
  RepositoryStatus,
  { label: string; icon: typeof Clock; className: string; spin?: boolean }
> = {
  queued: {
    label: 'Queued',
    icon: Clock,
    className: 'border-line-strong text-ink-muted',
  },
  analyzing: {
    label: 'Analysing',
    icon: Loader2,
    className: 'border-accent/40 text-accent',
    spin: true,
  },
  ready: {
    label: 'Ready',
    icon: CheckCircle2,
    className: 'border-accent/40 text-accent',
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    className: 'border-danger/40 text-danger',
  },
}

export function StatusBadge({ status }: { status: RepositoryStatus }) {
  const { label, icon: Icon, className, spin } = styles[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs ${className}`}
    >
      <Icon
        className={`size-3.5 ${spin ? 'animate-spin' : ''}`}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
