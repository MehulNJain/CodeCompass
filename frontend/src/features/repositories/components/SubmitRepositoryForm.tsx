import { useState } from 'react'
import { AlertCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSubmitRepository } from '@/features/repositories/hooks/useRepositories'

export function SubmitRepositoryForm() {
  const [sourceUrl, setSourceUrl] = useState('')
  const submit = useSubmitRepository()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = sourceUrl.trim()
    if (!trimmed) return
    submit.mutate({ source_url: trimmed }, { onSuccess: () => setSourceUrl('') })
  }

  const errorId = 'submit-repository-error'

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="source-url" className="sr-only">
            Git repository URL
          </label>
          <input
            id="source-url"
            type="url"
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder="https://github.com/user/repo"
            aria-invalid={submit.isError || undefined}
            aria-describedby={submit.isError ? errorId : undefined}
            className={`min-h-11 w-full rounded-lg border bg-surface px-3.5 font-mono text-sm text-ink transition-colors duration-200 placeholder:text-ink-faint focus:outline-none ${
              submit.isError
                ? 'border-danger focus:border-danger'
                : 'border-line-strong focus:border-accent'
            }`}
          />
        </div>

        <Button type="submit" disabled={submit.isPending || !sourceUrl.trim()}>
          <Plus className="size-4" aria-hidden="true" />
          {submit.isPending ? 'Queueing…' : 'Analyse'}
        </Button>
      </div>

      {submit.isError && (
        <p
          id={errorId}
          className="mt-2 flex items-start gap-1.5 text-xs text-danger"
        >
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {submit.error instanceof Error
            ? submit.error.message
            : 'Could not queue that repository.'}
        </p>
      )}
    </form>
  )
}
