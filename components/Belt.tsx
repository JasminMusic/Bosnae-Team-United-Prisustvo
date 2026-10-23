'use client'

import { getBelt } from '@/lib/belts'
import { useT } from './I18n'

type Props = {
  belt: string
  stripes?: number
  size?: 'sm' | 'md' | 'lg'
}

/** A drawn BJJ belt: colour, kids centre stripe, and the rank bar with stripes. */
export function Belt({ belt, stripes = 0, size = 'md' }: Props) {
  const t = useT()
  const b = getBelt(belt)
  const isBlack = b.id === 'black'
  const count = Math.max(0, Math.min(stripes, b.maxStripes))
  const label = t.belt(b.id, count)
  return (
    <span
      className={`belt ${size === 'md' ? '' : 'belt-' + size}`}
      style={{ background: b.color }}
      role="img"
      aria-label={label}
      title={label}
    >
      {b.center && <span className="belt-center" style={{ background: b.center }} />}
      <span className={`belt-bar ${isBlack ? 'red' : ''}`}>
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className="belt-stripe" />
        ))}
      </span>
    </span>
  )
}
