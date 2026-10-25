import { ArrowDownRight, ArrowUpLeft, MousePointerClick, X } from 'lucide-react'
import { ROLES, type Role } from '@/features/graph/roles'
import type { GraphEdge, GraphFile } from '@/types/api'

/*
 * Everything about the selected file, and a way to walk the graph without
 * the canvas: each import and importer is a button that selects that file
 * (and flies the graph to it). The counts are for the whole repository; the
 * lists cover the files on screen.
 */
export function FileDetailPanel({
  file,
  role,
  files,
  edges,
  onSelect,
}: {
  file: GraphFile | null
  role: Role | null
  files: GraphFile[]
  edges: GraphEdge[]
  onSelect: (id: number | null) => void
}) {
  if (!file || !role) {
    return (
      <aside className="flex shrink-0 flex-col items-center justify-center gap-3 border-t border-line px-6 py-10 text-center lg:w-80 lg:border-t-0 lg:border-l">
        <MousePointerClick
          className="size-6 text-ink-faint"
          aria-hidden="true"
        />
        <p className="max-w-[16rem] text-sm leading-relaxed text-ink-muted">
          Select a file to see what it imports, what depends on it, and where it
          ranks.
        </p>
      </aside>
    )
  }

  const byId = new Map(files.map((f) => [f.id, f]))
  const rank = files.indexOf(file) + 1
  const imports = edges
    .filter((e) => e.source === file.id)
    .map((e) => byId.get(e.target)!)
  const importedBy = edges
    .filter((e) => e.target === file.id)
    .map((e) => byId.get(e.source)!)
  const { label, icon: Icon, colour } = ROLES[role]
  const slash = file.path.lastIndexOf('/')

  return (
    <aside
      aria-label={`Details for ${file.path}`}
      className="flex shrink-0 flex-col overflow-y-auto border-t border-line lg:w-80 lg:border-t-0 lg:border-l"
    >
      <div className="flex items-start gap-3 border-b border-line p-4">
        <div className="min-w-0 flex-1">
          <span
            className="inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-xs"
            style={{
              borderColor: `color-mix(in srgb, ${colour} 45%, transparent)`,
              color: colour,
            }}
          >
            <Icon className="size-3" aria-hidden="true" />
            {label}
          </span>
          <h3 className="mt-2 font-mono text-sm font-semibold break-all">
            {file.path.slice(slash + 1)}
          </h3>
          <p className="mt-0.5 font-mono text-xs break-all text-ink-faint">
            {file.path.slice(0, slash + 1) || './'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          aria-label="Close details"
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink-muted transition-colors duration-200 hover:bg-surface-2 hover:text-ink"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <dl className="grid grid-cols-3 border-b border-line text-center">
        {[
          ['Rank', `#${rank}`],
          ['Importance', `${Math.round(file.importance_score * 100)}`],
          ['Imported by', file.imported_by],
        ].map(([term, value]) => (
          <div key={term} className="border-line px-2 py-3 not-last:border-r">
            <dt className="text-xs text-ink-faint">{term}</dt>
            <dd className="mt-1 font-mono text-base font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <FileList
        title="Imported by"
        icon={ArrowUpLeft}
        files={importedBy}
        total={file.imported_by}
        empty="Nothing here imports it — a starting point."
        onSelect={onSelect}
      />
      <FileList
        title="Imports"
        icon={ArrowDownRight}
        files={imports}
        total={file.imports}
        empty="Imports nothing else in the repository — a foundation."
        onSelect={onSelect}
      />
    </aside>
  )
}

function FileList({
  title,
  icon: Icon,
  files,
  total,
  empty,
  onSelect,
}: {
  title: string
  icon: typeof ArrowUpLeft
  files: GraphFile[]
  total: number
  empty: string
  onSelect: (id: number) => void
}) {
  return (
    <section className="border-b border-line p-4 last:border-b-0">
      <h4 className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
        <Icon className="size-3.5" aria-hidden="true" />
        {title}
        <span className="font-mono text-ink-faint">{total}</span>
      </h4>
      {files.length === 0 ? (
        <p className="mt-2 text-xs leading-relaxed text-ink-faint">
          {total > 0 ? 'All of them are outside the files shown.' : empty}
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-0.5">
          {files.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => onSelect(f.id)}
                title={f.path}
                className="flex min-h-9 w-full cursor-pointer items-center rounded-md px-2 text-left font-mono text-xs text-ink-muted transition-colors duration-200 hover:bg-surface-2 hover:text-ink"
              >
                <span className="truncate">
                  {f.path.split('/').slice(-2).join('/')}
                </span>
              </button>
            </li>
          ))}
          {total > files.length && (
            <li className="px-2 pt-1 text-xs text-ink-faint">
              +{total - files.length} outside the files shown
            </li>
          )}
        </ul>
      )}
    </section>
  )
}
