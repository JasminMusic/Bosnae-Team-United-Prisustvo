import { BottomNav } from '@/components/BottomNav'
import { requireAuth } from '@/lib/auth'
import { databaseUrl } from '@/lib/db'
import { getT } from '@/lib/locale'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireAuth()

  if (!databaseUrl()) {
    const t = await getT()
    return (
      <main className="login">
        <div className="card login-card">
          <h1>{t.setup.title}</h1>
          <p className="muted">{t.setup.body}</p>
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
