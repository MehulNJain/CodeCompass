import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useDeleteRepository } from '@/features/repositories/hooks/useRepositories'
import type { Repository } from '@/types/api'

/*
 * The trigger stays neutral (red on hover); the dialog carries the danger
 * styling and says exactly what is lost — including a running analysis.
 */
export function DeleteRepositoryButton({
  repository,
  showLabel = false,
  onDeleted,
}: {
  repository: Repository
  showLabel?: boolean
  onDeleted?: () => void
}) {
  const [open, setOpen] = useState(false)
  const remove = useDeleteRepository()
  const busy =
    repository.status === 'queued' || repository.status === 'analyzing'

  function close() {
    setOpen(false)
    remove.reset()
  }

  return (
    <>
      <Button
        variant={showLabel ? 'outline' : 'ghost'}
        onClick={() => setOpen(true)}
        aria-label={showLabel ? undefined : `Delete ${repository.name}`}
        title={showLabel ? undefined : 'Delete'}
        // size-11: an icon-only target still gets the full 44px.
        className={`hover:border-danger! hover:text-danger! ${showLabel ? '' : 'size-11 px-0'}`}
      >
        <Trash2 className="size-4" aria-hidden="true" />
        {showLabel && 'Delete'}
      </Button>

      <ConfirmDialog
        open={open}
        icon={Trash2}
        title={`Delete ${repository.name}?`}
        confirmLabel="Delete repository"
        pendingLabel="Deleting…"
        pending={remove.isPending}
        error={remove.error?.message ?? null}
        onClose={close}
        onConfirm={() =>
          remove.mutate(repository.id, {
            onSuccess: () => {
              setOpen(false)
              onDeleted?.()
            },
          })
        }
      >
        <p>
          Its analysis — ranked files and the dependency graph — is removed with
          it.
          {busy && ' The analysis in progress is cancelled.'}
        </p>
        <p className="mt-2">
          This cannot be undone. You can add the URL again later to re-analyse
          from scratch.
        </p>
      </ConfirmDialog>
    </>
  )
}
