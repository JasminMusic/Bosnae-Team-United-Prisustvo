'use server'

import { redirect } from 'next/navigation'
import { checkPassword, endSession, passwordConfigured, startSession } from '@/lib/auth'

export type LoginState = { error?: 'noPassword' | 'wrongPassword' } | null

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!passwordConfigured()) return { error: 'noPassword' }
  const password = String(formData.get('password') ?? '')
  if (!checkPassword(password)) {
    // Slow down guessing.
    await new Promise((r) => setTimeout(r, 800))
    return { error: 'wrongPassword' }
  }
  await startSession()
  redirect('/')
}

export async function logout() {
  await endSession()
  redirect('/login')
}
