import { FileCode2, GitBranch, Quote } from 'lucide-react'

/* Same illustrative motif as the landing hero — not live data. */
const steps = [
  { order: 1, path: 'src/main.py', lines: 'L1–L34' },
  { order: 2, path: 'src/api/routes.py', lines: 'L12–L88' },
  { order: 3, path: 'src/core/auth.py', lines: 'L40–L71' },
]

const points = [
  'An ordered reading path, not a file listing.',
  'Every explanation cites the lines it came from.',
  'Re-analysis only re-reads what the last commits changed.',
]

/*
 * Decorative context column. Hidden below lg — on a phone the form is the whole
 * job, and nothing here is needed to complete it.
 */
export function AuthAside() {
  return (
    <aside className="relative hidden overflow-hidden border-l border-line bg-surface lg:flex lg:flex-col lg:justify-center lg:px-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-accent/8 blur-3xl"
      />

      <div className="relative max-w-md">
        <Quote className="size-6 text-accent" aria-hidden="true" />
        <p className="mt-5 font-mono text-2xl leading-snug font-bold tracking-tight text-balance">
          Reading a new codebase should not start with guessing.
        </p>

        <ul className="mt-8 flex flex-col gap-3">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-ink-muted">
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent"
                aria-hidden="true"
              />
              {point}
            </li>
          ))}
        </ul>

        <div className="mt-10 overflow-hidden rounded-xl border border-line bg-canvas">
          <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2.5 font-mono text-xs text-ink-muted">
            <GitBranch className="size-3.5" aria-hidden="true" />
            flask · new contributor tour
          </div>
          <ol className="divide-y divide-line">
            {steps.map((step) => (
              <li key={step.order} className="flex items-center gap-3 px-4 py-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-accent/30 bg-accent/10 font-mono text-xs font-semibold text-accent">
                  {step.order}
                </span>
                <FileCode2 className="size-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
                <span className="truncate font-mono text-xs text-ink">{step.path}</span>
                <span className="ml-auto shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-xs text-ink-muted">
                  {step.lines}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-3 font-mono text-xs text-ink-faint">Illustrative output.</p>
      </div>
    </aside>
  )
}
