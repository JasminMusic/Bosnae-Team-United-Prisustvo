'use client'

import { startTransition, useActionState, useState } from 'react'
import { Belt } from '@/components/Belt'
import { useT } from '@/components/I18n'
import { BELTS, TRAINING_TYPES, type ClassType, getBelt } from '@/lib/belts'
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
  const t = useT()
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
        {t.beltName(b.id)}
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
          <span>{t.form.name}</span>
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
          <legend>{t.form.trains}</legend>
          <div className="segmented">
            {TRAINING_TYPES.map((id) => (
              <div key={id}>
                <input
                  type="radio"
                  name="training_type"
                  id={`tt-${id}`}
                  value={id}
                  defaultChecked={(student?.training_type ?? 'both') === id}
                />
                <label htmlFor={`tt-${id}`}>{t.training(id)}</label>
              </div>
            ))}
          </div>
        </fieldset>

        <label className="field">
          <span>{t.form.started}</span>
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
        <Belt belt={belt} stripes={stripes} size="lg" />

        <fieldset className="field">
          <legend>{t.form.belt}</legend>
          <div className="belt-picker">{ADULT.map(beltOption)}</div>
          <details className="more" open={kidsOpen || undefined}>
            <summary>{t.form.kidsBelts}</summary>
            <div className="belt-picker">{KIDS.map(beltOption)}</div>
          </details>
        </fieldset>

        <fieldset className="field">
          <legend>{belt === 'black' ? t.form.degrees : t.form.stripes}</legend>
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
            <span>{t.form.beltSince}</span>
            <input
              className="input"
              type="date"
              name="belt_since"
              value={beltSince ?? startDate}
              max={today}
              onChange={(e) => setBeltSince(e.target.value)}
            />
            <small>{t.form.beltSinceHint}</small>
          </label>
        )}

        {promoted && (
          <label className="field">
            <span>{t.form.promotionDate}</span>
            <input className="input" type="date" name="promotion_date" defaultValue={today} max={today} />
            <small>{t.form.promotionHint}</small>
          </label>
        )}
      </div>

      <div className="card card-pad form">
        <label className="field">
          <span>{t.form.phone}</span>
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
          <span>{t.form.notes}</span>
          <textarea
            className="input"
            name="notes"
            defaultValue={student?.notes ?? ''}
            maxLength={2000}
            placeholder={t.form.notesPlaceholder}
          />
        </label>
      </div>

      {state?.error && (
        <p className="notice" role="alert">
          {t.errors[state.error]}
        </p>
      )}

      <div className="form-actions">
        <button className="btn btn-primary btn-block" disabled={pending}>
          {pending
            ? t.form.saving
            : editing
              ? t.form.save
              : checkin
                ? t.form.createAndCheckin(checkin.type, t.date(checkin.date, { year: false }))
                : t.form.create}
        </button>
      </div>
    </form>
  )
}
