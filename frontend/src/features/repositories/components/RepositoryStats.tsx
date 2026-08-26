import { useRepositories } from '@/features/repositories/hooks/useRepositories'
import type { RepositoryStatus } from '@/types/api'

const cells: { label: string; status?: RepositoryStatus }[] = [
  { label: 'Repositories' },
  { label: 'Ready', status: 'ready' },
  { label: 'In progress', status: 'analyzing' },
  { label: 'Failed', status: 'failed' },
]

export function RepositoryStats() {
  const { data } = useRepositories()
  const items = data?.items ?? []

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cells.map(({ label, status }) => {
        // `queued` counts as in progress — it is waiting on the same worker.
        const count = status
          ? items.filter((repository) =>
              status === 'analyzing'
                ? repository.status === 'analyzing' ||
                  repository.status === 'queued'
                : repository.status === status,
            ).length
          : (data?.total ?? 0)

        return (
          <div
            key={label}
            className="rounded-xl border border-line bg-surface px-4 py-3"
          >
            <dt className="font-mono text-xs text-ink-faint">{label}</dt>
            <dd className="mt-1 font-mono text-2xl font-bold tabular-nums">
              {data ? count : '—'}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
