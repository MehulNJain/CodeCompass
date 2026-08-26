import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import { AuthForm } from '@/features/auth/components/AuthForm'
import type { AuthMode } from '@/features/auth/components/AuthForm'
import { AuthAside } from '@/features/auth/components/AuthAside'

/*
 * Serves both /login and /signup. The two screens differ only in copy and one
 * field, so a shared component keeps them from drifting apart.
 */
export default function LoginPage({ mode = 'signin' }: { mode?: AuthMode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <main className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-mono text-base font-semibold tracking-tight"
          >
            <Compass className="size-5 text-accent" aria-hidden="true" />
            CodeCompass
          </Link>

          <Link
            to="/"
            className="flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <AuthForm mode={mode} />
        </div>

        <p className="text-center font-mono text-xs text-ink-faint">
          A final-year major project. Public repositories only.
        </p>
      </main>

      <AuthAside />
    </div>
  )
}
