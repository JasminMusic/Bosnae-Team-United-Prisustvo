import 'server-only'
import { createHash, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE, SESSION_DAYS, createToken, verifyToken } from './session'

export function passwordConfigured() {
  return Boolean(process.env.APP_PASSWORD)
}

export function checkPassword(input: string) {
  const expected = process.env.APP_PASSWORD
  if (!expected) return false
  const a = createHash('sha256').update(input).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

export async function isAuthenticated() {
  if (!passwordConfigured()) return false
  const store = await cookies()
  return verifyToken(store.get(SESSION_COOKIE)?.value)
}

/** Call at the top of every Server Action / Route Handler / protected page. */
export async function requireAuth() {
  if (!(await isAuthenticated())) redirect('/login')
}

export async function startSession() {
  const store = await cookies()
  store.set(SESSION_COOKIE, await createToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 86_400,
  })
}

export async function endSession() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}
