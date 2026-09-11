/*
 * Mirrors the backend's Pydantic schemas. These names are the API contract —
 * `backend/app/core/constants.py` and `backend/app/schemas/` are the source of
 * truth, and a change there is a breaking change here.
 */

export type RepositoryStatus = 'queued' | 'analyzing' | 'ready' | 'failed'

export type JobState = 'pending' | 'running' | 'succeeded' | 'failed'

export type Persona =
  | 'new_contributor'
  | 'bug_fixer'
  | 'feature_builder'
  | 'reviewer'

export interface Repository {
  id: number
  name: string
  source_url: string
  default_branch: string
  status: RepositoryStatus
  last_analyzed_commit: string | null
  last_analyzed_at: string | null
  created_at: string
}

export interface Job {
  id: number
  repository_id: number
  state: JobState
  /** Which pipeline stage the worker is on — documentation §11. */
  stage: string | null
  progress: number
  started_at: string | null
  finished_at: string | null
  error_message: string | null
  created_at: string
}

export interface Page<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export interface RepositoryCreate {
  source_url: string
  default_branch?: string
}

/* --- Authentication — backend/app/schemas/auth.py --- */

export interface User {
  id: number
  email: string
  name: string
  created_at: string
}

export interface SignUpRequest {
  name: string
  email: string
  password: string
}

export interface SignInRequest {
  email: string
  password: string
}
