import Link from 'next/link'
import { IconChevronLeft } from '@/components/Icons'
import { requireAuth } from '@/lib/auth'
import { isClassType } from '@/lib/belts'
import { isIsoDate, today } from '@/lib/dates'
import { getT } from '@/lib/locale'
import { createStudentAction } from '../actions'
import { StudentForm } from '../StudentForm'

export async function generateMetadata() {
  return { title: (await getT()).form.newTitle }
}

export default async function NewStudentPage({
  searchParams,
}: {
  searchParams: Promise<{ checkin?: string; date?: string }>
}) {
  await requireAuth()
  const [sp, t] = await Promise.all([searchParams, getT()])
  const checkin =
    sp.checkin && isClassType(sp.checkin) && isIsoDate(sp.date) ? { type: sp.checkin, date: sp.date } : undefined

  return (
    <>
      <header className="topbar">
        <Link
          href={checkin ? `/?date=${checkin.date}&type=${checkin.type}` : '/students'}
          className="back"
          aria-label={t.common.back}
        >
          <IconChevronLeft />
        </Link>
        <h1>{t.form.newTitle}</h1>
      </header>
      <div className="content">
        <StudentForm action={createStudentAction} today={today()} checkin={checkin} />
      </div>
    </>
  )
}
