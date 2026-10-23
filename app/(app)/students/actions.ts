'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { getBelt, isBelt, isClassType, isTrainingType } from '@/lib/belts'
import * as data from '@/lib/data'
import { isIsoDate, today } from '@/lib/dates'

export type FormState = { error?: string } | null

function text(formData: FormData, key: string, max: number) {
  const v = String(formData.get(key) ?? '').trim()
  return v ? v.slice(0, max) : null
}

function parseStudent(formData: FormData): data.StudentInput | string {
  const name = text(formData, 'name', 120)
  if (!name) return 'Please enter the student’s name.'
  const belt = String(formData.get('belt') ?? '')
  if (!isBelt(belt)) return 'Please choose a belt.'
  const stripes = Number(formData.get('stripes') ?? 0)
  if (!Number.isInteger(stripes) || stripes < 0 || stripes > getBelt(belt).maxStripes) {
    return 'Invalid number of stripes for this belt.'
  }
  const training = String(formData.get('training_type') ?? '')
  if (!isTrainingType(training)) return 'Please choose Gi, No-Gi or both.'
  const start = String(formData.get('start_date') ?? '')
  if (!isIsoDate(start)) return 'Please enter the date they started training.'
  return {
    name,
    phone: text(formData, 'phone', 40),
    belt,
    stripes,
    training_type: training,
    start_date: start,
    notes: text(formData, 'notes', 2000),
  }
}

function dateOr(formData: FormData, key: string, fallback: string) {
  const v = String(formData.get(key) ?? '')
  return isIsoDate(v) ? v : fallback
}

export async function createStudentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()
  const input = parseStudent(formData)
  if (typeof input === 'string') return { error: input }

  const beltSince = dateOr(formData, 'belt_since', input.start_date)
  const checkin = String(formData.get('checkin') ?? '')
  const checkinDate = String(formData.get('checkin_date') ?? '')

  let id: number
  try {
    id = await data.createStudent(input, beltSince)
    if (isClassType(checkin) && isIsoDate(checkinDate)) {
      await data.setAttendance(id, checkinDate, checkin, true)
    }
  } catch (err) {
    console.error(err)
    return { error: 'Could not save. Please try again.' }
  }
  revalidatePath('/', 'layout')
  if (isClassType(checkin) && isIsoDate(checkinDate)) redirect(`/?date=${checkinDate}&type=${checkin}`)
  redirect(`/students/${id}`)
}

export async function updateStudentAction(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()
  const input = parseStudent(formData)
  if (typeof input === 'string') return { error: input }
  try {
    await data.updateStudent(id, input, dateOr(formData, 'promotion_date', today()))
  } catch (err) {
    console.error(err)
    return { error: 'Could not save. Please try again.' }
  }
  revalidatePath('/', 'layout')
  redirect(`/students/${id}`)
}

export async function setActiveAction(id: number, active: boolean) {
  await requireAuth()
  await data.setStudentActive(id, active)
  revalidatePath('/', 'layout')
}

export async function addStripeAction(id: number) {
  await requireAuth()
  const student = await data.getStudent(id)
  if (!student) return
  await data.addStripe(id, getBelt(student.belt).maxStripes)
  revalidatePath('/', 'layout')
}

export async function deletePromotionAction(studentId: number, promotionId: number) {
  await requireAuth()
  await data.deletePromotion(studentId, promotionId)
  revalidatePath('/', 'layout')
}

export async function deleteStudentAction(id: number) {
  await requireAuth()
  await data.deleteStudent(id)
  revalidatePath('/', 'layout')
  redirect('/students')
}
