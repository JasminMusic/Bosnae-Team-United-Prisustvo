import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Belt } from '@/components/Belt'
import { IconChevronLeft, IconEdit, IconPhone } from '@/components/Icons'
import { requireAuth } from '@/lib/auth'
import { beltLabel, classLabel, getBelt, trainingLabel } from '@/lib/belts'
import { getAttendanceHistory, getPromotions, getStudent, getStudentStats } from '@/lib/data'
import { durationSince, formatDate, formatMonth, relativeDay, today } from '@/lib/dates'
import { DeletePromotionButton, StudentActions } from './StudentActions'

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth()
  const id = Number((await params).id)
  const student = Number.isInteger(id) ? await getStudent(id) : null
  if (!student) notFound()

  const [stats, promotions, history] = await Promise.all([
    getStudentStats(id),
    getPromotions(id),
    getAttendanceHistory(id, 120),
  ])
  const now = today()

  const months = new Map<string, typeof history>()
  for (const entry of history) {
    const key = entry.date.slice(0, 7)
    months.set(key, [...(months.get(key) ?? []), entry])
  }

  return (
    <>
      <header className="topbar">
        <Link href="/students" className="back" aria-label="Back to students">
          <IconChevronLeft />
        </Link>
        <h1>{student.name}</h1>
        <Link href={`/students/${id}/edit`} className="btn btn-sm">
          <IconEdit /> Edit
        </Link>
      </header>

      <div className="content">
        <div className="card hero">
          <Belt belt={student.belt} stripes={student.stripes} size="lg" />
          <div>
            <h2>{student.name}</h2>
            <div className="row-sub" style={{ fontSize: '0.9rem' }}>
              <span>{beltLabel(student.belt, student.stripes)}</span>
              <span className={`pill pill-${student.training_type}`}>{trainingLabel(student.training_type)}</span>
              {!student.active && <span className="pill">Archived</span>}
            </div>
          </div>
          <div className="muted small">
            Training since <b style={{ color: 'var(--text)' }}>{formatDate(student.start_date)}</b> ·{' '}
            {durationSince(student.start_date, now)}
          </div>
        </div>

        <div className="card stat-grid">
          <div className="stat">
            <b>{stats.total}</b>
            <span>Total classes</span>
          </div>
          <div className="stat">
            <b>{stats.recent}</b>
            <span>Last 30 days</span>
          </div>
          <div className="stat">
            <b>{stats.this_month}</b>
            <span>This month</span>
          </div>
          <div className="stat">
            <b>{stats.gi}</b>
            <span>Gi</span>
          </div>
          <div className="stat">
            <b>{stats.nogi}</b>
            <span>No-Gi</span>
          </div>
          <div className="stat">
            <b>{stats.since_promotion}</b>
            <span>Since promotion</span>
          </div>
        </div>

        <dl className="card kv" style={{ margin: 0 }}>
          <div>
            <dt>Last trained</dt>
            <dd>{relativeDay(stats.last_seen, now)}</dd>
          </div>
          <div>
            <dt>Last promotion</dt>
            <dd>
              {stats.last_promotion
                ? `${formatDate(stats.last_promotion)} (${durationSince(stats.last_promotion, now)} ago)`
                : '—'}
            </dd>
          </div>
          {student.phone && (
            <div>
              <dt>Phone</dt>
              <dd>
                <a href={`tel:${student.phone.replace(/[^\d+]/g, '')}`}>
                  <IconPhone style={{ width: 15, height: 15, verticalAlign: -2, marginRight: 4 }} />
                  {student.phone}
                </a>
              </dd>
            </div>
          )}
        </dl>

        {student.notes && (
          <section>
            <h2 className="section-title">Notes</h2>
            <div className="card notes">{student.notes}</div>
          </section>
        )}

        <StudentActions
          id={id}
          active={student.active}
          canAddStripe={student.stripes < getBelt(student.belt).maxStripes}
          stripeWord={student.belt === 'black' ? 'degree' : 'stripe'}
          name={student.name}
        />

        <section>
          <h2 className="section-title">Promotion history</h2>
          <div className="card list">
            {promotions.length === 0 && <div className="empty">No promotions recorded.</div>}
            {promotions.map((p) => (
              <div key={p.id} className="row" style={{ minHeight: 52 }}>
                <Belt belt={p.belt} stripes={p.stripes} size="sm" />
                <span className="row-main">
                  <span className="row-title" style={{ display: 'block', fontWeight: 600 }}>
                    {beltLabel(p.belt, p.stripes)}
                  </span>
                  <span className="row-sub">{formatDate(p.date)}</span>
                </span>
                {promotions.length > 1 && <DeletePromotionButton studentId={id} promotionId={p.id} />}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">
            <span>Attendance</span>
            {history.length >= 120 && <span>latest 120</span>}
          </h2>
          <div className="card">
            {history.length === 0 && <div className="empty">No classes recorded yet.</div>}
            {[...months].map(([month, entries]) => (
              <div key={month} className="month-group">
                <header>
                  <span>{formatMonth(month + '-01')}</span>
                  <span className="muted">
                    {entries.length} {entries.length === 1 ? 'class' : 'classes'}
                  </span>
                </header>
                <div className="day-chips">
                  {entries.map((e) => (
                    <Link
                      key={e.date + e.class_type}
                      href={`/?date=${e.date}&type=${e.class_type}`}
                      className={`pill pill-${e.class_type}`}
                    >
                      {formatDate(e.date, { weekday: true, year: false })} · {classLabel(e.class_type)}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
