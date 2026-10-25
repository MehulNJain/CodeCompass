import { AppShell } from '@/components/layout/AppShell'
import { GettingStarted } from '@/features/repositories/components/GettingStarted'
import { RepositoryList } from '@/features/repositories/components/RepositoryList'
import { RepositoryStats } from '@/features/repositories/components/RepositoryStats'
import { SubmitRepositoryForm } from '@/features/repositories/components/SubmitRepositoryForm'
import { useCurrentUser } from '@/features/auth/hooks/useAuth'
import { useRepositories } from '@/features/repositories/hooks/useRepositories'

/*
 * Home: a greeting, the way to add a repository, and your repositories.
 * Everything about one repository (its graph, tours, Q&A) lives inside it,
 * not here.
 */
export default function DashboardPage() {
  const { data: user } = useCurrentUser()
  const { data: page } = useRepositories()
  const firstName = user?.name.split(' ')[0]
  const isNew = page?.total === 0

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <header>
          <h1 className="font-mono text-2xl font-bold tracking-tight">
            {firstName
              ? `${isNew ? 'Welcome' : 'Welcome back'}, ${firstName}`
              : 'Repositories'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Add a public Git repository and CodeCompass maps its imports and
            ranks every file, so you know where to start reading. Only you can
            see the repositories you add.
          </p>
        </header>

        <div className="mt-6">
          <SubmitRepositoryForm />
        </div>

        {isNew ? (
          <div className="mt-8">
            <GettingStarted />
          </div>
        ) : (
          <>
            <div className="mt-8">
              <RepositoryStats />
            </div>
            <h2 className="mt-8 font-mono text-sm font-semibold">
              Your repositories
            </h2>
            <div className="mt-3">
              <RepositoryList />
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
