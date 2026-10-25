import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, LogOut } from 'lucide-react'
import { useCurrentUser, useSignOut } from '@/features/auth/hooks/useAuth'

/*
 * Who is signed in, and the way out — the one account control, top right.
 * A menu button: Enter/Space opens it with focus on the first item, Escape
 * or a click outside closes it and returns focus to the button. Signing out
 * ends the session on the server; RequireAuth then sends the page to /login.
 * Settings and "Connect GitHub" join this menu when they exist.
 */
export function AccountMenu() {
  const { data: user } = useCurrentUser()
  const signOut = useSignOut()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const firstItem = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    firstItem.current?.focus()
    const close = (returnFocus: boolean) => {
      setOpen(false)
      if (returnFocus) button.current?.focus()
    }
    const onKey = (event: KeyboardEvent) =>
      event.key === 'Escape' && close(true)
    const onPointer = (event: PointerEvent) =>
      !root.current?.contains(event.target as Node) && close(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  if (!user) return null
  const initials = user.name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account: ${user.name}`}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm text-ink-muted transition-colors duration-200 hover:bg-surface hover:text-ink"
      >
        <span
          aria-hidden="true"
          className="flex size-7 items-center justify-center rounded-full border border-accent/40 bg-accent-dim font-mono text-xs font-semibold text-ink"
        >
          {initials}
        </span>
        <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
        <ChevronDown
          className={`size-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute top-full right-0 z-50 mt-2 w-64 rounded-xl border border-line bg-surface p-1.5 shadow-2xl shadow-black transition-[opacity,scale] duration-150 starting:opacity-0 motion-safe:starting:scale-95"
        >
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate font-mono text-xs text-ink-faint">
              {user.email}
            </p>
          </div>
          <div className="my-1 h-px bg-line" role="separator" />
          <button
            ref={firstItem}
            type="button"
            role="menuitem"
            onClick={() => signOut.mutate()}
            disabled={signOut.isPending}
            className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm text-ink-muted transition-colors duration-200 hover:bg-surface-2 hover:text-ink focus-visible:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut className="size-4" aria-hidden="true" />
            {signOut.isPending ? 'Signing out…' : 'Sign out'}
          </button>
          {signOut.isError && (
            <p role="alert" className="px-2.5 pt-1 pb-1.5 text-xs text-danger">
              Could not sign out. Try again.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
