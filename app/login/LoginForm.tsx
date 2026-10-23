'use client'

import { useActionState } from 'react'
import { login } from './actions'

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null)
  return (
    <form action={action}>
      <label className="field">
        <span>Coach password</span>
        <input
          className="input"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          autoFocus
        />
      </label>
      {state?.error && <p className="notice" role="alert">{state.error}</p>}
      <button className="btn btn-primary btn-block" disabled={pending}>
        {pending ? 'Checking…' : 'Log in'}
      </button>
    </form>
  )
}
