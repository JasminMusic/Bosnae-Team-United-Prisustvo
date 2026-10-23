// Dates are handled as plain 'YYYY-MM-DD' strings everywhere (Postgres DATE),
// so there is never any time-zone drift between the phone, server and database.

export const CLUB_TIMEZONE = process.env.CLUB_TIMEZONE || 'Europe/Sarajevo'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function isIsoDate(v: unknown): v is string {
  if (typeof v !== 'string' || !ISO_DATE.test(v)) return false
  const d = new Date(v + 'T00:00:00Z')
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v
}

/** Today's date in the club's time zone. */
export function today(): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CLUB_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function toUtc(iso: string) {
  return new Date(iso + 'T00:00:00Z')
}

export function addDays(iso: string, days: number): string {
  const d = toUtc(iso)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function daysBetween(from: string, to: string) {
  return Math.round((toUtc(to).getTime() - toUtc(from).getTime()) / 86_400_000)
}

export function formatDate(iso: string | null | undefined, opts?: { weekday?: boolean; year?: boolean }) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: opts?.weekday ? 'short' : undefined,
    day: 'numeric',
    month: 'short',
    year: opts?.year === false ? undefined : 'numeric',
  }).format(toUtc(iso))
}

export function formatMonth(iso: string) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(toUtc(iso))
}

/** "3 yrs 2 mos", "5 mos", "12 days" */
export function durationSince(from: string, to: string = today()) {
  const a = toUtc(from)
  const b = toUtc(to)
  if (b < a) return 'starts ' + formatDate(from)
  let months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth())
  if (b.getUTCDate() < a.getUTCDate()) months--
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (months < 1) {
    const days = daysBetween(from, to)
    return `${days} day${days === 1 ? '' : 's'}`
  }
  const parts: string[] = []
  if (years) parts.push(`${years} yr${years === 1 ? '' : 's'}`)
  if (rest) parts.push(`${rest} mo${rest === 1 ? '' : 's'}`)
  return parts.join(' ')
}

/** "today", "yesterday", "5 days ago", or a date for anything older than ~2 months */
export function relativeDay(iso: string | null | undefined, ref: string = today()) {
  if (!iso) return 'never'
  const d = daysBetween(iso, ref)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  if (d > 1 && d < 60) return `${d} days ago`
  return formatDate(iso)
}

export function startOfMonth(iso: string) {
  return iso.slice(0, 8) + '01'
}

/** Monday of the week containing `iso`. */
export function startOfWeek(iso: string) {
  const dow = (toUtc(iso).getUTCDay() + 6) % 7
  return addDays(iso, -dow)
}
