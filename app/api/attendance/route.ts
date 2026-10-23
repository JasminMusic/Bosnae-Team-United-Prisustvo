import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { isClassType } from '@/lib/belts'
import { setAttendance } from '@/lib/data'
import { isIsoDate } from '@/lib/dates'

// Check-ins go through a route handler (not a Server Action) so quick taps run in
// parallel and don't re-render the whole page.
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }
  const body = await request.json().catch(() => null)
  const studentId = Number(body?.studentId)
  const { date, classType, present } = body ?? {}
  if (!Number.isInteger(studentId) || studentId <= 0 || !isIsoDate(date) || !isClassType(String(classType)) || typeof present !== 'boolean') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  try {
    await setAttendance(studentId, date, classType, present)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Could not save' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
