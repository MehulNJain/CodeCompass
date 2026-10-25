import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LogoMark } from '@/components/ui/LogoMark'
import { AccountMenu } from '@/components/layout/AccountMenu'

/*
 * The signed-in shell: a slim top bar and the whole width below it for the
 * page. There is one app-level destination (your repositories), so it is the
 * logo rather than a sidebar holding a single link; deeper pages carry a
 * breadcrumb back. Everything about one repository lives in its own tabs.
 * Only ever rendered under RequireAuth, so there is always a user.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <a
        href="#app-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-canvas"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4 sm:px-8">
          <Link
            to="/dashboard"
            aria-label="CodeCompass — your repositories"
            className="flex min-h-11 items-center gap-2.5 font-mono text-base font-semibold tracking-tight"
          >
            <LogoMark />
            CodeCompass
          </Link>
          <AccountMenu />
        </div>
      </header>

      <main id="app-main" className="min-w-0 px-4 py-6 sm:px-8">
        {children}
      </main>
    </div>
  )
}
