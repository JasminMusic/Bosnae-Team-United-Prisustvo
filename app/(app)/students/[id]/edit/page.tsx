import Link from 'next/link'
import { notFound } from 'next/navigation'
import { IconChevronLeft } from '@/components/Icons'
import { requireAuth } from '@/lib/auth'
import { getStudent } from '@/lib/data'
import { today } from '@/lib/dates'
import { updateStudentAction } from '../../actions'
import { StudentForm } from '../../StudentForm'

export const metadata = { title: 'Edit student' }

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth()
  const id = Number((await params).id)
  const student = Number.isInteger(id) ? await getStudent(id) : null
  if (!student) notFound()

  return (
    <>
      <header className="topbar">
        <Link href={`/students/${id}`} className="back" aria-label="Back">
          <IconChevronLeft />
        </Link>
        <h1>Edit {student.name.split(' ')[0]}</h1>
      </header>
      <div className="content">
        <StudentForm action={updateStudentAction.bind(null, id)} student={student} today={today()} />
      </div>
    </>
  )
}
