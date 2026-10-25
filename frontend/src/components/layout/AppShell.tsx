import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { FolderGit2, LogOut, Menu, X } from 'lucide-react'
import { LogoMark } from '@/components/ui/LogoMark'
import type { ReactNode } from 'react'
import { useCurrentUser, useSignOut } from '@/features/auth/hooks/useAuth'

/*
 * App-level navigation is only what exists without a repository. Tours, the
 * graph and Q&A are about one repository, so they live as tabs inside it
 * (/repositories/:id/...) rather than as global entries that lead nowhere.
 */
function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation()
  // A repository's workspace is part of Repositories.
  const inRepositories =
    pathname === '/dashboard' || pathname.startsWith('/repositories/')

  return (
    <nav aria-label="Sections" className="flex flex-col gap-1">
      <NavLink
        to="/dashboard"
        onClick={onNavigate}
        aria-current={inRepositories ? 'page' : undefined}
        className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-200 ${
          inRepositories
            ? 'bg-surface-2 font-medium text-ink'
            : 'text-ink-muted hover:bg-surface hover:text-ink'
        }`}
      >
        <FolderGit2 className="size-4 shrink-0" aria-hidden="true" />
        Repositories
      </NavLink>
    </nav>
  )
}

/** Who is signed in, and the way out. Signing out ends the session on the
 * server; RequireAuth then sends the page back to /login. */
function Account() {
  const { data: user } = useCurrentUser()
  const signOut = useSignOut()

  return (
    <div className="border-t border-line pt-3">
      {user && (
        <div className="min-w-0 px-3 pb-2">
          <p className="truncate text-sm font-medium text-ink">{user.name}</p>
          <p className="truncate font-mono text-xs text-ink-faint">
            {user.email}
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={() => signOut.mutate()}
        disabled={signOut.isPending}
        className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-sm text-ink-muted transition-colors duration-200 hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        <LogOut className="size-4 shrink-0" aria-hidden="true" />
        {signOut.isPending ? 'Signing out…' : 'Sign out'}
      </button>
      {signOut.isError && (
        <p role="alert" className="px-3 pt-1 text-xs text-danger">
          Could not sign out. Try again.
        </p>
      )}
    </div>
  )
}

/*
 * The signed-in shell: fixed sidebar from `lg`, a slide-down panel below it.
 * Only ever rendered under RequireAuth, so there is always a user.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[15rem_1fr]">
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-canvas"
      >
        Skip to content
      </a>

      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-svh flex-col border-r border-line bg-surface px-3 py-5 lg:flex">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3 font-mono text-base font-semibold tracking-tight"
        >
          <LogoMark />
          CodeCompass
        </Link>

        <div className="mt-7 flex-1">
          <NavItems />
        </div>

        <Account />
      </aside>

      {/* Top bar — mobile */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-mono text-base font-semibold tracking-tight"
        >
          <LogoMark />
          CodeCompass
        </Link>
        <button
          type="button"
          className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg text-ink-muted transition-colors duration-200 hover:text-ink"
          aria-expanded={menuOpen}
          aria-controls="app-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </header>

      {menuOpen && (
        <div
          id="app-nav"
          className="border-b border-line bg-surface px-3 py-3 lg:hidden"
        >
          <NavItems onNavigate={() => setMenuOpen(false)} />
          {/* The sidebar is hidden below lg, so the account block lives here
              too — otherwise there is no way to sign out on a phone. */}
          <div className="mt-3">
            <Account />
          </div>
        </div>
      )}

      <main id="dashboard-main" className="min-w-0 px-4 py-8 sm:px-8">
        {children}
      </main>
    </div>
  )
}
