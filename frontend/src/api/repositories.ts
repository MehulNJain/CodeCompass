import { api } from '@/api/client'
import type { Job, Page, Repository, RepositoryCreate } from '@/types/api'

export const repositoriesApi = {
  list: (limit = 20, offset = 0) =>
    api.get<Page<Repository>>(`/repositories?limit=${limit}&offset=${offset}`),

  get: (id: number) => api.get<Repository>(`/repositories/${id}`),

  /** Returns the queued job, not the repository — analysis is asynchronous. */
  submit: (payload: RepositoryCreate) =>
    api.post<Job>('/repositories', payload),

  latestJob: (id: number) => api.get<Job>(`/repositories/${id}/job`),
}
