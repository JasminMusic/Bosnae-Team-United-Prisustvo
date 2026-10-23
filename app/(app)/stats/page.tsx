import Link from 'next/link'
import { Belt } from '@/components/Belt'
import { IconDownload, IconLogout } from '@/components/Icons'
import { LanguageToggle } from '@/components/LanguageToggle'
import { logout } from '@/app/login/actions'
import { requireAuth } from '@/lib/auth'
import { BELTS, TRAINING_TYPES, getBelt } from '@/lib/belts'
import { getClubStats, listStudents } from '@/lib/data'
import { addDays, startOfMonth, today } from '@/lib/dates'
import { getT } from '@/lib/locale'
import { WeeklyChart } from './WeeklyChart'

export async function generateMetadata() {
  return { title: (await getT()).nav.stats }
}

const ABSENT_DAYS = 21

export default async function StatsPage() {
  await requireAuth()
  const now = today()
  const [students, club, t] = await Promise.all([listStudents(), getClubStats(), getT()])
  const active = students.filter((s) => s.active)
  const monthStart = startOfMonth(now)
  const newThisMonth = active.filter((s) => s.start_date >= monthStart).length
  const { month } = club
  const avg = t.number(month.sessions ? month.checkins / month.sessions : 0, 1)

  const beltCounts = BELTS.map((b) => ({ belt: b, n: active.filter((s) => s.belt === b.id).length })).filter(
    (x) => x.n > 0,
  )
  const beltMax = Math.max(1, ...beltCounts.map((x) => x.n))
  const typeCounts = TRAINING_TYPES.map((id) => ({ id, n: active.filter((s) => s.training_type === id).length }))
  const typeMax = Math.max(1, ...typeCounts.map((x) => x.n))

  const cutoff = addDays(now, -ABSENT_DAYS)
  const absent = active
    .filter((s) => (s.last_seen ? s.last_seen <= cutoff : s.start_date <= cutoff))
    .sort((a, b) => (b.last_seen ?? '').localeCompare(a.last_seen ?? ''))

  return (
    <>
      <header className="topbar">
        <h1>{t.stats.title}</h1>
        <LanguageToggle />
      </header>

      <div className="content">
        <div className="tiles">
          <div className="card tile">
            <span>{t.stats.active}</span>
            <b>{active.length}</b>
            <em>{t.stats.newThisMonth(newThisMonth)}</em>
          </div>
          <div className="card tile">
            <span>{t.stats.checkins}</span>
            <b>{month.checkins}</b>
            <em>{t.stats.lastMonth(month.last_checkins)}</em>
          </div>
          <div className="card tile">
            <span>{t.stats.classes}</span>
            <b>{month.sessions}</b>
            <em>{t.stats.avg(avg)}</em>
          </div>
          <div className="card tile">
            <span>{t.stats.trained}</span>
            <b>{month.people}</b>
            <em>{t.stats.ofActive(active.length)}</em>
          </div>
        </div>

        <WeeklyChart weeks={club.weeks} />

        <section>
          <h2 className="section-title">{t.stats.belts}</h2>
          <div className="card" style={{ padding: '8px 0' }}>
            {beltCounts.length === 0 && <div className="empty">{t.stats.noActive}</div>}
            {beltCounts.map(({ belt, n }) => (
              <div className="hbar-row" key={belt.id}>
                <span className="label">
                  <Belt belt={belt.id} size="sm" />
                  {t.beltName(belt.id)}
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
          <h2 className="section-title">{t.stats.trains}</h2>
          <div className="card" style={{ padding: '8px 0' }}>
            {typeCounts.map(({ id, n }) => (
              <div className="hbar-row" key={id}>
                <span className="label">
                  <span className={`pill pill-${id}`}>{t.training(id)}</span>
                </span>
                <div className="hbar-track">
                  <div className="hbar-fill" style={{ width: `${(n / typeMax) * 100}%` }} />
                </div>
                <span className="value">{n}</span>
              </div>
            ))}
          </div>
        </section>

        {club.top.length > 0 && (
          <section>
            <h2 className="section-title">{t.stats.top}</h2>
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
            <span>{t.stats.absent(ABSENT_DAYS)}</span>
            <span>{absent.length}</span>
          </h2>
          <div className="card list">
            {absent.length === 0 && <div className="empty">{t.stats.allRecent}</div>}
            {absent.slice(0, 25).map((s) => (
              <Link key={s.id} href={`/students/${s.id}`} className="row" style={{ minHeight: 52 }}>
                <Belt belt={s.belt} stripes={s.stripes} size="sm" />
                <span className="row-main">
                  <span className="row-title" style={{ display: 'block' }}>
                    {s.name}
                  </span>
                  <span className="row-sub">{t.belt(s.belt, s.stripes)}</span>
                </span>
                <span className="row-end">
                  <strong>{t.relDay(s.last_seen, now)}</strong>
                  {s.phone ? s.phone : t.beltName(getBelt(s.belt).id)}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">{t.stats.data}</h2>
          <div className="actions">
            <a className="btn" href="/api/export/students" download>
              <IconDownload /> {t.stats.csvStudents}
            </a>
            <a className="btn" href="/api/export/attendance" download>
              <IconDownload /> {t.stats.csvAttendance}
            </a>
          </div>
          <p className="muted small" style={{ margin: '8px 2px 0' }}>
            {t.stats.csvHint}
          </p>
        </section>

        <form action={logout}>
          <button className="btn btn-block">
            <IconLogout /> {t.stats.logout}
          </button>
        </form>
      </div>
    </>
  )
}
