import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { LoginForm } from './LoginForm'

export const metadata = { title: 'Log in' }

export default async function LoginPage() {
  if (await isAuthenticated()) redirect('/')
  return (
    <main className="login">
      <div className="card login-card">
        <img src="/icons/icon-192.png" alt="" />
        <div>
          <h1>Bosnae Teamu United</h1>
          <p className="muted small" style={{ margin: '4px 0 0' }}>
            Brazilian Jiu-Jitsu · Coach app
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
