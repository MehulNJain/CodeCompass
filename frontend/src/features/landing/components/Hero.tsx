import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, FileCode2, GitBranch, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/* Illustrative tour steps for the hero mockup — not live data. */
const sampleSteps = [
  { order: 1, path: 'src/main.py', lines: 'L1–L34', note: 'Entry point. Wires config and starts the server.' },
  { order: 2, path: 'src/api/routes.py', lines: 'L12–L88', note: 'Every HTTP route the service exposes.' },
  { order: 3, path: 'src/core/auth.py', lines: 'L40–L71', note: 'Token verification — 9 modules depend on this.' },
  { order: 4, path: 'src/db/session.py', lines: 'L5–L29', note: 'How requests get a database connection.' },
]

export function Hero() {
  const [repoUrl, setRepoUrl] = useState('')
  const navigate = useNavigate()

  // No backend yet — a submit sends the visitor into the sign-in flow.
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    navigate('/login')
  }

  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
      {/* Soft accent wash behind the headline. Decorative only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -z-10 h-96 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-accent/12 blur-3xl"
      />

      <div className="mx-auto max-w-3xl text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 font-mono text-xs text-ink-muted">
          <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
          Static analysis, then cited explanations
        </p>

        <h1 className="mt-6 font-mono text-4xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
          From repository to <span className="text-accent">reading path</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
          CodeCompass analyses any Git repository and generates an ordered
          walkthrough — which files to read, in what order, and why each one
          matters. Every explanation points at the lines it came from.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-9 flex max-w-xl flex-col gap-2 sm:flex-row"
        >
          <div className="flex-1">
            <label htmlFor="repo-url" className="sr-only">
              Git repository URL
            </label>
            <input
              id="repo-url"
              type="url"
              value={repoUrl}
              onChange={(event) => setRepoUrl(event.target.value)}
              placeholder="https://github.com/user/repo"
              className="min-h-12 w-full rounded-lg border border-line-strong bg-surface px-4 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
            />
          </div>
          <Button type="submit" size="lg">
            Generate tour
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </form>

        <p className="mt-3 font-mono text-xs text-ink-faint">
          Public repositories. Python and JavaScript/TypeScript supported first.
        </p>
      </div>

      {/* Product mockup — illustrates the tour output. */}
      <div className="mx-auto mt-16 max-w-4xl">
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
          <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-3">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-ink-faint/40" />
              <span className="size-2.5 rounded-full bg-ink-faint/40" />
              <span className="size-2.5 rounded-full bg-ink-faint/40" />
            </span>
            <span className="ml-2 flex items-center gap-2 font-mono text-xs text-ink-muted">
              <GitBranch className="size-3.5" aria-hidden="true" />
              flask · new contributor tour · 4 of 12 steps
            </span>
          </div>

          <ol className="divide-y divide-line">
            {sampleSteps.map((step) => (
              <li
                key={step.order}
                className="flex items-start gap-4 px-4 py-4 text-left sm:px-6"
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-accent/30 bg-accent/10 font-mono text-xs font-semibold text-accent">
                  {step.order}
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-sm">
                    <FileCode2
                      className="size-3.5 shrink-0 text-ink-faint"
                      aria-hidden="true"
                    />
                    <span className="text-ink">{step.path}</span>
                    <span className="rounded border border-line bg-canvas px-1.5 py-0.5 text-xs text-ink-muted">
                      {step.lines}
                    </span>
                  </p>
                  <p className="mt-1.5 text-sm text-ink-muted">{step.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-3 text-center font-mono text-xs text-ink-faint">
          Illustrative output. Line references are what make a claim checkable.
        </p>
      </div>
    </section>
  )
}
