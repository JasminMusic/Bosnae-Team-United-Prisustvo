import { isAuthenticated } from '@/lib/auth'
import { beltLabel, classLabel, trainingLabel } from '@/lib/belts'
import { exportAttendance, listStudents } from '@/lib/data'
import { today } from '@/lib/dates'
import { compareNames } from '@/lib/text'

function csv(rows: (string | number | boolean | null)[][]) {
  const cell = (v: string | number | boolean | null) => {
    const s = v == null ? '' : String(v)
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  // BOM so Excel opens Bosnian letters (č, ć, ž, š, đ) correctly.
  return '﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n')
}

export async function GET(_req: Request, ctx: { params: Promise<{ kind: string }> }) {
  if (!(await isAuthenticated())) return new Response('Not logged in', { status: 401 })
  const { kind } = await ctx.params

  let body: string
  if (kind === 'students') {
    const students = (await listStudents()).sort((a, b) => compareNames(a.name, b.name))
    body = csv([
      ['Name', 'Belt', 'Stripes', 'Trains', 'Started', 'Total classes', 'Last 30 days', 'Last trained', 'Phone', 'Active', 'Notes'],
      ...students.map((s) => [
        s.name,
        beltLabel(s.belt, 0).replace(' belt', ''),
        s.stripes,
        trainingLabel(s.training_type),
        s.start_date,
        s.total,
        s.recent,
        s.last_seen,
        s.phone,
        s.active ? 'yes' : 'no',
        s.notes,
      ]),
    ])
  } else if (kind === 'attendance') {
    const rows = await exportAttendance()
    body = csv([
      ['Date', 'Class', 'Name', 'Belt', 'Stripes'],
      ...rows.map((r) => [r.date, classLabel(r.class_type), r.name, beltLabel(r.belt, 0).replace(' belt', ''), r.stripes]),
    ])
  } else {
    return new Response('Not found', { status: 404 })
  }

  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="btu-${kind}-${today()}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
