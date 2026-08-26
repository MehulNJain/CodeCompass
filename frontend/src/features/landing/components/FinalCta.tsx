import { Mail } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { GithubMark } from '@/components/ui/GithubMark'

export function FinalCta() {
  return (
    <section className="border-t border-line px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-accent/25 bg-accent/8 px-6 py-12 text-center sm:px-12">
          <h2 className="font-mono text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Point it at a repository
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink-muted">
            Sign in and submit a Git URL. The first analysis builds the graph;
            every one after that only re-reads what changed.
          </p>

          {/* Both sign-in paths carry the same visual weight. */}
          <div className="mx-auto mt-9 grid max-w-md gap-3 sm:grid-cols-2">
            <ButtonLink
              to="/login"
              variant="outline"
              size="lg"
              className="border-line-strong bg-canvas hover:bg-surface"
            >
              <GithubMark />
              With GitHub
            </ButtonLink>
            <ButtonLink
              to="/signup"
              variant="outline"
              size="lg"
              className="border-line-strong bg-canvas hover:bg-surface"
            >
              <Mail className="size-4" aria-hidden="true" />
              With email
            </ButtonLink>
          </div>

          <p className="mt-6 font-mono text-xs text-ink-faint">
            Analysis runs asynchronously — large repositories will not block the
            page.
          </p>
        </div>
      </div>
    </section>
  )
}
