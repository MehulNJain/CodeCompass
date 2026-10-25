import { useEffect, useRef } from 'react'
import type { GraphFile } from '@/types/api'

/*
 * The reading order: files ranked by importance, most central first. This is
 * also the accessible equivalent of the graph — everything the canvas shows
 * (score, what imports what) is here as text, and selecting works by keyboard.
 */
export function StartHereList({
  files,
  selectedId,
  onSelect,
}: {
  files: GraphFile[]
  selectedId: number | null
  onSelect: (id: number | null) => void
}) {
  const selectedRef = useRef<HTMLButtonElement>(null)

  // A file picked in the graph may be further down the list.
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selectedId])

  return (
    <ol className="flex flex-col gap-1">
      {files.map((file, index) => {
        const selected = file.id === selectedId
        const slash = file.path.lastIndexOf('/')
        return (
          <li key={file.id}>
            <button
              type="button"
              ref={selected ? selectedRef : undefined}
              aria-pressed={selected}
              onClick={() => onSelect(selected ? null : file.id)}
              className={`flex w-full cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors duration-200 ${
                selected
                  ? 'border-accent/50 bg-surface-2'
                  : 'border-transparent hover:bg-surface'
              }`}
            >
              <span className="w-5 shrink-0 pt-0.5 text-right font-mono text-xs text-ink-faint">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className="block truncate font-mono text-xs"
                  title={file.path}
                >
                  <span className="text-ink-faint">
                    {file.path.slice(0, slash + 1)}
                  </span>
                  <span className="font-semibold text-ink">
                    {file.path.slice(slash + 1)}
                  </span>
                </span>
                <span className="mt-1.5 flex items-center gap-2">
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <span
                      className="block h-full rounded-full bg-accent"
                      style={{
                        width: `${Math.max(file.importance_score * 100, 2)}%`,
                      }}
                    />
                  </span>
                  <span className="shrink-0 font-mono text-[0.6875rem] text-ink-muted">
                    imported by {file.imported_by}
                  </span>
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
