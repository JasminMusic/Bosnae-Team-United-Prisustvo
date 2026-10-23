'use client'

import { createContext, useContext } from 'react'
import { type Locale, getMessages } from '@/lib/i18n'

const LocaleContext = createContext<Locale>('en')

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

/** Translations for the current language, for Client Components. */
export function useT() {
  return getMessages(useContext(LocaleContext))
}
