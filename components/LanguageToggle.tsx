'use client'

import { useTransition } from 'react'
import { setLocaleAction } from '@/app/locale-actions'
import { LOCALES } from '@/lib/i18n'
import { useT } from './I18n'

export function LanguageToggle() {
  const t = useT()
  const [pending, start] = useTransition()
  return (
    <div className="lang-toggle" role="group" aria-label={t.lang}>
      {LOCALES.map((l) => (
        <button
          key={l.id}
          type="button"
          lang={l.id}
          title={l.label}
          aria-label={l.label}
          aria-pressed={t.locale === l.id}
          disabled={pending}
          onClick={() => t.locale !== l.id && start(() => setLocaleAction(l.id))}
        >
          {l.id.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
