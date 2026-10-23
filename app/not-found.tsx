import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="login">
      <div className="card login-card">
        <h1>Not found</h1>
        <p className="muted">This page or student doesn’t exist (maybe it was deleted).</p>
        <Link href="/" className="btn btn-primary">
          Go to attendance
        </Link>
      </div>
    </main>
  )
}
