import Link from 'next/link'
import { Belt } from '@/components/Belt'
import { IconDownload, IconLogout } from '@/components/Icons'
import { logout } from '@/app/login/actions'
import { requireAuth } from '@/lib/auth'
import { BELTS, TRAINING_TYPES, beltLabel, getBelt } from '@/lib/belts'
import { getClubStats, listStudents } from '@/lib/data'
import { addDays, relativeDay, startOfMonth, today } from '@/lib/dates'
import { WeeklyChart } from './WeeklyChart'

export const metadata = { title: 'Stats' }

const ABSENT_DAYS = 21

export default async function StatsPage() {
  await requireAuth()
  const now = today()
  const [students, club] = await Promise.all([listStudents(), getClubStats()])
  const active = students.filter((s) => s.active)
  const monthStart = startOfMonth(now)
  const newThisMonth = active.filter((s) => s.start_date >= monthStart).length
  const { month } = club
  const avg = month.sessions ? (month.checkins / month.sessions).toFixed(1) : '0'

  const beltCounts = BELTS.map((b) => ({ belt: b, n: active.filter((s) => s.belt === b.id).length })).filter(
    (x) => x.n > 0,
  )
  const beltMax = Math.max(1, ...beltCounts.map((x) => x.n))
  const typeCounts = TRAINING_TYPES.map((t) => ({ ...t, n: active.filter((s) => s.training_type === t.id).length }))
  const typeMax = Math.max(1, ...typeCounts.map((x) => x.n))

  const cutoff = addDays(now, -ABSENT_DAYS)
  const absent = active
    .filter((s) => (s.last_seen ? s.last_seen <= cutoff : s.start_date <= cutoff))
    .sort((a, b) => (b.last_seen ?? '').localeCompare(a.last_seen ?? ''))

  return (
    <>
      <header className="topbar">
        <h1>Club stats</h1>
      </header>

      <div className="content">
        <div className="tiles">
          <div className="card tile">
            <span>Active students</span>
            <b>{active.length}</b>
            <em>{newThisMonth} new this month</em>
          </div>
          <div className="card tile">
            <span>Check-ins this month</span>
            <b>{month.checkins}</b>
            <em>Last month: {month.last_checkins}</em>
          </div>
          <div className="card tile">
            <span>Classes this month</span>
            <b>{month.sessions}</b>
            <em>Avg {avg} per class</em>
          </div>
          <div className="card tile">
            <span>Trained this month</span>
            <b>{month.people}</b>
            <em>of {active.length} active</em>
          </div>
        </div>

        <WeeklyChart weeks={club.weeks} />

        <section>
          <h2 className="section-title">Belts</h2>
          <div className="card" style={{ padding: '8px 0' }}>
            {beltCounts.length === 0 && <div className="empty">No active students.</div>}
            {beltCounts.map(({ belt, n }) => (
              <div className="hbar-row" key={belt.id}>
                <span className="label">
                  <Belt belt={belt.id} size="sm" />
                  {belt.label}
                </span>
                <div className="hbar-track">
                  <div className="hbar-fill" style={{ width: `${(n / beltMax) * 100}%` }} />
                </div>
                <span className="value">{n}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">Trains</h2>
          <div className="card" style={{ padding: '8px 0' }}>
            {typeCounts.map((t) => (
              <div className="hbar-row" key={t.id}>
                <span className="label">
                  <span className={`pill pill-${t.id}`}>{t.label}</span>
                </span>
                <div className="hbar-track">
                  <div className="hbar-fill" style={{ width: `${(t.n / typeMax) * 100}%` }} />
                </div>
                <span className="value">{t.n}</span>
              </div>
            ))}
          </div>
        </section>

        {club.top.length > 0 && (
          <section>
            <h2 className="section-title">Most classes this month</h2>
            <div className="card list">
              {club.top.map((s, i) => (
                <Link key={s.id} href={`/students/${s.id}`} className="row" style={{ minHeight: 52 }}>
                  <span className="muted" style={{ width: 16, fontWeight: 700 }}>
                    {i + 1}
                  </span>
                  <Belt belt={s.belt} stripes={s.stripes} size="sm" />
                  <span className="row-main row-title">{s.name}</span>
                  <span className="row-end">
                    <strong>{s.n}</strong>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="section-title">
            <span>Not seen for {ABSENT_DAYS}+ days</span>
            <span>{absent.length}</span>
          </h2>
          <div className="card list">
            {absent.length === 0 && <div className="empty">Everyone has trained recently. 💪</div>}
            {absent.slice(0, 25).map((s) => (
              <Link key={s.id} href={`/students/${s.id}`} className="row" style={{ minHeight: 52 }}>
                <Belt belt={s.belt} stripes={s.stripes} size="sm" />
                <span className="row-main">
                  <span className="row-title" style={{ display: 'block' }}>
                    {s.name}
                  </span>
                  <span className="row-sub">{beltLabel(s.belt, s.stripes)}</span>
                </span>
                <span className="row-end">
                  <strong>{relativeDay(s.last_seen, now)}</strong>
                  {s.phone ? s.phone : getBelt(s.belt).label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">Data</h2>
          <div className="actions">
            <a className="btn" href="/api/export/students" download>
              <IconDownload /> Students CSV
            </a>
            <a className="btn" href="/api/export/attendance" download>
              <IconDownload /> Attendance CSV
            </a>
          </div>
          <p className="muted small" style={{ margin: '8px 2px 0' }}>
            Opens in Excel or Google Sheets. Good for backups.
          </p>
        </section>

        <form action={logout}>
          <button className="btn btn-block">
            <IconLogout /> Log out
          </button>
        </form>
      </div>
    </>
  )
}
