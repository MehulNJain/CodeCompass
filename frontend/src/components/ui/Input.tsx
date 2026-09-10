import { useId } from 'react'
import type { ComponentProps } from 'react'
import { AlertCircle } from 'lucide-react'

type Props = {
  label: string
  /** Message shown under the field. Sets aria-invalid and recolours the border. */
  error?: string
  /** Persistent helper text. Hidden while an error is showing. */
  hint?: string
} & ComponentProps<'input'>

/*
 * Labels are always visible — a placeholder is not a label, it disappears the
 * moment someone starts typing. Errors sit next to the field they belong to,
 * not in a summary at the top of the form.
 */
export function Input({
  label,
  error,
  hint,
  id,
  className = '',
  ...rest
}: Props) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  const describedBy =
    [error ? errorId : null, hint && !error ? hintId : null]
      .filter(Boolean)
      .join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="font-mono text-xs font-medium tracking-wide text-ink-muted"
      >
        {label}
      </label>

      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={
          'min-h-11 w-full rounded-lg border bg-surface px-3.5 text-sm text-ink ' +
          'transition-colors duration-200 placeholder:text-ink-faint focus:outline-none ' +
          (error
            ? 'border-danger focus:border-danger '
            : 'border-line-strong focus:border-accent ') +
          className
        }
        {...rest}
      />

      {hint && !error && (
        <p id={hintId} className="text-xs text-ink-faint">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="flex items-start gap-1.5 text-xs text-danger"
        >
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}
