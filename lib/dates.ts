// Dates are handled as plain 'YYYY-MM-DD' strings everywhere (Postgres DATE),
// so there is never any time-zone drift between the phone, server and database.
// Turning dates into words (per language) lives in lib/i18n.ts.

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

/** Year, month (0-11), day of month and weekday (0 = Monday). */
export function dateParts(iso: string) {
  const d = toUtc(iso)
  return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate(), weekday: (d.getUTCDay() + 6) % 7 }
}

/** Whole years + months between two dates, or days when under a month. */
export function diffParts(from: string, to: string) {
  const a = toUtc(from)
  const b = toUtc(to)
  let months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth())
  if (b.getUTCDate() < a.getUTCDate()) months--
  return {
    future: b < a,
    years: Math.floor(months / 12),
    months: months % 12,
    totalMonths: months,
    days: daysBetween(from, to),
  }
}

export function startOfMonth(iso: string) {
  return iso.slice(0, 8) + '01'
}

/** Monday of the week containing `iso`. */
export function startOfWeek(iso: string) {
  return addDays(iso, -dateParts(iso).weekday)
}
