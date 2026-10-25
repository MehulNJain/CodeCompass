import type { ReactNode } from 'react'
import { AlertCircle, FileSearch, Loader2 } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/common/Skeleton'
import { useWorkspace } from '@/pages/repository/workspace'
import type { Graph } from '@/types/api'

/*
 * Every analysis view needs the same gate: nothing to show before the first
 * successful analysis, a skeleton while the graph loads, and a plain message
 * when there is no Python to analyse.
 */
export function AnalysisGate({
  children,
}: {
  children: (graph: Graph) => ReactNode
}) {
  const { repository, graph } = useWorkspace()

  if (repository.last_analyzed_commit === null) {
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
        description="Cloning, parsing, and ranking. This fills in by itself when it is done."
      />
    )
  }
  if (graph.isPending) return <Skeleton className="h-[32rem] w-full" />
  if (graph.isError) {
    return <ErrorState error={graph.error} onRetry={() => graph.refetch()} />
  }
  if (!graph.data.files.some((f) => f.importance_score > 0)) {
    return (
      <EmptyState
        icon={FileSearch}
        title="No Python files found"
        description="Only Python is analysed for now. JavaScript and TypeScript are next."
      />
    )
  }
  return <>{children(graph.data)}</>
}
