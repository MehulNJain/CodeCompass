import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  FileSearch,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/common/Skeleton'
import { Button, ButtonLink } from '@/components/ui/Button'
import { StatusBadge } from '@/features/repositories/components/StatusBadge'
import { DeleteRepositoryButton } from '@/features/repositories/components/DeleteRepositoryButton'
import { DependencyGraph } from '@/features/graph/components/DependencyGraph'
import { StartHereList } from '@/features/graph/components/StartHereList'
import {
  useRepository,
  useRepositoryGraph,
  useSubmitRepository,
} from '@/features/repositories/hooks/useRepositories'
import { relativeTime } from '@/utils/format'
import type { Graph, Repository } from '@/types/api'

// ponytail: the top 40 files in both the list and the graph; a "show all"
// toggle when someone needs the long tail.
const TOP = 40

export default function RepositoryPage() {
  const id = Number(useParams().id)
  const repository = useRepository(id)
  const graph = useRepositoryGraph(
    id,
    repository.data?.last_analyzed_commit ?? null,
  )

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <ButtonLink to="/dashboard" variant="ghost" className="-ml-3 mb-4">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Repositories
        </ButtonLink>

        {repository.isPending ? (
          <Skeleton className="h-16 w-full max-w-lg" />
        ) : repository.isError ? (
          <ErrorState
            error={repository.error}
            onRetry={() => repository.refetch()}
          />
        ) : (
          <>
            <Header
              repository={repository.data}
              fileCount={graph.data?.files.length}
            />
            <div className="mt-8">
              <Body repository={repository.data} graph={graph} />
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
    <header className="flex flex-wrap items-start justify-between gap-4">
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
            className="inline-flex items-center gap-1 hover:text-accent"
          >
            Source
            <ExternalLink className="size-3" aria-hidden="true" />
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

function Body({
  repository,
  graph,
}: {
  repository: Repository
  graph: ReturnType<typeof useRepositoryGraph>
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  if (repository.last_analyzed_commit === null) {
    // Never analysed successfully, so there is nothing to show yet.
    return repository.status === 'failed' ? (
      <EmptyState
        icon={AlertCircle}
        title="Analysis failed"
        description="Expand this repository on the Repositories page to see the error, then re-analyse."
      />
    ) : (
      <EmptyState
        icon={Loader2}
        iconClassName="motion-safe:animate-spin"
        title="Analysing…"
        description="Cloning, parsing, and ranking. This page fills in by itself when it is done."
      />
    )
  }

  if (graph.isPending) return <Skeleton className="h-[32rem] w-full" />
  if (graph.isError) {
    return <ErrorState error={graph.error} onRetry={() => graph.refetch()} />
  }

  const ranked = rankedFiles(graph.data)
  if (ranked.files.length === 0) {
    return (
      <EmptyState
        icon={FileSearch}
        title="No Python files found"
        description="Only Python is analysed for now. JavaScript and TypeScript are next."
      />
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <section aria-labelledby="start-here" className="min-w-0">
        <h2 id="start-here" className="font-mono text-sm font-semibold">
          Start here
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          Ranked by how much of the codebase depends on each file. Select one to
          see its connections.
        </p>
        <div className="mt-3 max-h-[36rem] overflow-y-auto pr-1 lg:max-h-[calc(100vh-16rem)]">
          <StartHereList
            files={ranked.files}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </section>

      <section
        aria-label="Dependency graph"
        className="h-[32rem] min-w-0 overflow-hidden rounded-xl border border-line bg-canvas lg:h-[calc(100vh-12rem)]"
      >
        <DependencyGraph
          key={repository.last_analyzed_commit}
          files={ranked.files}
          edges={ranked.edges}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </section>
    </div>
  )
}

/** The top files that took part in the analysis (score above 0 — README and
 * other non-Python files score 0), and only the edges between them. */
function rankedFiles(graph: Graph) {
  const files = graph.files.filter((f) => f.importance_score > 0).slice(0, TOP)
  const ids = new Set(files.map((f) => f.id))
  const edges = graph.edges.filter(
    (e) => ids.has(e.source) && ids.has(e.target),
  )
  return { files, edges }
}
