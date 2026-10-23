'use client'

import { useT } from '@/components/I18n'

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  const t = useT()
  return (
    <main className="login">
      <div className="card login-card">
        <h1>{t.failure.title}</h1>
        <p className="muted">{t.failure.body}</p>
        <button className="btn btn-primary" onClick={() => reset()}>
          {t.common.tryAgain}
        </button>
      </div>
    </main>
  )
}
