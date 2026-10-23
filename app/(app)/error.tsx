'use client'

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="login">
      <div className="card login-card">
        <h1>Something went wrong</h1>
        <p className="muted">
          The app couldn’t load data. Check your internet connection. If it keeps happening, check that the
          database is connected in Vercel.
        </p>
        <button className="btn btn-primary" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </main>
  )
}
