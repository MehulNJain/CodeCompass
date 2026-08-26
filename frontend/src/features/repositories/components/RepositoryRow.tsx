import { useState } from 'react'
import { ChevronDown, GitBranch } from 'lucide-react'
import { StatusBadge } from '@/features/repositories/components/StatusBadge'
import { JobDetail } from '@/features/repositories/components/JobDetail'
import { relativeTime, shortUrl } from '@/utils/format'
import type { Repository } from '@/types/api'

export function RepositoryRow({ repository }: { repository: Repository }) {
  const [expanded, setExpanded] = useState(false)
  const panelId = `repository-${repository.id}-job`

  return (
    <li className="overflow-hidden rounded-xl border border-line bg-surface">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((open) => !open)}
        className="flex w-full cursor-pointer items-center gap-4 px-4 py-4 text-left transition-colors duration-200 hover:bg-surface-2 sm:px-6"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-sm font-semibold text-ink">
            {repository.name}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
            <span className="truncate font-mono">
              {shortUrl(repository.source_url)}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-ink-faint">
              <GitBranch className="size-3" aria-hidden="true" />
              {repository.default_branch}
            </span>
          </p>
        </div>

        <div className="hidden text-right text-xs text-ink-faint sm:block">
          <p>analysed</p>
          <p className="mt-0.5 text-ink-muted">
            {relativeTime(repository.last_analyzed_at)}
          </p>
        </div>

        <StatusBadge status={repository.status} />

        <ChevronDown
          className={`size-4 shrink-0 text-ink-faint transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div id={panelId}>
          <JobDetail repositoryId={repository.id} />
        </div>
      )}
    </li>
  )
}
