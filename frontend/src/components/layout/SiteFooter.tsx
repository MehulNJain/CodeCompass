import { Compass } from 'lucide-react'

const stack = [
  'React',
  'FastAPI',
  'Tree-sitter',
  'NetworkX',
  'PostgreSQL',
  'Neo4j',
  'Chroma',
]

export function SiteFooter() {
  return (
    <footer className="border-t border-line px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="flex items-center gap-2.5 font-mono text-base font-semibold">
              <Compass className="size-5 text-accent" aria-hidden="true" />
              CodeCompass
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
              Persona-aware codebase onboarding tour generation. A final-year
              B.Tech project in Computer Science &amp; Engineering.
            </p>
          </div>

          <div className="sm:text-right">
            <p className="font-mono text-xs tracking-wide text-ink-faint uppercase">
              Built with
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-1.5 sm:justify-end">
              {stack.map((item) => (
                <li
                  key={item}
                  className="rounded border border-line bg-surface px-2 py-1 font-mono text-xs text-ink-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-line pt-6">
          <p className="font-mono text-xs text-ink-faint">
            Sanket Kale · Harshal Kala · Mehul Jain · Deep Lokhande · Palak
            Mantage — guided by Dr. Ms. R. K. Dixit
          </p>
        </div>
      </div>
    </footer>
  )
}
