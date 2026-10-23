'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { LOCALE_COOKIE, isLocale } from '@/lib/i18n'

// No login needed: the language can be changed on the login screen too.
export async function setLocaleAction(locale: string) {
  if (!isLocale(locale)) return
  const store = await cookies()
  store.set(LOCALE_COOKIE, locale, {
    path: '/',
    sameSite: 'lax',
    maxAge: 365 * 86_400,
    // Readable by offline.html, which picks its language from it.
    httpOnly: false,
  })
  revalidatePath('/', 'layout')
}
