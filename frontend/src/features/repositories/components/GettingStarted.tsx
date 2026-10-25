import {
  ArrowRight,
  GitFork,
  ListOrdered,
  Share2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSubmitRepository } from '@/features/repositories/hooks/useRepositories'

const SAMPLE_URL = 'https://github.com/pallets/click'

const STEPS = [
  {
    icon: GitFork,
    title: 'Paste a repository',
    text: 'Any public Git URL. It is cloned and read in the background.',
  },
  {
    icon: Share2,
    title: 'We map it',
    text: 'Every import becomes a link, and every file gets an importance score.',
  },
  {
    icon: ListOrdered,
    title: 'Start reading',
    text: 'Open it for a ranked reading order and an interactive dependency graph.',
  },
]

/*
 * The empty state for a first visit: what happens, in three steps, and a
 * one-click way to see it on a real repository instead of a blank list.
 */
export function GettingStarted() {
  const submit = useSubmitRepository()

  return (
    <section
      aria-labelledby="getting-started"
      className="rounded-xl border border-dashed border-line px-5 py-8 sm:px-8"
    >
      <h2 id="getting-started" className="font-mono text-base font-semibold">
        No repositories yet
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        Here is what happens when you add one.
      </p>

      <ol className="mt-6 grid gap-5 sm:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="flex gap-3 sm:flex-col">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface">
              <Icon className="size-4 text-accent" aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-sm font-semibold">
                <span className="text-ink-faint">{i + 1}. </span>
                {title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                {text}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button
          onClick={() => submit.mutate({ source_url: SAMPLE_URL })}
          disabled={submit.isPending}
        >
          <Sparkles className="size-4" aria-hidden="true" />
          {submit.isPending ? 'Queueing…' : 'Try it with pallets/click'}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
        <span className="text-xs text-ink-faint">
          A popular Python CLI library · about 90 files · ready in seconds
        </span>
      </div>
      {submit.isError && (
        <p role="alert" className="mt-3 text-xs text-danger">
          {submit.error.message}
        </p>
      )}
    </section>
  )
}
