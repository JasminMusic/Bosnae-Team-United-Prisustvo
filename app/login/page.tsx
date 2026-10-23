import { redirect } from 'next/navigation'
import { LanguageToggle } from '@/components/LanguageToggle'
import { isAuthenticated } from '@/lib/auth'
import { getT } from '@/lib/locale'
import { LoginForm } from './LoginForm'

export async function generateMetadata() {
  return { title: (await getT()).login.title }
}

export default async function LoginPage() {
  if (await isAuthenticated()) redirect('/')
  const t = await getT()
  return (
    <main className="login">
      <div className="card login-card">
        <LanguageToggle />
        <img src="/icons/icon-192.png" alt="" />
        <div>
          <h1>Bosnae Teamu United</h1>
          <p className="muted small" style={{ margin: '4px 0 0' }}>
            {t.login.subtitle}
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
