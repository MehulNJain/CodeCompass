import { useId, useState } from 'react'
import { Search } from 'lucide-react'
import type { GraphFile } from '@/types/api'

/*
 * Find a file by any part of its path. Picking one selects it, and the graph
 * flies there. Arrow keys move through the matches, Enter picks, Escape
 * clears — a combobox, without a library.
 */
export function GraphSearch({
  files,
  onPick,
}: {
  files: GraphFile[]
  onPick: (id: number) => void
}) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listId = useId()

  const q = query.trim().toLowerCase()
  const matches = q
    ? files.filter((f) => f.path.toLowerCase().includes(q)).slice(0, 6)
    : []

  function pick(file: GraphFile) {
    onPick(file.id)
    setQuery('')
  }

  return (
    <div className="relative w-full sm:w-64">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint"
        aria-hidden="true"
      />
      <input
        type="search"
        role="combobox"
        aria-label="Find a file"
        aria-expanded={matches.length > 0}
        aria-controls={listId}
        aria-activedescendant={
          matches[active] ? `${listId}-${active}` : undefined
        }
        value={query}
        placeholder="Find a file…"
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(0)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActive((i) => Math.min(i + 1, matches.length - 1))
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActive((i) => Math.max(i - 1, 0))
          } else if (event.key === 'Enter' && matches[active]) {
            pick(matches[active])
          } else if (event.key === 'Escape') {
            setQuery('')
          }
        }}
        className="min-h-10 w-full rounded-lg border border-line-strong bg-canvas pr-3 pl-9 font-mono text-xs text-ink transition-colors duration-200 placeholder:text-ink-faint focus:border-accent focus:outline-none"
      />
      {matches.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-line bg-surface shadow-xl shadow-black"
        >
          {matches.map((file, i) => (
            <li
              key={file.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(file)}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer truncate px-3 py-2 font-mono text-xs ${
                i === active ? 'bg-surface-2 text-ink' : 'text-ink-muted'
              }`}
              title={file.path}
            >
              {file.path}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
