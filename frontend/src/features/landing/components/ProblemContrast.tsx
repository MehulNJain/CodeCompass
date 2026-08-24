import { Check, X } from 'lucide-react'

const without = [
  'The README covers installation, not architecture — and drifts as the code changes.',
  'Grep and jump-to-definition reveal single symbols, never the shape of the system.',
  'Asking a teammate interrupts them, does not scale, and the answer is soon forgotten.',
  'Reading every file in order is impractical for any real repository.',
]

const withTool = [
  'An ordered path that starts at entry points and follows real dependency edges.',
  'A graph built from actual imports and call sites — no relationship is invented.',
  'Every explanation cited to a file and line range, so you can verify the claim.',
  'Guidance that flags itself as stale when the code underneath it changes.',
]

export function ProblemContrast() {
  return (
    <section
      id="problem"
      className="border-t border-line px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-mono text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Joining a project should not take a week
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            Every option a new contributor has today is inadequate. None of them
            answer the one question that actually matters.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-line bg-surface p-6 sm:p-8">
            <h3 className="font-mono text-sm font-semibold tracking-wide text-ink-muted uppercase">
              Day one today
            </h3>
            <ul className="mt-6 space-y-4">
              {without.map((item) => (
                <li key={item} className="flex gap-3">
                  <X
                    className="mt-0.5 size-4 shrink-0 text-ink-faint"
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-relaxed text-ink-muted">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-accent/25 bg-accent/8 p-6 sm:p-8">
            <h3 className="font-mono text-sm font-semibold tracking-wide text-accent uppercase">
              Day one with CodeCompass
            </h3>
            <ul className="mt-6 space-y-4">
              {withTool.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-relaxed text-ink">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mx-auto mt-12 max-w-3xl rounded-lg border-l-2 border-accent bg-surface px-6 py-4 text-center font-mono text-sm leading-relaxed text-ink-muted">
          The design invariant: structure comes only from parsing the code.
          Narrative comes only from the language model. The model explains
          structure — it never invents it.
        </p>
      </div>
    </section>
  )
}
