import Link from 'next/link'
import { IconPlus } from '@/components/Icons'
import { requireAuth } from '@/lib/auth'
import { listStudents } from '@/lib/data'
import { today } from '@/lib/dates'
import { StudentList } from './StudentList'

export const metadata = { title: 'Students' }

export default async function StudentsPage() {
  await requireAuth()
  const students = await listStudents()
  const active = students.filter((s) => s.active).length

  return (
    <>
      <header className="topbar">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1>Students</h1>
          <div className="muted small">{active} active</div>
        </div>
        <Link href="/students/new" className="btn btn-primary btn-sm">
          <IconPlus /> Add
        </Link>
      </header>
      <div className="content">
        <StudentList students={students} today={today()} />
      </div>
    </>
  )
}
