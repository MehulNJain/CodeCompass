import { Link } from 'react-router-dom'
import type { ComponentProps, ReactNode } from 'react'

type Variant = 'accent' | 'outline' | 'ghost'
type Size = 'md' | 'lg'

/*
 * Accent uses dark text on green, not white. White on #22C55E is 2.26:1 and
 * fails WCAG AA; canvas-on-green is 7.98:1. See the note in index.css.
 */
const variants: Record<Variant, string> = {
  accent:
    'bg-accent text-canvas hover:bg-accent-hover font-semibold shadow-md shadow-accent/20',
  outline:
    'border border-line-strong text-ink hover:border-accent hover:text-accent bg-transparent',
  ghost: 'text-ink-muted hover:text-ink hover:bg-surface',
}

// min-h-11 keeps every target at or above the 44px minimum.
const sizes: Record<Size, string> = {
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-6 text-base',
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg cursor-pointer ' +
  'transition-colors duration-200 whitespace-nowrap ' +
  'disabled:opacity-50 disabled:cursor-not-allowed'

type SharedProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

export function Button({
  variant = 'accent',
  size = 'md',
  className = '',
  children,
  ...rest
}: SharedProps & ComponentProps<'button'>) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

/** Same visual treatment as Button, but renders a router link. */
export function ButtonLink({
  variant = 'accent',
  size = 'md',
  className = '',
  children,
  ...rest
}: SharedProps & ComponentProps<typeof Link>) {
  return (
    <Link
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  )
}
