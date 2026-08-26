import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line px-6 py-16 text-center">
      <Icon className="size-7 text-ink-faint" aria-hidden="true" />
      <p className="mt-4 font-mono text-base font-semibold">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
