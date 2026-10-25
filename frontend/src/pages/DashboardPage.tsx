import { Info } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { RepositoryList } from '@/features/repositories/components/RepositoryList'
import { RepositoryStats } from '@/features/repositories/components/RepositoryStats'
import { SubmitRepositoryForm } from '@/features/repositories/components/SubmitRepositoryForm'

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <header>
          <h1 className="font-mono text-2xl font-bold tracking-tight">
            Repositories
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Submit a public Git URL. Only you can see the repositories you add.
            Analysis runs in the background — the row updates itself while the
            worker moves through the pipeline.
          </p>
        </header>

        <div className="mt-6">
          <SubmitRepositoryForm />
        </div>

        {/*
          Honest about the current state: M1–M4 run for real, M5–M6 do not
          exist yet. Remove this notice when the pipeline is complete.
        */}
        <p className="mt-4 flex items-start gap-2.5 rounded-lg border border-line bg-surface px-3.5 py-3 text-xs leading-relaxed text-ink-muted">
          <Info className="mt-px size-4 shrink-0 text-ink-faint" aria-hidden="true" />
          <span>
            Analysis runs up to ranking: each repository is cloned, parsed, and
            its files ranked by how central they are. Embeddings, tours, and
            explanations are still being built. Expand a row to see each stage.
          </span>
        </p>

        <div className="mt-8">
          <RepositoryStats />
        </div>

        <div className="mt-8">
          <RepositoryList />
        </div>
      </div>
    </AppShell>
  )
}
