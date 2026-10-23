'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Belt } from '@/components/Belt'
import { useT } from '@/components/I18n'
import { IconCheck, IconChevronLeft, IconChevronRight, IconPlus, IconSearch } from '@/components/Icons'
import { CLASS_TYPES, type ClassType, trainsIn } from '@/lib/belts'
import { addDays } from '@/lib/dates'
import type { RosterStudent } from '@/lib/data'
import { normalize, sortByName } from '@/lib/text'

const LAST_CLASS_KEY = 'btu:lastClass'

type Props = {
  date: string
  today: string
  initialType: ClassType | null
  students: RosterStudent[]
  present: string[]
}

export function AttendanceBoard({ date, today, initialType, students, present }: Props) {
  const router = useRouter()
  const t = useT()
  const [classType, setClassType] = useState<ClassType>(() => {
    if (initialType) return initialType
    const hasGi = present.some((k) => k.endsWith(':gi'))
    const hasNogi = present.some((k) => k.endsWith(':nogi'))
    return hasNogi && !hasGi ? 'nogi' : 'gi'
  })
  const [checked, setChecked] = useState(() => new Set(present))
  const [pending, setPending] = useState(() => new Set<string>())
  const [query, setQuery] = useState('')
  const [showOthers, setShowOthers] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // With no explicit choice and nothing checked in yet, reopen the class type used last time.
  useEffect(() => {
    if (initialType || present.length) return
    try {
      const last = localStorage.getItem(LAST_CLASS_KEY)
      if (last === 'gi' || last === 'nogi') setClassType(last)
    } catch {}
  }, [initialType, present.length])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  function chooseClass(c: ClassType) {
    setClassType(c)
    try {
      localStorage.setItem(LAST_CLASS_KEY, c)
    } catch {}
    window.history.replaceState(null, '', `/?date=${date}&type=${c}`)
  }

  async function toggle(id: number) {
    const key = `${id}:${classType}`
    if (pending.has(key)) return
    const on = !checked.has(key)
    const flip = (value: boolean) =>
      setChecked((prev) => {
        const next = new Set(prev)
        if (value) next.add(key)
        else next.delete(key)
        return next
      })
    flip(on)
    setPending((p) => new Set(p).add(key))
    navigator.vibrate?.(8)
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: id, date, classType, present: on }),
      })
      if (res.status === 401) {
        window.location.href = '/login'
        return
      }
      if (!res.ok) throw new Error()
    } catch {
      flip(!on)
      setToast(t.att.saveFailed)
    } finally {
      setPending((p) => {
        const next = new Set(p)
        next.delete(key)
        return next
      })
    }
  }

  const counts = useMemo(() => {
    const c = { gi: 0, nogi: 0 }
    for (const k of checked) {
      if (k.endsWith(':gi')) c.gi++
      else if (k.endsWith(':nogi')) c.nogi++
    }
    return c
  }, [checked])

  const q = normalize(query.trim())
  const sorted = useMemo(() => sortByName(students), [students])
  const isOn = (id: number) => checked.has(`${id}:${classType}`)
  const otherType: ClassType = classType === 'gi' ? 'nogi' : 'gi'

  let regulars: RosterStudent[]
  let others: RosterStudent[] = []
  if (q) {
    regulars = sorted.filter((s) => normalize(s.name).includes(q))
  } else {
    regulars = sorted.filter((s) => trainsIn(s.training_type, classType) || isOn(s.id))
    others = sorted.filter((s) => !regulars.includes(s))
  }

  const row = (s: RosterStudent) => {
    const key = `${s.id}:${classType}`
    const on = checked.has(key)
    return (
      <button
        key={s.id}
        type="button"
        className={`row checkin ${pending.has(key) ? 'pending' : ''}`}
        aria-pressed={on}
        onClick={() => toggle(s.id)}
      >
        <Belt belt={s.belt} stripes={s.stripes} size="sm" />
        <span className="row-main">
          <span className="row-title" style={{ display: 'block' }}>
            {s.name}
          </span>
          <span className="row-sub">
            {t.belt(s.belt, s.stripes)}
            {!trainsIn(s.training_type, classType) && <span>· {t.training(s.training_type)}</span>}
            {!s.active && <span className="pill">{t.common.archived}</span>}
          </span>
        </span>
        <span className="check">
          <IconCheck />
        </span>
      </button>
    )
  }

  const newHref = `/students/new?checkin=${classType}&date=${date}`
  const total = counts[classType]

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <img src="/icons/icon-192.png" alt="" />
          <div style={{ minWidth: 0 }}>
            <small>Bosnae Teamu United</small>
            <h1>{t.nav.attendance}</h1>
          </div>
        </div>
        <Link href={newHref} className="icon-btn" aria-label={t.att.addNew}>
          <IconPlus />
        </Link>
      </header>

      <div className="content">
        <div className="datebar">
          <Link
            className="icon-btn"
            href={`/?date=${addDays(date, -1)}&type=${classType}`}
            aria-label={t.att.prevDay}
            replace
          >
            <IconChevronLeft />
          </Link>
          <label className="date-label">
            <span>{t.date(date, { weekday: true })}</span>
            <small>{t.dayCaption(date, today)}</small>
            <input
              type="date"
              value={date}
              aria-label={t.att.pickDate}
              onChange={(e) => e.target.value && router.replace(`/?date=${e.target.value}&type=${classType}`)}
            />
          </label>
          <Link
            className="icon-btn"
            href={`/?date=${addDays(date, 1)}&type=${classType}`}
            aria-label={t.att.nextDay}
            replace
          >
            <IconChevronRight />
          </Link>
        </div>

        <div className="segmented" role="group" aria-label={t.att.classType}>
          {CLASS_TYPES.map((c) => (
            <button key={c} type="button" aria-pressed={classType === c} onClick={() => chooseClass(c)}>
              {t.att.classTab(c)} <span className="count">{counts[c]}</span>
            </button>
          ))}
        </div>

        <div className="card summary">
          <div>
            <div className="big">{total}</div>
            <div className="muted small">
              {t.att.onTheMat} · {t.cls(classType)}
              {date !== today && ` · ${t.date(date, { year: false })}`}
            </div>
          </div>
          {date !== today && (
            <Link href={`/?type=${classType}`} className="btn btn-sm" replace>
              {t.att.backToToday}
            </Link>
          )}
        </div>

        {students.length === 0 ? (
          <div className="card empty">
            <strong>{t.att.emptyTitle}</strong>
            {t.att.emptyBody}
            <div>
              <Link href="/students/new" className="btn btn-primary">
                <IconPlus /> {t.att.addFirst}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <label className="search">
              <IconSearch />
              <span className="sr-only">{t.common.searchStudents}</span>
              <input
                className="input"
                type="search"
                placeholder={t.common.searchName}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
            </label>

            <section>
              <h2 className="section-title">
                <span>{q ? t.att.results : t.att.group(classType)}</span>
                <span>{t.att.tapHint}</span>
              </h2>
              {regulars.length ? (
                <div className="card list">{regulars.map(row)}</div>
              ) : (
                <div className="card empty">
                  {q ? (
                    <>
                      <strong>{t.att.noOne(query.trim())}</strong>
                      <Link href={newHref} className="btn btn-primary">
                        <IconPlus /> {t.att.addNew}
                      </Link>
                    </>
                  ) : (
                    t.att.noRegulars(classType)
                  )}
                </div>
              )}
            </section>

            {others.length > 0 && (
              <section>
                <h2 className="section-title">
                  <span>{t.att.others(otherType)}</span>
                  <button type="button" onClick={() => setShowOthers((v) => !v)}>
                    {showOthers ? t.att.hide : t.att.show(others.length)}
                  </button>
                </h2>
                {showOthers && <div className="card list">{others.map(row)}</div>}
              </section>
            )}
          </>
        )}
      </div>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  )
}
