'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Belt } from '@/components/Belt'
import { IconChevronRight, IconPlus, IconSearch } from '@/components/Icons'
import { BELTS, beltLabel, beltRank, trainingLabel } from '@/lib/belts'
import { durationSince, relativeDay } from '@/lib/dates'
import type { StudentWithStats } from '@/lib/data'
import { compareNames, normalize } from '@/lib/text'

type Filter = 'all' | 'gi' | 'nogi' | 'both' | 'archived'
type Sort = 'name' | 'belt' | 'start' | 'last'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'gi', label: 'Gi' },
  { id: 'nogi', label: 'No-Gi' },
  { id: 'both', label: 'Both' },
  { id: 'archived', label: 'Archived' },
]

const PREFS_KEY = 'btu:studentListPrefs'

export function StudentList({ students, today }: { students: StudentWithStats[]; today: string }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [belt, setBelt] = useState('')
  const [sort, setSort] = useState<Sort>('name')

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}')
      if (saved.sort) setSort(saved.sort)
    } catch {}
  }, [])

  function changeSort(s: Sort) {
    setSort(s)
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ sort: s }))
    } catch {}
  }

  const q = normalize(query.trim())
  const visible = useMemo(() => {
    const list = students.filter((s) => {
      if (filter === 'archived' ? s.active : !s.active) return false
      if (filter === 'gi' || filter === 'nogi' || filter === 'both') {
        if (s.training_type !== filter) return false
      }
      if (belt && s.belt !== belt) return false
      if (q && !normalize(s.name).includes(q)) return false
      return true
    })
    const byName = (a: StudentWithStats, b: StudentWithStats) => compareNames(a.name, b.name)
    const sorters: Record<Sort, (a: StudentWithStats, b: StudentWithStats) => number> = {
      name: byName,
      belt: (a, b) => beltRank(b.belt) - beltRank(a.belt) || b.stripes - a.stripes || byName(a, b),
      start: (a, b) => a.start_date.localeCompare(b.start_date) || byName(a, b),
      last: (a, b) => (b.last_seen ?? '').localeCompare(a.last_seen ?? '') || byName(a, b),
    }
    return list.sort(sorters[sort])
  }, [students, filter, belt, q, sort])

  const beltsInUse = useMemo(() => new Set(students.map((s) => s.belt)), [students])

  if (students.length === 0) {
    return (
      <div className="card empty">
        <strong>No students yet</strong>
        Add everyone who trains at the club: belt, Gi / No-Gi and the date they started.
        <div>
          <Link href="/students/new" className="btn btn-primary">
            <IconPlus /> Add first student
          </Link>
        </div>
      </div>
    )
  }

  return (
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

      <div className="chips" role="group" aria-label="Filter">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
        <select className="chip" value={belt} onChange={(e) => setBelt(e.target.value)} aria-label="Filter by belt">
          <option value="">All belts</option>
          {BELTS.filter((b) => beltsInUse.has(b.id)).map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
        <select className="chip" value={sort} onChange={(e) => changeSort(e.target.value as Sort)} aria-label="Sort by">
          <option value="name">Sort: Name</option>
          <option value="belt">Sort: Belt</option>
          <option value="start">Sort: Longest training</option>
          <option value="last">Sort: Last trained</option>
        </select>
      </div>

      <section>
        <h2 className="section-title">
          <span>
            {visible.length} {visible.length === 1 ? 'student' : 'students'}
          </span>
        </h2>
        {visible.length ? (
          <div className="card list">
            {visible.map((s) => (
              <Link key={s.id} href={`/students/${s.id}`} className="row">
                <Belt belt={s.belt} stripes={s.stripes} size="sm" />
                <span className="row-main">
                  <span className="row-title" style={{ display: 'block' }}>
                    {s.name}
                  </span>
                  <span className="row-sub">
                    <span>{beltLabel(s.belt, s.stripes).replace(' belt', '')}</span>
                    <span className={`pill pill-${s.training_type}`}>{trainingLabel(s.training_type)}</span>
                  </span>
                </span>
                <span className="row-end">
                  <strong>{durationSince(s.start_date, today)}</strong>
                  {relativeDay(s.last_seen, today)}
                </span>
                <IconChevronRight className="chevron" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="card empty">No students match these filters.</div>
        )}
      </section>
    </>
  )
}
