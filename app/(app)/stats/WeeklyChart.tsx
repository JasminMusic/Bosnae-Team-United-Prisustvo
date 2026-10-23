'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/dates'

type Week = { week: string; gi: number; nogi: number }

const W = 320
const H = 150
const PAD_L = 24
const PAD_B = 18
const GAP = 2 // surface gap between stacked segments

/** Stacked weekly check-ins, Gi (bottom) + No-Gi (top). Tap a bar for its numbers. */
export function WeeklyChart({ weeks }: { weeks: Week[] }) {
  const [selected, setSelected] = useState<number | null>(null)
  const max = Math.max(4, ...weeks.map((w) => w.gi + w.nogi))
  const step = niceStep(max)
  const top = Math.ceil(max / step) * step
  const plotH = H - PAD_B - 6
  const slot = (W - PAD_L) / weeks.length
  const barW = Math.min(18, slot * 0.6)
  const y = (v: number) => 6 + plotH - (v / top) * plotH
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step)

  const shown = selected ?? weeks.length - 1
  const sw = weeks[shown]

  return (
    <div className="card chart">
      <div className="chart-head">
        <h3>Check-ins per week</h3>
        <div className="legend" aria-hidden="true">
          <span>
            <i style={{ background: 'var(--series-gi)' }} />
            Gi
          </span>
          <span>
            <i style={{ background: 'var(--series-nogi)' }} />
            No-Gi
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Weekly check-ins for the last 12 weeks">
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid-line" x1={PAD_L} x2={W} y1={y(t)} y2={y(t)} />
            <text className="axis-label" x={PAD_L - 6} y={y(t) + 3} textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        {weeks.map((w, i) => {
          const cx = PAD_L + slot * i + slot / 2
          const x = cx - barW / 2
          const giH = (w.gi / top) * plotH
          const nogiH = (w.nogi / top) * plotH
          const giTop = y(w.gi)
          const nogiBottom = giTop - (w.gi && w.nogi ? GAP : 0)
          const label = (weeks.length - 1 - i) % 3 === 0
          return (
            <g key={w.week}>
              {selected === i && <rect className="bar-selected" x={PAD_L + slot * i + 1} y={4} width={slot - 2} height={plotH + 4} rx={4} />}
              {w.gi > 0 && (
                <path d={barPath(x, giTop, barW, giH, w.nogi === 0)} fill="var(--series-gi)" />
              )}
              {w.nogi > 0 && (
                <path d={barPath(x, nogiBottom - nogiH, barW, nogiH, true)} fill="var(--series-nogi)" />
              )}
              {label && (
                <text className="axis-label" x={cx} y={H - 4} textAnchor="middle">
                  {formatDate(w.week, { year: false })}
                </text>
              )}
              <rect
                className="bar-hit"
                x={PAD_L + slot * i}
                y={0}
                width={slot}
                height={H}
                onClick={() => setSelected(selected === i ? null : i)}
                onMouseEnter={() => setSelected(i)}
              >
                <title>{`Week of ${formatDate(w.week)}: ${w.gi} Gi, ${w.nogi} No-Gi`}</title>
              </rect>
            </g>
          )
        })}
      </svg>

      <div className="chart-readout" aria-live="polite">
        Week of {formatDate(sw.week, { year: false })}: <b>{sw.gi + sw.nogi}</b> check-ins ({sw.gi} Gi · {sw.nogi} No-Gi)
      </div>

      <details className="more" style={{ marginTop: 8 }}>
        <summary>View as table</summary>
        <table className="data-table">
          <thead>
            <tr>
              <th>Week of</th>
              <th>Gi</th>
              <th>No-Gi</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {[...weeks].reverse().map((w) => (
              <tr key={w.week}>
                <td>{formatDate(w.week)}</td>
                <td>{w.gi}</td>
                <td>{w.nogi}</td>
                <td>{w.gi + w.nogi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}

function niceStep(max: number) {
  const raw = max / 4
  const mag = 10 ** Math.floor(Math.log10(raw))
  const n = raw / mag
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag
}

/** Bar anchored at the bottom; only the top (data end) is rounded. */
function barPath(x: number, yTop: number, w: number, h: number, roundTop: boolean) {
  const r = roundTop ? Math.min(4, h, w / 2) : 0
  const b = yTop + h
  return `M${x},${b} V${yTop + r} Q${x},${yTop} ${x + r},${yTop} H${x + w - r} Q${x + w},${yTop} ${x + w},${yTop + r} V${b} Z`
}
