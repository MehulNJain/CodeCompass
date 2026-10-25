import { useEffect, useRef, type ReactNode } from 'react'
import { AlertCircle, Loader2, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/*
 * Built on the native <dialog> with showModal(): focus is trapped inside, the
 * page behind is inert, Escape cancels, and focus returns to the trigger on
 * close — all from the browser, styled here to match the app.
 *
 * Cancel takes initial focus, so Enter on a stray keypress never deletes.
 * While the action runs, the dialog cannot be dismissed; if it fails, the
 * error shows inside the dialog, next to the button that caused it.
 */
export function ConfirmDialog({
  open,
  icon: Icon,
  title,
  children,
  confirmLabel,
  pendingLabel,
  pending,
  error,
  onConfirm,
  onClose,
}: {
  open: boolean
  icon: LucideIcon
  title: string
  children: ReactNode
  confirmLabel: string
  pendingLabel: string
  pending: boolean
  error: string | null
  onConfirm: () => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-body"
      onClose={onClose}
      onCancel={(event) => pending && event.preventDefault()}
      // The dialog element itself is only hit on the backdrop; the panel
      // inside takes every other click.
      onClick={(event) => !pending && event.target === ref.current && onClose()}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface p-0 text-ink shadow-2xl shadow-black transition-[opacity,scale] duration-200 backdrop:bg-canvas/70 backdrop:backdrop-blur-sm starting:opacity-0 motion-safe:starting:scale-95"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-danger/30 bg-danger/10">
            <Icon className="size-5 text-danger" aria-hidden="true" />
          </span>
          <div className="min-w-0 pt-1">
            <h2
              id="confirm-dialog-title"
              className="font-mono text-base font-semibold break-words"
            >
              {title}
            </h2>
            <div
              id="confirm-dialog-body"
              className="mt-2 text-sm leading-relaxed text-ink-muted"
            >
              {children}
            </div>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 flex items-start gap-2 rounded-lg border border-danger/25 bg-canvas px-3 py-2.5 text-xs leading-relaxed text-ink-muted"
          >
            <AlertCircle
              className="mt-0.5 size-3.5 shrink-0 text-danger"
              aria-hidden="true"
            />
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={pending}
            autoFocus
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={onConfirm}
            disabled={pending}
            className="border border-danger/40 bg-danger/15 font-semibold text-danger! hover:bg-danger/25"
          >
            {pending && (
              <Loader2
                className="size-4 motion-safe:animate-spin"
                aria-hidden="true"
              />
            )}
            {pending ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
