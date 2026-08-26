import { FolderGit2 } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/common/Skeleton'
import { RepositoryRow } from '@/features/repositories/components/RepositoryRow'
import { useRepositories } from '@/features/repositories/hooks/useRepositories'

export function RepositoryList() {
  const { data, isPending, isError, error, refetch } = useRepositories()

  if (isPending) {
    return (
      <ul className="flex flex-col gap-3">
        {[0, 1, 2].map((index) => (
          <li key={index}>
            <Skeleton className="h-[5.5rem] w-full" />
          </li>
        ))}
      </ul>
    )
  }

  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />

  if (data.items.length === 0) {
    return (
      <EmptyState
        icon={FolderGit2}
        title="No repositories yet"
        description="Paste a public Git URL above. The first analysis builds the graph; every one after that only re-reads what changed."
      />
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.items.map((repository) => (
        <RepositoryRow key={repository.id} repository={repository} />
      ))}
    </ul>
  )
}
