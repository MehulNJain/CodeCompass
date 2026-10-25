import { ROLE_ORDER, ROLES, type Role } from '@/features/graph/roles'

/*
 * The legend doubles as the filter: each role is a toggle. Only roles present
 * in this repository are listed, each with its count. Hidden roles stay
 * listed, struck through, so they can be brought back.
 */
export function GraphLegend({
  counts,
  hidden,
  onToggle,
}: {
  counts: Map<Role, number>
  hidden: Set<Role>
  onToggle: (role: Role) => void
}) {
  const present = ROLE_ORDER.filter((role) => counts.has(role))

  return (
    <div
      role="group"
      aria-label="File roles — select to show or hide"
      className="flex flex-wrap gap-0.5"
    >
      {present.map((role) => {
        const { label, icon: Icon, colour } = ROLES[role]
        const shown = !hidden.has(role)
        return (
          <button
            key={role}
            type="button"
            aria-pressed={shown}
            onClick={() => onToggle(role)}
            title={
              shown
                ? `Hide ${label.toLowerCase()}`
                : `Show ${label.toLowerCase()}`
            }
            className={`inline-flex min-h-11 cursor-pointer sm:min-h-8 items-center gap-1.5 rounded-lg px-2 text-xs transition-colors duration-200 hover:bg-surface-2 ${
              shown ? 'text-ink' : 'text-ink-faint line-through'
            }`}
          >
            <Icon
              className="size-3.5 shrink-0"
              style={{ color: shown ? colour : undefined }}
              aria-hidden="true"
            />
            {label}
            <span className="font-mono text-ink-faint">{counts.get(role)}</span>
          </button>
        )
      })}
    </div>
  )
}
