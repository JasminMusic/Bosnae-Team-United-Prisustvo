import { beltLabel, getBelt } from '@/lib/belts'

type Props = {
  belt: string
  stripes?: number
  size?: 'sm' | 'md' | 'lg'
}

/** A drawn BJJ belt: colour, kids centre stripe, and the rank bar with stripes. */
export function Belt({ belt, stripes = 0, size = 'md' }: Props) {
  const b = getBelt(belt)
  const isBlack = b.id === 'black'
  const count = Math.max(0, Math.min(stripes, b.maxStripes))
  return (
    <span
      className={`belt ${size === 'md' ? '' : 'belt-' + size}`}
      style={{ background: b.color }}
      role="img"
      aria-label={beltLabel(b.id, count)}
      title={beltLabel(b.id, count)}
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
