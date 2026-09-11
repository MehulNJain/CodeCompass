import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { ApiError } from '@/api/client'
import type { User } from '@/types/api'

export const authKeys = {
  all: ['auth'] as const,
  me: ['auth', 'me'] as const,
}

/** The signed-in user, or `null` when signed out. A 401 here is an answer,
 * not a failure, so it resolves to `null` instead of throwing. */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async (): Promise<User | null> => {
      try {
        return await authApi.me()
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null
        throw error
      }
    },
    staleTime: 5 * 60_000,
  })
}

/*
 * Everything cached was fetched as whoever was signed in at the time. Drop it
 * whenever the user changes, or the next account briefly sees the previous
 * one's repositories. The auth query itself is updated rather than removed, so
 * the route guards watching it see the change.
 */
function switchUser(queryClient: QueryClient, user: User | null) {
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== authKeys.all[0],
  })
  queryClient.setQueryData(authKeys.me, user)
}

export function useSignIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.signIn,
    onSuccess: (user) => switchUser(queryClient, user),
  })
}

export function useSignUp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.signUp,
    onSuccess: (user) => switchUser(queryClient, user),
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.signOut,
    // Success only. If the request failed, the session is still live on the
    // server, and showing the user as signed out would be false — on a shared
    // computer, dangerously so.
    onSuccess: () => switchUser(queryClient, null),
  })
}
