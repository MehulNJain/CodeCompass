import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { repositoriesApi } from '@/api/repositories'
import type { Page, Repository, RepositoryCreate } from '@/types/api'

export const repositoryKeys = {
  all: ['repositories'] as const,
  list: () => [...repositoryKeys.all, 'list'] as const,
  job: (id: number) => [...repositoryKeys.all, id, 'job'] as const,
}

/** Analysis is asynchronous, so the list polls itself while anything is
 * mid-flight and goes quiet once everything has settled. */
export function useRepositories() {
  return useQuery({
    queryKey: repositoryKeys.list(),
    queryFn: () => repositoriesApi.list(),
    refetchInterval: (query) => {
      const page = query.state.data as Page<Repository> | undefined
      const busy = page?.items.some(
        (repository) =>
          repository.status === 'queued' || repository.status === 'analyzing',
      )
      return busy ? 3000 : false
    },
  })
}

export function useSubmitRepository() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RepositoryCreate) => repositoriesApi.submit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repositoryKeys.list() })
    },
  })
}

/** The job behind one repository. Only fetched when a row is expanded —
 * there is no reason to ask for eight jobs nobody is looking at. */
export function useRepositoryJob(repositoryId: number, enabled: boolean) {
  return useQuery({
    queryKey: repositoryKeys.job(repositoryId),
    queryFn: () => repositoriesApi.latestJob(repositoryId),
    enabled,
    refetchInterval: (query) =>
      query.state.data?.state === 'running' ||
      query.state.data?.state === 'pending'
        ? 2000
        : false,
  })
}
