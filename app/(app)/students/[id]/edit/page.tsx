import Link from 'next/link'
import { notFound } from 'next/navigation'
import { IconChevronLeft } from '@/components/Icons'
import { requireAuth } from '@/lib/auth'
import { getStudent } from '@/lib/data'
import { today } from '@/lib/dates'
import { getT } from '@/lib/locale'
import { updateStudentAction } from '../../actions'
import { StudentForm } from '../../StudentForm'

export async function generateMetadata() {
  return { title: (await getT()).common.edit }
}

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth()
  const id = Number((await params).id)
  const [student, t] = await Promise.all([Number.isInteger(id) ? getStudent(id) : null, getT()])
  if (!student) notFound()

  return (
    <>
      <header className="topbar">
        <Link href={`/students/${id}`} className="back" aria-label={t.common.back}>
          <IconChevronLeft />
        </Link>
        <h1>{t.form.editTitle(student.name.split(' ')[0])}</h1>
      </header>
      <div className="content">
        <StudentForm action={updateStudentAction.bind(null, id)} student={student} today={today()} />
      </div>
    </>
  )
}
