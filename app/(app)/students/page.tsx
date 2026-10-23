import Link from 'next/link'
import { IconPlus } from '@/components/Icons'
import { requireAuth } from '@/lib/auth'
import { listStudents } from '@/lib/data'
import { today } from '@/lib/dates'
import { getT } from '@/lib/locale'
import { StudentList } from './StudentList'

export async function generateMetadata() {
  return { title: (await getT()).nav.students }
}

export default async function StudentsPage() {
  await requireAuth()
  const [students, t] = await Promise.all([listStudents(), getT()])
  const active = students.filter((s) => s.active).length

  return (
    <>
      <header className="topbar">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1>{t.list.title}</h1>
          <div className="muted small">{t.list.active(active)}</div>
        </div>
        <Link href="/students/new" className="btn btn-primary btn-sm">
          <IconPlus /> {t.common.add}
        </Link>
      </header>
      <div className="content">
        <StudentList students={students} today={today()} />
      </div>
    </>
  )
}
