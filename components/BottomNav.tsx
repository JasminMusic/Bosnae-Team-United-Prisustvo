'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconChart, IconMat, IconUsers } from './Icons'

const TABS = [
  { href: '/', label: 'Attendance', Icon: IconMat, match: (p: string) => p === '/' },
  { href: '/students', label: 'Students', Icon: IconUsers, match: (p: string) => p.startsWith('/students') },
  { href: '/stats', label: 'Stats', Icon: IconChart, match: (p: string) => p.startsWith('/stats') },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <div className="bottom-nav">
      <nav aria-label="Main">
        {TABS.map(({ href, label, Icon, match }) => (
          <Link key={href} href={href} aria-current={match(pathname) ? 'page' : undefined}>
            <Icon />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
