// Shared module definition: steps, point values, and quiz questions (no answer key).

export const VIDEO_ID = 'OCIeZB6lc10'
export const VIDEO_URL = 'https://www.youtube.com/watch?v=OCIeZB6lc10'

export const POINTS = {
  video: 10,
  factor: 10,
  multiple: 10,
  gameMax: 20,
  gameMin: 10,
  perQuestion: 20,
} as const

export const QUESTION_COUNT = 5
export const MAX_TOTAL =
  POINTS.video +
  POINTS.factor +
  POINTS.multiple +
  POINTS.gameMax +
  POINTS.perQuestion * QUESTION_COUNT

export type StepId = 'video' | 'factor' | 'multiple' | 'game' | 'quiz' | 'report'

export const STEPS: { id: StepId; label: string; short: string; emoji: string }[] = [
  { id: 'video', label: 'Halaman 1 · Tonton Video', short: 'Video', emoji: '🎬' },
  { id: 'factor', label: 'Halaman 2 · Faktor', short: 'Faktor', emoji: '🧩' },
  { id: 'multiple', label: 'Halaman 3 · Kelipatan', short: 'Kelipatan', emoji: '🐸' },
  { id: 'game', label: 'Game Monster Momo', short: 'Game', emoji: '👾' },
  { id: 'quiz', label: 'Tugas Akhir · 5 Soal', short: 'Soal', emoji: '✏️' },
  { id: 'report', label: 'Rapor Nilaiku', short: 'Rapor', emoji: '🏆' },
]

export type Question = { no: number; text: string; story?: string; options: string[] }

export const QUESTIONS: Question[] = [
  {
    no: 1,
    text: 'Semua faktor dari 12 adalah ...',
    options: ['1, 2, 3, 4, 6, 12', '1, 2, 3, 4, 5, 12', '2, 4, 6, 8, 10, 12', '12, 24, 36, 48'],
  },
  {
    no: 2,
    text: 'Tiga kelipatan pertama dari 7 adalah ...',
    options: ['1, 7, 14', '7, 14, 21', '7, 17, 27', '14, 28, 42'],
  },
  {
    no: 3,
    text: 'Bilangan berikut yang merupakan faktor dari 20 adalah ...',
    options: ['3', '6', '5', '8'],
  },
  {
    no: 4,
    text: 'Kelipatan persekutuan terkecil (KPK) dari 4 dan 6 adalah ...',
    options: ['10', '24', '2', '12'],
  },
  {
    no: 5,
    story:
      'Dina punya 18 permen. Permen itu akan dibagikan sama banyak kepada beberapa temannya tanpa sisa.',
    text: 'Banyak teman yang mungkin menerima permen adalah ...',
    options: ['4 teman', '5 teman', '6 teman', '7 teman'],
  },
]

export type AnswerResult = {
  questionNo: number
  choice: number
  correct: boolean
  correctChoice: number
  points: number
}

export type Progress = {
  student: { name: string; className: string; absentNo: number }
  video: number
  factor: number
  multiple: number
  game: number
  gameDone: boolean
  answers: AnswerResult[]
  readingPoints: number
  quizScore: number
  total: number
  finalScore: number
  finished: boolean
}

export function isUnlocked(step: StepId, p: Progress): boolean {
  switch (step) {
    case 'video':
      return true
    case 'factor':
      return p.video > 0
    case 'multiple':
      return p.factor > 0
    case 'game':
      return p.multiple > 0
    case 'quiz':
      return p.gameDone
    case 'report':
      return p.finished
  }
}

export function isDone(step: StepId, p: Progress): boolean {
  switch (step) {
    case 'video':
      return p.video > 0
    case 'factor':
      return p.factor > 0
    case 'multiple':
      return p.multiple > 0
    case 'game':
      return p.gameDone
    case 'quiz':
      return p.finished
    case 'report':
      return p.finished
  }
}

export function firstOpenStep(p: Progress): StepId {
  for (const s of STEPS) if (!isDone(s.id, p)) return s.id
  return 'report'
}
