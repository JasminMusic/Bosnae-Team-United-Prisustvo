'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Belt } from '@/components/Belt'
import { IconCheck, IconChevronLeft, IconChevronRight, IconPlus, IconSearch } from '@/components/Icons'
import { CLASS_TYPES, type ClassType, beltLabel, classLabel, trainingLabel, trainsIn } from '@/lib/belts'
import { addDays, daysBetween, formatDate } from '@/lib/dates'
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

function dayCaption(date: string, today: string) {
  const d = daysBetween(date, today)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d === -1) return 'Tomorrow'
  return d > 0 ? `${d} days ago` : `In ${-d} days`
}

export function AttendanceBoard({ date, today, initialType, students, present }: Props) {
  const router = useRouter()
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
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  function chooseClass(t: ClassType) {
    setClassType(t)
    try {
      localStorage.setItem(LAST_CLASS_KEY, t)
    } catch {}
    window.history.replaceState(null, '', `/?date=${date}&type=${t}`)
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
      setToast('Could not save. Check your internet connection and try again.')
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
            {beltLabel(s.belt, s.stripes)}
            {!trainsIn(s.training_type, classType) && <span>· {trainingLabel(s.training_type)}</span>}
            {!s.active && <span className="pill">archived</span>}
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
            <h1>Attendance</h1>
          </div>
        </div>
        <Link href={newHref} className="icon-btn" aria-label="Add new student">
          <IconPlus />
        </Link>
      </header>

      <div className="content">
        <div className="datebar">
          <Link
            className="icon-btn"
            href={`/?date=${addDays(date, -1)}&type=${classType}`}
            aria-label="Previous day"
            replace
          >
            <IconChevronLeft />
          </Link>
          <label className="date-label">
            <span>{formatDate(date, { weekday: true })}</span>
            <small>{dayCaption(date, today)}</small>
            <input
              type="date"
              value={date}
              aria-label="Pick a date"
              onChange={(e) => e.target.value && router.replace(`/?date=${e.target.value}&type=${classType}`)}
            />
          </label>
          <Link
            className="icon-btn"
            href={`/?date=${addDays(date, 1)}&type=${classType}`}
            aria-label="Next day"
            replace
          >
            <IconChevronRight />
          </Link>
        </div>

        <div className="segmented" role="group" aria-label="Class type">
          {CLASS_TYPES.map((t) => (
            <button key={t.id} type="button" aria-pressed={classType === t.id} onClick={() => chooseClass(t.id)}>
              {t.label} class <span className="count">{counts[t.id]}</span>
            </button>
          ))}
        </div>

        <div className="card summary">
          <div>
            <div className="big">{total}</div>
            <div className="muted small">
              on the mat · {classLabel(classType)}
              {date !== today && ` · ${formatDate(date, { year: false })}`}
            </div>
          </div>
          {date !== today && (
            <Link href={`/?type=${classType}`} className="btn btn-sm" replace>
              Back to today
            </Link>
          )}
        </div>

        {students.length === 0 ? (
          <div className="card empty">
            <strong>No students yet</strong>
            Add your students once, then check them in here every training.
            <div>
              <Link href="/students/new" className="btn btn-primary">
                <IconPlus /> Add first student
              </Link>
            </div>
          </div>
        ) : (
          <>
            <label className="search">
              <IconSearch />
              <span className="sr-only">Search students</span>
              <input
                className="input"
                type="search"
                placeholder="Search name…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
            </label>

            <section>
              <h2 className="section-title">
                <span>{q ? 'Results' : `${classLabel(classType)} students`}</span>
                <span>tap to check in</span>
              </h2>
              {regulars.length ? (
                <div className="card list">{regulars.map(row)}</div>
              ) : (
                <div className="card empty">
                  {q ? (
                    <>
                      <strong>No one called “{query.trim()}”</strong>
                      <Link href={newHref} className="btn btn-primary">
                        <IconPlus /> Add new student
                      </Link>
                    </>
                  ) : (
                    <>No students train {classLabel(classType)} only or both. See others below.</>
                  )}
                </div>
              )}
            </section>

            {others.length > 0 && (
              <section>
                <h2 className="section-title">
                  <span>Usually train {classType === 'gi' ? 'No-Gi' : 'Gi'} only</span>
                  <button type="button" onClick={() => setShowOthers((v) => !v)}>
                    {showOthers ? 'Hide' : `Show ${others.length}`}
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
