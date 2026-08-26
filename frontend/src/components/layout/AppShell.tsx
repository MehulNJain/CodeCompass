import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Compass,
  FolderGit2,
  LogOut,
  Menu,
  MessageSquareText,
  Route,
  Share2,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type NavItem = {
  label: string
  to: string
  icon: LucideIcon
  /** Routes whose module is not built. Rendered, but not clickable. */
  pending?: boolean
}

const navItems: NavItem[] = [
  { label: 'Repositories', to: '/dashboard', icon: FolderGit2 },
  { label: 'Tours', to: '/tours', icon: Route, pending: true },
  { label: 'Graph', to: '/graph', icon: Share2, pending: true },
  { label: 'Ask', to: '/qa', icon: MessageSquareText, pending: true },
]

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Sections" className="flex flex-col gap-1">
      {navItems.map(({ label, to, icon: Icon, pending }) =>
        pending ? (
          <span
            key={label}
            aria-disabled="true"
            title="Not built yet"
            className="flex min-h-11 cursor-not-allowed items-center gap-3 rounded-lg px-3 text-sm text-ink-faint"
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {label}
            <span className="ml-auto font-mono text-[0.625rem] tracking-wide text-ink-faint">
              SOON
            </span>
          </span>
        ) : (
          <NavLink
            key={label}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-200 ${
                isActive
                  ? 'bg-surface-2 font-medium text-ink'
                  : 'text-ink-muted hover:bg-surface hover:text-ink'
              }`
            }
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {label}
          </NavLink>
        ),
      )}
    </nav>
  )
}

/*
 * The signed-in shell: fixed sidebar from `lg`, a slide-down panel below it.
 * There is no session yet, so "Sign out" is just a link back to the landing
 * page — it becomes a real call once authentication exists.
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
          <Compass className="size-5 text-accent" aria-hidden="true" />
          CodeCompass
        </Link>

        <div className="mt-7 flex-1">
          <NavItems />
        </div>

        <Link
          to="/"
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-ink-muted transition-colors duration-200 hover:bg-surface-2 hover:text-ink"
        >
          <LogOut className="size-4 shrink-0" aria-hidden="true" />
          Sign out
        </Link>
      </aside>

      {/* Top bar — mobile */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-mono text-base font-semibold tracking-tight"
        >
          <Compass className="size-5 text-accent" aria-hidden="true" />
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
        </div>
      )}

      <main id="dashboard-main" className="min-w-0 px-4 py-8 sm:px-8">
        {children}
      </main>
    </div>
  )
}
