import Link from 'next/link'
import { IconChevronLeft } from '@/components/Icons'
import { requireAuth } from '@/lib/auth'
import { isClassType } from '@/lib/belts'
import { isIsoDate, today } from '@/lib/dates'
import { createStudentAction } from '../actions'
import { StudentForm } from '../StudentForm'

export const metadata = { title: 'New student' }

export default async function NewStudentPage({
  searchParams,
}: {
  searchParams: Promise<{ checkin?: string; date?: string }>
}) {
  await requireAuth()
  const sp = await searchParams
  const checkin =
    sp.checkin && isClassType(sp.checkin) && isIsoDate(sp.date) ? { type: sp.checkin, date: sp.date } : undefined

  return (
    <>
      <header className="topbar">
        <Link href={checkin ? `/?date=${checkin.date}&type=${checkin.type}` : '/students'} className="back" aria-label="Back">
          <IconChevronLeft />
        </Link>
        <h1>New student</h1>
      </header>
      <div className="content">
        <StudentForm action={createStudentAction} today={today()} checkin={checkin} />
      </div>
    </>
  )
}
