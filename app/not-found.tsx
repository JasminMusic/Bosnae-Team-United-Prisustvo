import Link from 'next/link'
import { getT } from '@/lib/locale'

export default async function NotFound() {
  const t = await getT()
  return (
    <main className="login">
      <div className="card login-card">
        <h1>{t.notFound.title}</h1>
        <p className="muted">{t.notFound.body}</p>
        <Link href="/" className="btn btn-primary">
          {t.notFound.home}
        </Link>
      </div>
    </main>
  )
}
