'use client'

import { startTransition, useActionState, useState } from 'react'
import { Belt } from '@/components/Belt'
import { BELTS, TRAINING_TYPES, type ClassType, classLabel, getBelt } from '@/lib/belts'
import { formatDate } from '@/lib/dates'
import type { Student } from '@/lib/data'
import type { FormState } from './actions'

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  student?: Student
  today: string
  checkin?: { type: ClassType; date: string }
}

const ADULT = BELTS.filter((b) => b.group === 'adult')
const KIDS = BELTS.filter((b) => b.group === 'kids')

export function StudentForm({ action, student, today, checkin }: Props) {
  const editing = Boolean(student)
  const [state, formAction, pending] = useActionState(action, null)
  const [belt, setBelt] = useState(student?.belt ?? 'white')
  const [stripes, setStripes] = useState(student?.stripes ?? 0)
  const [startDate, setStartDate] = useState(student?.start_date ?? today)
  const [beltSince, setBeltSince] = useState<string | null>(null)
  const maxStripes = getBelt(belt).maxStripes
  const promoted = editing && (belt !== student!.belt || stripes !== student!.stripes)
  const kidsOpen = getBelt(belt).group === 'kids'

  function chooseBelt(id: string) {
    if (id === belt) return
    setBelt(id)
    // A new belt normally starts with no stripes.
    setStripes(student && id === student.belt ? student.stripes : 0)
  }

  // Submit via a transition so React doesn't reset the fields when validation fails.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(() => formAction(fd))
  }

  const beltOption = (b: (typeof BELTS)[number]) => (
    <div className="belt-option" key={b.id}>
      <input
        type="radio"
        name="belt"
        id={`belt-${b.id}`}
        value={b.id}
        checked={belt === b.id}
        onChange={() => chooseBelt(b.id)}
      />
      <label htmlFor={`belt-${b.id}`}>
        <Belt belt={b.id} size="sm" />
        {b.label}
      </label>
    </div>
  )

  return (
    <form className="form" onSubmit={onSubmit}>
      {checkin && (
        <>
          <input type="hidden" name="checkin" value={checkin.type} />
          <input type="hidden" name="checkin_date" value={checkin.date} />
        </>
      )}

      <div className="card card-pad form">
        <label className="field">
          <span>Full name *</span>
          <input
            className="input"
            name="name"
            defaultValue={student?.name}
            required
            maxLength={120}
            autoComplete="off"
            autoCapitalize="words"
            autoFocus={!editing}
          />
        </label>

        <fieldset className="field">
          <legend>Trains</legend>
          <div className="segmented">
            {TRAINING_TYPES.map((t) => (
              <div key={t.id}>
                <input
                  type="radio"
                  name="training_type"
                  id={`tt-${t.id}`}
                  value={t.id}
                  defaultChecked={(student?.training_type ?? 'both') === t.id}
                />
                <label htmlFor={`tt-${t.id}`}>{t.label}</label>
              </div>
            ))}
          </div>
        </fieldset>

        <label className="field">
          <span>Started training *</span>
          <input
            className="input"
            type="date"
            name="start_date"
            value={startDate}
            max={today}
            required
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
      </div>

      <div className="card card-pad form">
        <div style={{ display: 'grid', gap: 10 }}>
          <Belt belt={belt} stripes={stripes} size="lg" />
        </div>

        <fieldset className="field">
          <legend>Belt</legend>
          <div className="belt-picker">{ADULT.map(beltOption)}</div>
          <details className="more" open={kidsOpen || undefined}>
            <summary>Kids belts (under 16) ▾</summary>
            <div className="belt-picker">{KIDS.map(beltOption)}</div>
          </details>
        </fieldset>

        <fieldset className="field">
          <legend>{belt === 'black' ? 'Degrees' : 'Stripes'}</legend>
          <div className="segmented">
            {Array.from({ length: maxStripes + 1 }, (_, n) => (
              <div key={n}>
                <input
                  type="radio"
                  name="stripes"
                  id={`stripes-${n}`}
                  value={n}
                  checked={stripes === n}
                  onChange={() => setStripes(n)}
                />
                <label htmlFor={`stripes-${n}`}>{n}</label>
              </div>
            ))}
          </div>
        </fieldset>

        {!editing && (
          <label className="field">
            <span>Has this belt since</span>
            <input
              className="input"
              type="date"
              name="belt_since"
              value={beltSince ?? startDate}
              max={today}
              onChange={(e) => setBeltSince(e.target.value)}
            />
            <small>Used for “classes since last promotion”. Leave as is if you don’t know.</small>
          </label>
        )}

        {promoted && (
          <label className="field">
            <span>Promotion date</span>
            <input className="input" type="date" name="promotion_date" defaultValue={today} max={today} />
            <small>Belt or stripes changed, so this will be saved in the promotion history.</small>
          </label>
        )}
      </div>

      <div className="card card-pad form">
        <label className="field">
          <span>Phone</span>
          <input
            className="input"
            type="tel"
            name="phone"
            defaultValue={student?.phone ?? ''}
            maxLength={40}
            autoComplete="off"
            inputMode="tel"
          />
        </label>
        <label className="field">
          <span>Notes</span>
          <textarea
            className="input"
            name="notes"
            defaultValue={student?.notes ?? ''}
            maxLength={2000}
            placeholder="Injuries, competition goals, parent contact…"
          />
        </label>
      </div>

      {state?.error && (
        <p className="notice" role="alert">
          {state.error}
        </p>
      )}

      <div className="form-actions">
        <button className="btn btn-primary btn-block" disabled={pending}>
          {pending
            ? 'Saving…'
            : editing
              ? 'Save changes'
              : checkin
                ? `Add & check in to ${classLabel(checkin.type)} (${formatDate(checkin.date, { year: false })})`
                : 'Add student'}
        </button>
      </div>
    </form>
  )
}
