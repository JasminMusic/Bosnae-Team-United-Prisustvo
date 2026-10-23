import 'server-only'
import { db } from './db'
import { addDays, startOfMonth, startOfWeek, today } from './dates'
import type { ClassType, TrainingType } from './belts'

export type Student = {
  id: number
  name: string
  phone: string | null
  belt: string
  stripes: number
  training_type: TrainingType
  start_date: string
  notes: string | null
  active: boolean
}

export type StudentWithStats = Student & {
  total: number
  recent: number
  last_seen: string | null
}

export type StudentInput = {
  name: string
  phone: string | null
  belt: string
  stripes: number
  training_type: TrainingType
  start_date: string
  notes: string | null
}

const STUDENT_COLS = 'id, name, phone, belt, stripes, training_type, start_date, notes, active'

// ---------- Students ----------

export async function listStudents(): Promise<StudentWithStats[]> {
  const sql = await db()
  const since = addDays(today(), -30)
  return sql<StudentWithStats[]>`
    SELECT s.id, s.name, s.phone, s.belt, s.stripes, s.training_type, s.start_date, s.notes, s.active,
           COALESCE(a.total, 0)::int AS total,
           COALESCE(a.recent, 0)::int AS recent,
           a.last_seen
    FROM students s
    LEFT JOIN (
      SELECT student_id,
             count(*) AS total,
             count(*) FILTER (WHERE date > ${since}) AS recent,
             max(date) AS last_seen
      FROM attendance
      GROUP BY student_id
    ) a ON a.student_id = s.id
  `
}

export async function getStudent(id: number): Promise<Student | null> {
  const sql = await db()
  const rows = await sql<Student[]>`SELECT ${sql.unsafe(STUDENT_COLS)} FROM students WHERE id = ${id}`
  return rows[0] ?? null
}

export async function createStudent(input: StudentInput, beltSince: string) {
  const sql = await db()
  return sql.begin(async (tx) => {
    const [row] = await tx<{ id: number }[]>`
      INSERT INTO students ${tx(input, 'name', 'phone', 'belt', 'stripes', 'training_type', 'start_date', 'notes')}
      RETURNING id
    `
    await tx`
      INSERT INTO promotions (student_id, belt, stripes, date)
      VALUES (${row.id}, ${input.belt}, ${input.stripes}, ${beltSince})
    `
    return row.id
  })
}

/** Updates a student. If belt or stripes changed, a promotion is recorded on `promotionDate`. */
export async function updateStudent(id: number, input: StudentInput, promotionDate: string) {
  const sql = await db()
  await sql.begin(async (tx) => {
    const [before] = await tx<{ belt: string; stripes: number }[]>`
      SELECT belt, stripes FROM students WHERE id = ${id} FOR UPDATE
    `
    if (!before) return
    await tx`
      UPDATE students SET ${tx(input, 'name', 'phone', 'belt', 'stripes', 'training_type', 'start_date', 'notes')}
      WHERE id = ${id}
    `
    if (before.belt !== input.belt || before.stripes !== input.stripes) {
      await tx`
        INSERT INTO promotions (student_id, belt, stripes, date)
        VALUES (${id}, ${input.belt}, ${input.stripes}, ${promotionDate})
      `
    }
  })
}

export async function setStudentActive(id: number, active: boolean) {
  const sql = await db()
  await sql`UPDATE students SET active = ${active} WHERE id = ${id}`
}

export async function deleteStudent(id: number) {
  const sql = await db()
  await sql`DELETE FROM students WHERE id = ${id}`
}

export async function addStripe(id: number, maxStripes: number) {
  const sql = await db()
  await sql.begin(async (tx) => {
    const [s] = await tx<{ belt: string; stripes: number }[]>`
      UPDATE students SET stripes = stripes + 1
      WHERE id = ${id} AND stripes < ${maxStripes}
      RETURNING belt, stripes
    `
    if (s) {
      await tx`INSERT INTO promotions (student_id, belt, stripes, date) VALUES (${id}, ${s.belt}, ${s.stripes}, ${today()})`
    }
  })
}

export type Promotion = { id: number; belt: string; stripes: number; date: string }

export async function getPromotions(studentId: number): Promise<Promotion[]> {
  const sql = await db()
  return sql<Promotion[]>`
    SELECT id, belt, stripes, date FROM promotions
    WHERE student_id = ${studentId}
    ORDER BY date DESC, id DESC
  `
}

export async function deletePromotion(studentId: number, promotionId: number) {
  const sql = await db()
  await sql`DELETE FROM promotions WHERE id = ${promotionId} AND student_id = ${studentId}`
}

export type StudentStats = {
  total: number
  gi: number
  nogi: number
  recent: number
  this_month: number
  last_seen: string | null
  since_promotion: number
  last_promotion: string | null
}

export async function getStudentStats(id: number): Promise<StudentStats> {
  const sql = await db()
  const t = today()
  const [row] = await sql<StudentStats[]>`
    WITH lp AS (SELECT max(date) AS d FROM promotions WHERE student_id = ${id})
    SELECT count(*)::int AS total,
           count(*) FILTER (WHERE class_type = 'gi')::int AS gi,
           count(*) FILTER (WHERE class_type = 'nogi')::int AS nogi,
           count(*) FILTER (WHERE date > ${addDays(t, -30)})::int AS recent,
           count(*) FILTER (WHERE date >= ${startOfMonth(t)})::int AS this_month,
           max(date) AS last_seen,
           count(*) FILTER (WHERE date >= (SELECT d FROM lp))::int AS since_promotion,
           (SELECT d FROM lp) AS last_promotion
    FROM attendance WHERE student_id = ${id}
  `
  return row
}

export type AttendanceEntry = { date: string; class_type: ClassType }

export async function getAttendanceHistory(studentId: number, limit = 60): Promise<AttendanceEntry[]> {
  const sql = await db()
  return sql<AttendanceEntry[]>`
    SELECT date, class_type FROM attendance
    WHERE student_id = ${studentId}
    ORDER BY date DESC, class_type
    LIMIT ${limit}
  `
}

// ---------- Attendance ----------

export type RosterStudent = Pick<Student, 'id' | 'name' | 'belt' | 'stripes' | 'training_type' | 'active'>

/** Active students plus anyone (e.g. archived) who has a check-in on this date. */
export async function getRoster(date: string) {
  const sql = await db()
  const [students, present] = await Promise.all([
    sql<RosterStudent[]>`
      SELECT id, name, belt, stripes, training_type, active FROM students
      WHERE active OR id IN (SELECT student_id FROM attendance WHERE date = ${date})
    `,
    sql<{ student_id: number; class_type: ClassType }[]>`
      SELECT student_id, class_type FROM attendance WHERE date = ${date}
    `,
  ])
  return { students: [...students], present: [...present] }
}

export async function setAttendance(studentId: number, date: string, classType: ClassType, present: boolean) {
  const sql = await db()
  if (present) {
    await sql`
      INSERT INTO attendance (student_id, date, class_type)
      VALUES (${studentId}, ${date}, ${classType})
      ON CONFLICT (student_id, date, class_type) DO NOTHING
    `
  } else {
    await sql`DELETE FROM attendance WHERE student_id = ${studentId} AND date = ${date} AND class_type = ${classType}`
  }
}

// ---------- Club stats ----------

export async function getClubStats() {
  const sql = await db()
  const t = today()
  const monthStart = startOfMonth(t)
  const lastMonthStart = startOfMonth(addDays(monthStart, -1))
  const weeksFrom = addDays(startOfWeek(t), -7 * 11)

  const [month, weekly, top] = await Promise.all([
    sql<{ checkins: number; sessions: number; people: number; last_checkins: number; last_sessions: number }[]>`
      SELECT
        count(*) FILTER (WHERE date >= ${monthStart})::int AS checkins,
        count(DISTINCT (date, class_type)) FILTER (WHERE date >= ${monthStart})::int AS sessions,
        count(DISTINCT student_id) FILTER (WHERE date >= ${monthStart})::int AS people,
        count(*) FILTER (WHERE date < ${monthStart})::int AS last_checkins,
        count(DISTINCT (date, class_type)) FILTER (WHERE date < ${monthStart})::int AS last_sessions
      FROM attendance
      WHERE date >= ${lastMonthStart} AND date <= ${t}
    `,
    sql<{ week: string; gi: number; nogi: number }[]>`
      SELECT date_trunc('week', date::timestamp)::date AS week,
             count(*) FILTER (WHERE class_type = 'gi')::int AS gi,
             count(*) FILTER (WHERE class_type = 'nogi')::int AS nogi
      FROM attendance
      WHERE date >= ${weeksFrom} AND date <= ${t}
      GROUP BY 1
    `,
    sql<{ id: number; name: string; belt: string; stripes: number; n: number }[]>`
      SELECT s.id, s.name, s.belt, s.stripes, count(*)::int AS n
      FROM attendance a JOIN students s ON s.id = a.student_id
      WHERE a.date >= ${monthStart} AND a.date <= ${t}
      GROUP BY s.id
      ORDER BY n DESC, s.name
      LIMIT 5
    `,
  ])

  const byWeek = new Map(weekly.map((w) => [w.week, w]))
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const week = addDays(weeksFrom, i * 7)
    const w = byWeek.get(week)
    return { week, gi: w?.gi ?? 0, nogi: w?.nogi ?? 0 }
  })

  return { month: month[0], weeks, top: [...top] }
}

// ---------- Export ----------

export async function exportAttendance() {
  const sql = await db()
  return sql<{ date: string; class_type: string; name: string; belt: string; stripes: number }[]>`
    SELECT a.date, a.class_type, s.name, s.belt, s.stripes
    FROM attendance a JOIN students s ON s.id = a.student_id
    ORDER BY a.date DESC, a.class_type, s.name
  `
}
