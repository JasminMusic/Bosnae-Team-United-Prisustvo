'use client'

import { useTransition } from 'react'
import { IconStripe } from '@/components/Icons'
import { addStripeAction, deletePromotionAction, deleteStudentAction, setActiveAction } from '../actions'

type Props = {
  id: number
  name: string
  active: boolean
  canAddStripe: boolean
  stripeWord: string
}

export function StudentActions({ id, name, active, canAddStripe, stripeWord }: Props) {
  const [pending, start] = useTransition()

  return (
    <div className="actions">
      {canAddStripe && active && (
        <button
          type="button"
          className="btn btn-accent"
          disabled={pending}
          onClick={() => {
            if (confirm(`Give ${name} a ${stripeWord} today?`)) start(() => addStripeAction(id))
          }}
        >
          <IconStripe /> Add {stripeWord}
        </button>
      )}
      <button
        type="button"
        className="btn"
        disabled={pending}
        onClick={() => {
          const msg = active
            ? `Archive ${name}? They will be hidden from attendance, but their history is kept.`
            : `Restore ${name} to active students?`
          if (confirm(msg)) start(() => setActiveAction(id, !active))
        }}
      >
        {active ? 'Archive' : 'Restore'}
      </button>
      <button
        type="button"
        className="btn btn-danger"
        disabled={pending}
        onClick={() => {
          if (confirm(`Permanently delete ${name} and all their attendance? This cannot be undone.\n\nTip: use Archive instead to keep their history.`)) {
            start(() => deleteStudentAction(id))
          }
        }}
      >
        Delete
      </button>
    </div>
  )
}

export function DeletePromotionButton({ studentId, promotionId }: { studentId: number; promotionId: number }) {
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      className="icon-btn"
      style={{ width: 32, height: 32, border: 0, color: 'var(--muted)' }}
      aria-label="Remove this promotion entry"
      disabled={pending}
      onClick={() => {
        if (confirm('Remove this entry from the promotion history?')) start(() => deletePromotionAction(studentId, promotionId))
      }}
    >
      ×
    </button>
  )
}
