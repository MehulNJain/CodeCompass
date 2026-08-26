/*
 * The one place that talks to the network.
 *
 * In development Vite proxies /api to the FastAPI process on :8000
 * (see vite.config.ts), so the base URL stays relative and there is no
 * environment variable to forget.
 */

const BASE_URL = '/api/v1'

/** An error carrying the status code and the backend's `detail` message. */
export class ApiError extends Error {
  // Declared explicitly rather than as constructor parameter properties —
  // tsconfig has `erasableSyntaxOnly`, which rules that shorthand out.
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }

  /** 501 means the route exists but its module is not built yet. */
  get isNotImplemented(): boolean {
    return this.status === 501
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      ...init,
    })
  } catch {
    // fetch only rejects when the request never completed — the API is down.
    throw new ApiError(0, 'Could not reach the API. Is the backend running?')
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response))
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json()
    // FastAPI: a string for our domain errors, an array for 422 validation.
    if (typeof body.detail === 'string') return body.detail
    if (Array.isArray(body.detail) && body.detail[0]?.msg) {
      return body.detail[0].msg
    }
  } catch {
    // fall through to the generic message
  }
  return `Request failed (${response.status}).`
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
}
