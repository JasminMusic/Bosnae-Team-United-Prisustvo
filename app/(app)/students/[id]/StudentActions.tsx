'use client'

import { useTransition } from 'react'
import { useT } from '@/components/I18n'
import { IconStripe } from '@/components/Icons'
import { addStripeAction, deletePromotionAction, deleteStudentAction, setActiveAction } from '../actions'

type Props = {
  id: number
  name: string
  active: boolean
  canAddStripe: boolean
  isBlack: boolean
}

export function StudentActions({ id, name, active, canAddStripe, isBlack }: Props) {
  const t = useT()
  const [pending, start] = useTransition()

  return (
    <div className="actions">
      {canAddStripe && active && (
        <button
          type="button"
          className="btn btn-accent"
          disabled={pending}
          onClick={() => {
            if (confirm(t.student.addStripeConfirm(name, isBlack))) start(() => addStripeAction(id))
          }}
        >
          <IconStripe /> {t.student.addStripe(isBlack)}
        </button>
      )}
      <button
        type="button"
        className="btn"
        disabled={pending}
        onClick={() => {
          const msg = active ? t.student.archiveConfirm(name) : t.student.restoreConfirm(name)
          if (confirm(msg)) start(() => setActiveAction(id, !active))
        }}
      >
        {active ? t.student.archive : t.student.restore}
      </button>
      <button
        type="button"
        className="btn btn-danger"
        disabled={pending}
        onClick={() => {
          if (confirm(t.student.deleteConfirm(name))) start(() => deleteStudentAction(id))
        }}
      >
        {t.student.delete}
      </button>
    </div>
  )
}

export function DeletePromotionButton({ studentId, promotionId }: { studentId: number; promotionId: number }) {
  const t = useT()
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      className="icon-btn"
      style={{ width: 32, height: 32, border: 0, color: 'var(--muted)' }}
      aria-label={t.student.removePromotion}
      disabled={pending}
      onClick={() => {
        if (confirm(t.student.removePromotionConfirm)) start(() => deletePromotionAction(studentId, promotionId))
      }}
    >
      ×
    </button>
  )
}
