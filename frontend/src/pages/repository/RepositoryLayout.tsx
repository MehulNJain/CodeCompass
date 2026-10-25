import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  ChevronRight,
  ExternalLink,
  ListOrdered,
  MessageSquareText,
  RefreshCw,
  Route,
  Share2,
  type LucideIcon,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/common/Skeleton'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/features/repositories/components/StatusBadge'
import { DeleteRepositoryButton } from '@/features/repositories/components/DeleteRepositoryButton'
import {
  useRepository,
  useRepositoryGraph,
  useSubmitRepository,
} from '@/features/repositories/hooks/useRepositories'
import { relativeTime } from '@/utils/format'
import type { Repository } from '@/types/api'

export type WorkspaceContext = {
  repository: Repository
  graph: ReturnType<typeof useRepositoryGraph>
}

const TABS: { to: string; label: string; icon: LucideIcon; soon?: boolean }[] =
  [
    { to: '', label: 'Start here', icon: ListOrdered },
    { to: 'graph', label: 'Graph', icon: Share2 },
    { to: 'tours', label: 'Tours', icon: Route, soon: true },
    { to: 'ask', label: 'Ask', icon: MessageSquareText, soon: true },
  ]

/*
 * One repository's workspace: everything about it lives under
 * /repositories/:id, one tab per view, each with its own URL. The tabs are
 * the only place Tours and Ask appear — "soon" until their modules exist.
 */
export default function RepositoryLayout() {
  const id = Number(useParams().id)
  const repository = useRepository(id)
  const graph = useRepositoryGraph(
    id,
    repository.data?.last_analyzed_commit ?? null,
  )
  // Tabs keep ?file=, so the selected file follows you between views.
  const { search } = useLocation()

  return (
    <AppShell>
      {/* The workspace takes the full width — the graph needs it. */}
      <div className="mx-auto max-w-[120rem]">
        <nav aria-label="Breadcrumb">
          <ol className="flex min-w-0 items-center gap-1.5 text-sm text-ink-muted">
            <li>
              <Link
                to="/dashboard"
                className="transition-colors duration-200 hover:text-ink"
              >
                Repositories
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5 shrink-0 text-ink-faint" />
            </li>
            <li className="truncate font-mono text-ink" aria-current="page">
              {repository.data?.name ?? '…'}
            </li>
          </ol>
        </nav>

        {repository.isPending ? (
          <Skeleton className="mt-6 h-16 w-full max-w-lg" />
        ) : repository.isError ? (
          <div className="mt-6">
            <ErrorState
              error={repository.error}
              onRetry={() => repository.refetch()}
            />
          </div>
        ) : (
          <>
            <Header
              repository={repository.data}
              fileCount={graph.data?.files.length}
            />

            <nav
              aria-label="Repository sections"
              // On phones the tabs scroll sideways; the fade shows there is more.
              className="-mx-4 mt-6 [mask-image:linear-gradient(to_right,black_80%,transparent)] overflow-x-auto border-b border-line px-4 sm:mx-0 sm:[mask-image:none] sm:px-0"
            >
              <ul className="flex gap-1">
                {TABS.map(({ to, label, icon: Icon, soon }) => (
                  <li key={label}>
                    <NavLink
                      to={{ pathname: to, search }}
                      end
                      className={({ isActive }) =>
                        `relative flex min-h-11 items-center gap-2 px-3 text-sm whitespace-nowrap transition-colors duration-200 after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:transition-colors after:duration-200 ${
                          isActive
                            ? 'font-medium text-ink after:bg-accent'
                            : 'text-ink-muted after:bg-transparent hover:text-ink'
                        }`
                      }
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {label}
                      {soon && (
                        <span className="rounded border border-line px-1 font-mono text-[0.625rem] tracking-wide text-ink-faint">
                          SOON
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-6">
              <Outlet
                context={
                  {
                    repository: repository.data,
                    graph,
                  } satisfies WorkspaceContext
                }
              />
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}

function Header({
  repository,
  fileCount,
}: {
  repository: Repository
  fileCount: number | undefined
}) {
  const reanalyse = useSubmitRepository()
  const navigate = useNavigate()
  const busy =
    repository.status === 'queued' || repository.status === 'analyzing'

  return (
    <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="truncate font-mono text-2xl font-bold tracking-tight">
            {repository.name}
          </h1>
          <StatusBadge status={repository.status} />
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
          {repository.last_analyzed_commit && (
            <span className="font-mono">
              commit {repository.last_analyzed_commit.slice(0, 7)}
            </span>
          )}
          {fileCount !== undefined && <span>{fileCount} files</span>}
          <span>analysed {relativeTime(repository.last_analyzed_at)}</span>
          <a
            href={repository.source_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 transition-colors duration-200 hover:text-accent"
          >
            Source
            <ExternalLink className="size-3" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={busy || reanalyse.isPending}
          onClick={() =>
            reanalyse.mutate({
              source_url: repository.source_url,
              default_branch: repository.default_branch,
            })
          }
        >
          <RefreshCw
            className={`size-4 ${busy ? 'motion-safe:animate-spin' : ''}`}
            aria-hidden="true"
          />
          {busy ? 'Analysing…' : 'Re-analyse'}
        </Button>
        <DeleteRepositoryButton
          repository={repository}
          showLabel
          onDeleted={() => navigate('/dashboard')}
        />
      </div>
    </header>
  )
}
