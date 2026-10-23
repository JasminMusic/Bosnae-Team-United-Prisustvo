import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Belt } from '@/components/Belt'
import { IconChevronLeft, IconEdit, IconPhone } from '@/components/Icons'
import { requireAuth } from '@/lib/auth'
import { getBelt } from '@/lib/belts'
import { getAttendanceHistory, getPromotions, getStudent, getStudentStats } from '@/lib/data'
import { today } from '@/lib/dates'
import { getT } from '@/lib/locale'
import { DeletePromotionButton, StudentActions } from './StudentActions'

const HISTORY_LIMIT = 120

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  const student = Number.isInteger(id) ? await getStudent(id) : null
  return { title: student?.name ?? (await getT()).notFound.title }
}

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth()
  const id = Number((await params).id)
  const student = Number.isInteger(id) ? await getStudent(id) : null
  if (!student) notFound()

  const [stats, promotions, history, t] = await Promise.all([
    getStudentStats(id),
    getPromotions(id),
    getAttendanceHistory(id, HISTORY_LIMIT),
    getT(),
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
        <Link href="/students" className="back" aria-label={t.student.backToList}>
          <IconChevronLeft />
        </Link>
        <h1>{student.name}</h1>
        <Link href={`/students/${id}/edit`} className="btn btn-sm">
          <IconEdit /> {t.common.edit}
        </Link>
      </header>

      <div className="content">
        <div className="card hero">
          <Belt belt={student.belt} stripes={student.stripes} size="lg" />
          <div>
            <h2>{student.name}</h2>
            <div className="row-sub" style={{ fontSize: '0.9rem' }}>
              <span>{t.belt(student.belt, student.stripes)}</span>
              <span className={`pill pill-${student.training_type}`}>{t.training(student.training_type)}</span>
              {!student.active && <span className="pill">{t.student.archived}</span>}
            </div>
          </div>
          <div className="muted small">
            {t.student.trainingSince} <b style={{ color: 'var(--text)' }}>{t.date(student.start_date)}</b> ·{' '}
            {t.duration(student.start_date, now)}
          </div>
        </div>

        <div className="card stat-grid">
          <div className="stat">
            <b>{stats.total}</b>
            <span>{t.student.total}</span>
          </div>
          <div className="stat">
            <b>{stats.recent}</b>
            <span>{t.student.last30}</span>
          </div>
          <div className="stat">
            <b>{stats.this_month}</b>
            <span>{t.student.thisMonth}</span>
          </div>
          <div className="stat">
            <b>{stats.gi}</b>
            <span>{t.cls('gi')}</span>
          </div>
          <div className="stat">
            <b>{stats.nogi}</b>
            <span>{t.cls('nogi')}</span>
          </div>
          <div className="stat">
            <b>{stats.since_promotion}</b>
            <span>{t.student.sincePromotion}</span>
          </div>
        </div>

        <dl className="card kv" style={{ margin: 0 }}>
          <div>
            <dt>{t.student.lastTrained}</dt>
            <dd>{t.relDay(stats.last_seen, now)}</dd>
          </div>
          <div>
            <dt>{t.student.lastPromotion}</dt>
            <dd>
              {stats.last_promotion
                ? `${t.date(stats.last_promotion)} (${t.student.ago(t.duration(stats.last_promotion, now))})`
                : '—'}
            </dd>
          </div>
          {student.phone && (
            <div>
              <dt>{t.student.phone}</dt>
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
            <h2 className="section-title">{t.student.notes}</h2>
            <div className="card notes">{student.notes}</div>
          </section>
        )}

        <StudentActions
          id={id}
          active={student.active}
          canAddStripe={student.stripes < getBelt(student.belt).maxStripes}
          isBlack={student.belt === 'black'}
          name={student.name}
        />

        <section>
          <h2 className="section-title">{t.student.promotions}</h2>
          <div className="card list">
            {promotions.length === 0 && <div className="empty">{t.student.noPromotions}</div>}
            {promotions.map((p) => (
              <div key={p.id} className="row" style={{ minHeight: 52 }}>
                <Belt belt={p.belt} stripes={p.stripes} size="sm" />
                <span className="row-main">
                  <span className="row-title" style={{ display: 'block', fontWeight: 600 }}>
                    {t.belt(p.belt, p.stripes)}
                  </span>
                  <span className="row-sub">{t.date(p.date)}</span>
                </span>
                {promotions.length > 1 && <DeletePromotionButton studentId={id} promotionId={p.id} />}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">
            <span>{t.student.attendance}</span>
            {history.length >= HISTORY_LIMIT && <span>{t.student.latest(HISTORY_LIMIT)}</span>}
          </h2>
          <div className="card">
            {history.length === 0 && <div className="empty">{t.student.noClasses}</div>}
            {[...months].map(([month, entries]) => (
              <div key={month} className="month-group">
                <header>
                  <span>{t.month(month + '-01')}</span>
                  <span className="muted">{t.student.classes(entries.length)}</span>
                </header>
                <div className="day-chips">
                  {entries.map((e) => (
                    <Link
                      key={e.date + e.class_type}
                      href={`/?date=${e.date}&type=${e.class_type}`}
                      className={`pill pill-${e.class_type}`}
                    >
                      {t.date(e.date, { weekday: true, year: false })} · {t.cls(e.class_type)}
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
