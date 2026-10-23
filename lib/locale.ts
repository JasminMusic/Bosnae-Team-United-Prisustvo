import 'server-only'
import { cookies, headers } from 'next/headers'
import { LOCALE_COOKIE, type Locale, getMessages, isLocale, localeFromHeader } from './i18n'

/** The chosen language (cookie), or a guess from the phone's language settings. */
export async function getLocale(): Promise<Locale> {
  const chosen = (await cookies()).get(LOCALE_COOKIE)?.value
  if (isLocale(chosen)) return chosen
  return localeFromHeader((await headers()).get('accept-language'))
}

export async function getT() {
  return getMessages(await getLocale())
}
