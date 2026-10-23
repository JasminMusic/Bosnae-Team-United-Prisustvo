'use server'

import { redirect } from 'next/navigation'
import { checkPassword, endSession, passwordConfigured, startSession } from '@/lib/auth'

export type LoginState = { error?: string } | null

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!passwordConfigured()) {
    return { error: 'APP_PASSWORD is not set on the server. Add it in Vercel → Settings → Environment Variables.' }
  }
  const password = String(formData.get('password') ?? '')
  if (!checkPassword(password)) {
    // Slow down guessing.
    await new Promise((r) => setTimeout(r, 800))
    return { error: 'Wrong password. Try again.' }
  }
  await startSession()
  redirect('/')
}

export async function logout() {
  await endSession()
  redirect('/login')
}
