import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ErrorState } from '@/components/common/ErrorState'
import { useCurrentUser } from '@/features/auth/hooks/useAuth'

/*
 * Route guards decide which screen to show. They are not the security — the
 * API checks the session on every request regardless. They exist so a
 * signed-out visitor lands on the sign-in form, not a page full of 401s.
 */

type ReturnState = { from?: string } | null

export function RequireAuth() {
  const { data: user, isPending, isError, error, refetch } = useCurrentUser()
  const location = useLocation()

  if (isPending) {
    // Blank on purpose: on a working connection this lasts milliseconds, and a
    // spinner shown for that long reads as a flicker.
    return (
      <p role="status" className="sr-only">
        Checking your session…
      </p>
    )
  }

  if (isError) {
    return (
      <div className="grid min-h-svh place-items-center px-4">
        <div className="w-full max-w-md">
          <ErrorState error={error} onRetry={() => refetch()} />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

/** Keeps a signed-in user off /login and /signup — and is also what moves
 * them on once the form succeeds, back to wherever they were sent from. */
export function RedirectIfSignedIn() {
  const { data: user } = useCurrentUser()
  const location = useLocation()

  if (user) {
    const from = (location.state as ReturnState)?.from
    // Router state cannot be set from a URL, but accept only in-app paths
    // anyway — never `//evil.example`.
    const target = from?.startsWith('/') && !from.startsWith('//') ? from : '/dashboard'
    return <Navigate to={target} replace />
  }

  return <Outlet />
}
