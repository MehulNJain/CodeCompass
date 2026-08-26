import { AlertCircle, Check, Loader2 } from 'lucide-react'
import { PIPELINE_STAGES } from '@/constants/pipeline'
import { Skeleton } from '@/components/common/Skeleton'
import { useRepositoryJob } from '@/features/repositories/hooks/useRepositories'
import { relativeTime } from '@/utils/format'

/*
 * The expanded row. Shows where the worker got to in the pipeline, and — when
 * a job failed — the message the worker actually recorded. Surfacing the real
 * error is the point: right now every job fails because modules M1–M7 are not
 * built, and the message says exactly that.
 */
export function JobDetail({ repositoryId }: { repositoryId: number }) {
  const { data: job, isPending, isError, error } = useRepositoryJob(
    repositoryId,
    true,
  )

  if (isPending) {
    return (
      <div className="flex flex-col gap-2 px-4 pb-4 sm:px-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
    )
  }

  if (isError) {
    return (
      <p className="px-4 pb-4 text-sm text-ink-muted sm:px-6">
        {error instanceof Error ? error.message : 'No job information.'}
      </p>
    )
  }

  const reachedIndex = PIPELINE_STAGES.findIndex(
    (stage) => stage.key === job.stage,
  )

  return (
    <div className="border-t border-line bg-canvas px-4 py-4 sm:px-6">
      <ol className="flex flex-wrap gap-x-2 gap-y-2">
        {PIPELINE_STAGES.map((stage, index) => {
          const done = reachedIndex > index
          const current = reachedIndex === index
          const running = current && job.state === 'running'
          const failedHere = current && job.state === 'failed'

          return (
            <li
              key={stage.key}
              aria-current={current ? 'step' : undefined}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-xs ${
                failedHere
                  ? 'border-danger/40 text-danger'
                  : done || running
                    ? 'border-accent/30 text-accent'
                    : 'border-line text-ink-faint'
              }`}
            >
              {failedHere ? (
                <AlertCircle className="size-3" aria-hidden="true" />
              ) : running ? (
                <Loader2 className="size-3 animate-spin" aria-hidden="true" />
              ) : done ? (
                <Check className="size-3" aria-hidden="true" />
              ) : null}
              {stage.label}
            </li>
          )
        })}
      </ol>

      <dl className="mt-4 grid gap-x-8 gap-y-2 text-xs sm:grid-cols-[auto_1fr]">
        <dt className="text-ink-faint">Job</dt>
        <dd className="font-mono text-ink-muted">#{job.id}</dd>

        <dt className="text-ink-faint">Queued</dt>
        <dd className="text-ink-muted">{relativeTime(job.created_at)}</dd>

        {job.finished_at && (
          <>
            <dt className="text-ink-faint">Finished</dt>
            <dd className="text-ink-muted">{relativeTime(job.finished_at)}</dd>
          </>
        )}
      </dl>

      {job.error_message && (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-danger/25 bg-surface px-3 py-2.5 text-xs leading-relaxed text-ink-muted">
          <AlertCircle
            className="mt-0.5 size-3.5 shrink-0 text-danger"
            aria-hidden="true"
          />
          <span className="font-mono">{job.error_message}</span>
        </p>
      )}
    </div>
  )
}
