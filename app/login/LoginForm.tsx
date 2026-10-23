'use client'

import { useActionState } from 'react'
import { useT } from '@/components/I18n'
import { login } from './actions'

export function LoginForm() {
  const t = useT()
  const [state, action, pending] = useActionState(login, null)
  return (
    <form action={action}>
      <label className="field">
        <span>{t.login.password}</span>
        <input
          className="input"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          autoFocus
        />
      </label>
      {state?.error && (
        <p className="notice" role="alert">
          {t.errors[state.error]}
        </p>
      )}
      <button className="btn btn-primary btn-block" disabled={pending}>
        {pending ? t.login.checking : t.login.submit}
      </button>
    </form>
  )
}
