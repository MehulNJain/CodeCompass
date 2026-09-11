import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/client'
import { authKeys } from '@/features/auth/hooks/useAuth'

const isClientError = (error: unknown) =>
  error instanceof ApiError && error.status >= 400 && error.status < 500

/*
 * A 401 from any request means the session is gone — it expired, or the user
 * signed out in another tab. Marking them signed out here sends RequireAuth
 * back to /login, instead of each screen rendering its own error for it.
 */
function handleUnauthorized(error: unknown) {
  if (error instanceof ApiError && error.status === 401) {
    queryClient.setQueryData(authKeys.me, null)
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleUnauthorized }),
  mutationCache: new MutationCache({ onError: handleUnauthorized }),
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchOnWindowFocus: false,
      // A 4xx will not fix itself on a retry. Retry once, and only failures
      // that might be transient — the network, or a 5xx.
      retry: (failureCount, error) => failureCount < 1 && !isClientError(error),
    },
  },
})
