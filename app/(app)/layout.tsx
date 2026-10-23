import { BottomNav } from '@/components/BottomNav'
import { requireAuth } from '@/lib/auth'
import { databaseUrl } from '@/lib/db'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireAuth()

  if (!databaseUrl()) {
    return (
      <main className="login">
        <div className="card login-card">
          <h1>Connect a database</h1>
          <p className="muted">
            The app is running, but no database is connected yet. In Vercel open your project →{' '}
            <b>Storage</b> → <b>Create Database</b> → <b>Neon (Postgres)</b>, connect it to this project, then
            redeploy. See README.md for step-by-step instructions.
          </p>
        </div>
      </main>
    )
  }

  return (
    <div className="shell">
      {children}
      <BottomNav />
    </div>
  )
}
