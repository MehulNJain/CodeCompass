import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { repositoriesApi } from '@/api/repositories'
import type {
  Page,
  Repository,
  RepositoryCreate,
  RepositoryStatus,
} from '@/types/api'

export const repositoryKeys = {
  all: ['repositories'] as const,
  list: () => [...repositoryKeys.all, 'list'] as const,
  detail: (id: number) => [...repositoryKeys.all, id] as const,
  job: (id: number) => [...repositoryKeys.all, id, 'job'] as const,
  graph: (id: number, commit: string | null) =>
    [...repositoryKeys.all, id, 'graph', commit] as const,
}

const isBusy = (status: RepositoryStatus | undefined) =>
  status === 'queued' || status === 'analyzing'

/** Analysis is asynchronous, so the list polls itself while anything is
 * mid-flight and goes quiet once everything has settled. */
export function useRepositories() {
  return useQuery({
    queryKey: repositoryKeys.list(),
    queryFn: () => repositoriesApi.list(),
    refetchInterval: (query) => {
      const page = query.state.data as Page<Repository> | undefined
      return page?.items.some((repository) => isBusy(repository.status))
        ? 3000
        : false
    },
  })
}

export function useSubmitRepository() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RepositoryCreate) => repositoriesApi.submit(payload),
    // Everything under `repositories`: the list, and the repository page when
    // it re-analyses from there.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repositoryKeys.all })
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

/** One repository; polls while it is being analysed. */
export function useRepository(id: number) {
  return useQuery({
    queryKey: repositoryKeys.detail(id),
    queryFn: () => repositoriesApi.get(id),
    refetchInterval: (query) =>
      isBusy(query.state.data?.status) ? 3000 : false,
  })
}

/** Keyed by the analysed commit, so a finished re-analysis fetches afresh.
 * Nothing to fetch before the first analysis succeeds. */
export function useRepositoryGraph(id: number, commit: string | null) {
  return useQuery({
    queryKey: repositoryKeys.graph(id, commit),
    queryFn: () => repositoriesApi.graph(id),
    enabled: commit !== null,
  })
}
