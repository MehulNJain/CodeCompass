import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ApiError } from '@/api/client'

/*
 * One place decides how a failure reads. A 501 is not an error the user caused
 * or can retry — it means the module behind that route is still being built —
 * so it gets different wording and no retry button.
 */
export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown
  onRetry?: () => void
}) {
  const notImplemented = error instanceof ApiError && error.isNotImplemented
  const message =
    error instanceof Error ? error.message : 'Something went wrong.'

  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-xl border border-line bg-surface px-6 py-12 text-center"
    >
      <AlertTriangle
        className={`size-6 ${notImplemented ? 'text-ink-faint' : 'text-danger'}`}
        aria-hidden="true"
      />
      <p className="mt-4 font-mono text-sm font-semibold">
        {notImplemented ? 'Not built yet' : 'Could not load this'}
      </p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
        {message}
      </p>
      {onRetry && !notImplemented && (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  )
}
