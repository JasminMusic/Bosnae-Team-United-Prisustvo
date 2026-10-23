'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useT } from './I18n'
import { IconChart, IconMat, IconUsers } from './Icons'

const TABS = [
  { href: '/', key: 'attendance', Icon: IconMat, match: (p: string) => p === '/' },
  { href: '/students', key: 'students', Icon: IconUsers, match: (p: string) => p.startsWith('/students') },
  { href: '/stats', key: 'stats', Icon: IconChart, match: (p: string) => p.startsWith('/stats') },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const t = useT()
  return (
    <div className="bottom-nav">
      <nav aria-label="Main">
        {TABS.map(({ href, key, Icon, match }) => (
          <Link key={href} href={href} aria-current={match(pathname) ? 'page' : undefined}>
            <Icon />
            {t.nav[key]}
          </Link>
        ))}
      </nav>
    </div>
  )
}
