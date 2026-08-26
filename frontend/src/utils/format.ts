/** The backend sends naive UTC timestamps; treat them as UTC, not local. */
function parseUtc(value: string): Date {
  return new Date(value.endsWith('Z') ? value : `${value}Z`)
}

export function relativeTime(value: string | null): string {
  if (!value) return 'never'

  const seconds = Math.round((Date.now() - parseUtc(value).getTime()) / 1000)
  if (seconds < 60) return 'just now'

  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'minute'],
    [3600, 'hour'],
    [86400, 'day'],
    [604800, 'week'],
  ]

  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  let chosen: [number, Intl.RelativeTimeFormatUnit] = units[0]
  for (const unit of units) {
    if (seconds >= unit[0]) chosen = unit
  }
  return formatter.format(-Math.round(seconds / chosen[0]), chosen[1])
}

/** `https://github.com/pallets/flask` -> `github.com/pallets/flask` */
export function shortUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\.git$/, '')
}
