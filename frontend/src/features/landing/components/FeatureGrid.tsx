import {
  Download,
  Network,
  Route,
  Search,
  TriangleAlert,
  UsersRound,
} from 'lucide-react'

const features = [
  {
    icon: Route,
    title: 'Ordered guided tour',
    body: 'Not a summary — a sequence. Read these files, in this order, and here is why each one earns its place.',
  },
  {
    icon: Network,
    title: 'Interactive dependency graph',
    body: 'Zoom and click through the real import and call graph. Large repositories aggregate to module level so the picture stays readable.',
  },
  {
    icon: Search,
    title: 'Grounded question answering',
    body: 'Ask "where is authentication handled?" and get an answer built from retrieved source, with citations to the exact lines.',
  },
  {
    icon: UsersRound,
    title: 'Persona-tailored paths',
    body: 'The same repository yields a different tour for a new contributor, a bug fixer, or a security reviewer.',
  },
  {
    icon: TriangleAlert,
    title: 'Staleness detection',
    body: 'When a file changes, any explanation generated against the old version is flagged — the standing weakness of generated docs, handled.',
  },
  {
    icon: Download,
    title: 'Shareable export',
    body: 'Export a finished tour as Markdown or PDF to commit alongside the code or hand to the next new hire.',
  },
]

export function FeatureGrid() {
  return (
    <section
      id="features"
      className="border-t border-line px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-mono text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            What you get
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            A reading path, a map, and a way to check anything the tour claims.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-xl border border-line bg-surface p-6 transition-colors duration-200 hover:border-accent/40 hover:bg-surface-2"
            >
              <span className="flex size-10 items-center justify-center rounded-lg border border-line bg-canvas text-accent">
                <feature.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-mono text-base font-semibold">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {feature.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
