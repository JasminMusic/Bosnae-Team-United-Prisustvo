import { requireAuth } from '@/lib/auth'
import { getRoster } from '@/lib/data'
import { isIsoDate, today } from '@/lib/dates'
import { getT } from '@/lib/locale'
import { AttendanceBoard } from './AttendanceBoard'

export async function generateMetadata() {
  return { title: (await getT()).nav.attendance }
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; type?: string }>
}) {
  await requireAuth()
  const sp = await searchParams
  const now = today()
  const date = isIsoDate(sp.date) ? sp.date : now
  const type = sp.type === 'gi' || sp.type === 'nogi' ? sp.type : null
  const { students, present } = await getRoster(date)

  return (
    <AttendanceBoard
      key={date}
      date={date}
      today={now}
      initialType={type}
      students={students}
      present={present.map((p) => `${p.student_id}:${p.class_type}`)}
    />
  )
}
