/*
 * The CodeCompass mark: an ordered path of files inside a compass ring. Same
 * drawing as public/favicon.svg. The ring and path take the text colour; the
 * nodes are always the accent.
 */
export function LogoMark({ className = 'size-6 text-ink' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round">
        <circle cx="32" cy="32" r="27" />
        <line x1="20" y1="44" x2="42" y2="22" />
      </g>
      <g fill="var(--color-accent)">
        <circle cx="42" cy="22" r="6.5" />
        <circle cx="30.5" cy="33.5" r="4.5" />
        <circle cx="20" cy="44" r="3.5" />
      </g>
    </svg>
  )
}
