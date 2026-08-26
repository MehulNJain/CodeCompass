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
            Submit a public Git URL. Analysis runs in the background — the row
            updates itself while the worker moves through the pipeline.
          </p>
        </header>

        <div className="mt-6">
          <SubmitRepositoryForm />
        </div>

        {/*
          Honest about the current state. Submitting really does queue a job and
          a real worker really does pick it up — it then fails, because modules
          M1–M7 are not written. Remove this notice when the pipeline lands.
        */}
        <p className="mt-4 flex items-start gap-2.5 rounded-lg border border-line bg-surface px-3.5 py-3 text-xs leading-relaxed text-ink-muted">
          <Info className="mt-px size-4 shrink-0 text-ink-faint" aria-hidden="true" />
          <span>
            The queue is live, the analysis is not. Submitting reaches the
            worker, which currently stops at the first stage — modules M1–M7 are
            still being built. Expand a row to see exactly where it stopped.
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
