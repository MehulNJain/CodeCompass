import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchOnWindowFocus: false,
      // A 4xx will not fix itself on a retry; only retry once, for flakiness.
      retry: 1,
    },
  },
})
