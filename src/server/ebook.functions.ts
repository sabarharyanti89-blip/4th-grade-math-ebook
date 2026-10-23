import { createServerFn } from '@tanstack/react-start'
import { and, asc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../../db/index.js'
import { answers, students } from '../../db/schema.js'
import {
  MAX_TOTAL,
  POINTS,
  QUESTION_COUNT,
  type AnswerResult,
  type Progress,
} from '@/lib/module'
import { ANSWER_KEY } from './answer-key'

type StudentRow = typeof students.$inferSelect
type AnswerRow = typeof answers.$inferSelect

const tokenInput = z.object({ token: z.string().min(10).max(80) })

function toResult(a: AnswerRow): AnswerResult {
  const correctChoice = ANSWER_KEY[a.questionNo]
  return {
    questionNo: a.questionNo,
    choice: a.choice,
    correct: a.choice === correctChoice,
    correctChoice,
    points: a.points,
  }
}

function buildProgress(s: StudentRow, rows: AnswerRow[]): Progress {
  const results = rows.map(toResult).sort((a, b) => a.questionNo - b.questionNo)
  const readingPoints = s.videoPoints + s.factorPoints + s.multiplePoints
  const quizScore = results.reduce((sum, r) => sum + r.points, 0)
  const total = readingPoints + s.gamePoints + quizScore
  return {
    student: { name: s.name, className: s.className, absentNo: s.absentNo },
    video: s.videoPoints,
    factor: s.factorPoints,
    multiple: s.multiplePoints,
    game: s.gamePoints,
    gameDone: s.gameDone === 1,
    answers: results,
    readingPoints,
    quizScore,
    total,
    finalScore: Math.round((total / MAX_TOTAL) * 100),
    finished: results.length >= QUESTION_COUNT,
  }
}

async function loadStudent(token: string) {
  const [s] = await db.select().from(students).where(eq(students.token, token))
  if (!s) throw new Error('Data siswa tidak ditemukan. Silakan masuk lagi.')
  return s
}

async function loadProgress(s: StudentRow) {
  const rows = await db.select().from(answers).where(eq(answers.studentId, s.id))
  return buildProgress(s, rows)
}

export const startStudent = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().trim().min(2).max(60),
      className: z.string().trim().min(1).max(20),
      absentNo: z.coerce.number().int().min(1).max(99),
    }),
  )
  .handler(async ({ data }) => {
    // Same name + class + number resumes the existing record.
    const [existing] = await db
      .select()
      .from(students)
      .where(
        and(
          sql`lower(${students.name}) = lower(${data.name})`,
          sql`lower(${students.className}) = lower(${data.className})`,
          eq(students.absentNo, data.absentNo),
        ),
      )
    if (existing) return { token: existing.token, resumed: true }
    const token = crypto.randomUUID()
    await db.insert(students).values({ ...data, token })
    return { token, resumed: false }
  })

export const getProgress = createServerFn({ method: 'GET' })
  .validator(tokenInput)
  .handler(async ({ data }) => loadProgress(await loadStudent(data.token)))

export const completePage = createServerFn({ method: 'POST' })
  .validator(tokenInput.extend({ page: z.enum(['video', 'factor', 'multiple']) }))
  .handler(async ({ data }) => {
    const s = await loadStudent(data.token)
    if (data.page === 'video' && s.videoPoints === 0) {
      await db.update(students).set({ videoPoints: POINTS.video }).where(eq(students.id, s.id))
    }
    if (data.page === 'factor' && s.factorPoints === 0) {
      if (s.videoPoints === 0) throw new Error('Selesaikan video dulu ya.')
      await db.update(students).set({ factorPoints: POINTS.factor }).where(eq(students.id, s.id))
    }
    if (data.page === 'multiple' && s.multiplePoints === 0) {
      if (s.factorPoints === 0) throw new Error('Selesaikan halaman Faktor dulu ya.')
      await db
        .update(students)
        .set({ multiplePoints: POINTS.multiple })
        .where(eq(students.id, s.id))
    }
    return loadProgress(await loadStudent(data.token))
  })

export const completeGame = createServerFn({ method: 'POST' })
  .validator(tokenInput.extend({ mistakes: z.number().int().min(0).max(500) }))
  .handler(async ({ data }) => {
    const s = await loadStudent(data.token)
    if (s.multiplePoints === 0) throw new Error('Selesaikan semua halaman bacaan dulu ya.')
    if (s.gameDone === 0) {
      const gamePoints = Math.max(POINTS.gameMin, POINTS.gameMax - data.mistakes)
      await db.update(students).set({ gamePoints, gameDone: 1 }).where(eq(students.id, s.id))
    }
    return loadProgress(await loadStudent(data.token))
  })

export const submitAnswer = createServerFn({ method: 'POST' })
  .validator(
    tokenInput.extend({
      questionNo: z.number().int().min(1).max(QUESTION_COUNT),
      choice: z.number().int().min(0).max(3),
    }),
  )
  .handler(async ({ data }) => {
    const s = await loadStudent(data.token)
    if (s.gameDone === 0) throw new Error('Selesaikan game dulu ya.')
    const points = data.choice === ANSWER_KEY[data.questionNo] ? POINTS.perQuestion : 0
    // Answers are final: a second submission for the same question is ignored.
    await db
      .insert(answers)
      .values({ studentId: s.id, questionNo: data.questionNo, choice: data.choice, points })
      .onConflictDoNothing()
    const progress = await loadProgress(s)
    if (progress.finished && !s.finishedAt) {
      await db.update(students).set({ finishedAt: new Date() }).where(eq(students.id, s.id))
    }
    return progress
  })

// ---------- Teacher (Guru) ----------

function checkPin(pin: string) {
  const expected = process.env.TEACHER_PIN || '1234'
  if (pin !== expected) throw new Error('PIN Guru salah.')
}

const pinInput = z.object({ pin: z.string().min(1).max(100) })

export type RecapRow = Progress & {
  id: number
  createdAt: string
  finishedAt: string | null
}

export const teacherLogin = createServerFn({ method: 'POST' })
  .validator(pinInput)
  .handler(async ({ data }) => {
    checkPin(data.pin)
    return { ok: true }
  })

export const getRecap = createServerFn({ method: 'POST' })
  .validator(pinInput)
  .handler(async ({ data }): Promise<RecapRow[]> => {
    checkPin(data.pin)
    const all = await db
      .select()
      .from(students)
      .orderBy(asc(students.className), asc(students.absentNo), asc(students.name))
    const allAnswers = await db.select().from(answers)
    return all.map((s) => ({
      ...buildProgress(
        s,
        allAnswers.filter((a) => a.studentId === s.id),
      ),
      id: s.id,
      createdAt: s.createdAt.toISOString(),
      finishedAt: s.finishedAt ? s.finishedAt.toISOString() : null,
    }))
  })

export const deleteStudent = createServerFn({ method: 'POST' })
  .validator(pinInput.extend({ id: z.number().int() }))
  .handler(async ({ data }) => {
    checkPin(data.pin)
    await db.delete(students).where(eq(students.id, data.id))
    return { ok: true }
  })
