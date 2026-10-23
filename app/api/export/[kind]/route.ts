import { isAuthenticated } from '@/lib/auth'
import { exportAttendance, listStudents } from '@/lib/data'
import { today } from '@/lib/dates'
import { getT } from '@/lib/locale'
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
  const [{ kind }, t] = await Promise.all([ctx.params, getT()])
  const c = t.csv

  let body: string
  let name: string
  if (kind === 'students') {
    const students = (await listStudents()).sort((a, b) => compareNames(a.name, b.name))
    name = c.students
    body = csv([
      [c.name, c.belt, c.stripes, c.trains, c.started, c.total, c.last30, c.lastTrained, c.phone, c.active, c.notes],
      ...students.map((s) => [
        s.name,
        t.beltName(s.belt),
        s.stripes,
        t.training(s.training_type),
        s.start_date,
        s.total,
        s.recent,
        s.last_seen,
        s.phone,
        s.active ? c.yes : c.no,
        s.notes,
      ]),
    ])
  } else if (kind === 'attendance') {
    const rows = await exportAttendance()
    name = c.attendance
    body = csv([
      [c.date, c.cls, c.name, c.belt, c.stripes],
      ...rows.map((r) => [r.date, t.cls(r.class_type), r.name, t.beltName(r.belt), r.stripes]),
    ])
  } else {
    return new Response('Not found', { status: 404 })
  }

  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="btu-${name}-${today()}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
