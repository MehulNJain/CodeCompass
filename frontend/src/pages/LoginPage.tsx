import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'

/*
 * Placeholder. The sign-in screen is the next piece of work — GitHub OAuth and
 * email/password, presented at equal weight. This exists so the landing page's
 * calls to action lead somewhere instead of rendering a blank route.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <Compass className="size-8 text-accent" aria-hidden="true" />
      <h1 className="mt-6 font-mono text-2xl font-bold">Sign in</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
        Not built yet. GitHub and email sign-in land in the next pass.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-lg border border-line-strong px-4 text-sm transition-colors duration-200 hover:border-accent hover:text-accent"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to home
      </Link>
    </main>
  )
}
