import { Braces, GitFork, ListOrdered, MessageSquareQuote, Radar } from 'lucide-react'

const steps = [
  {
    icon: GitFork,
    title: 'Ingest',
    body: 'Clone the repository, filter out build artefacts and dependencies, and produce a clean file inventory.',
  },
  {
    icon: Braces,
    title: 'Parse',
    body: 'Read each source file into a syntax tree and extract symbols, imports, and call sites exactly, straight from the grammar.',
  },
  {
    icon: Radar,
    title: 'Graph & rank',
    body: 'Assemble the relationships into a directed graph, then score every file by centrality so entry points and core modules surface first.',
  },
  {
    icon: ListOrdered,
    title: 'Order the tour',
    body: 'Walk outward from entry points along dependency edges, re-weighted for the reader persona you picked.',
  },
  {
    icon: MessageSquareQuote,
    title: 'Explain',
    body: 'Generate a plain-language explanation for each step, each one tied to the specific lines that back it up.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-line bg-surface px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-mono text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            Five deterministic stages, then one generative one. The factual
            backbone is built before a single word is written.
          </p>
        </div>

        <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="group rounded-xl border border-line bg-canvas p-6 transition-colors duration-200 hover:border-line-strong"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg border border-line bg-surface text-accent">
                  <step.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-mono text-xs text-ink-faint">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-5 font-mono text-base font-semibold">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {step.body}
              </p>
            </li>
          ))}

          <li className="flex flex-col justify-center rounded-xl border border-dashed border-line-strong p-6">
            <p className="font-mono text-sm leading-relaxed text-ink-muted">
              On the next commit, only the changed portions are re-analysed —
              and any explanation resting on code that moved is flagged as
              stale.
            </p>
          </li>
        </ol>
      </div>
    </section>
  )
}
