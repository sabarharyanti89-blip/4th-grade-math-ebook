import { useState } from 'react'
import { ArrowRight, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { POINTS, QUESTIONS, type AnswerResult } from '@/lib/module'

const LETTERS = ['A', 'B', 'C', 'D']

export function QuizPage({
  answers,
  busy,
  onAnswer,
  onShowReport,
}: {
  answers: AnswerResult[]
  busy?: boolean
  onAnswer: (questionNo: number, choice: number) => void
  onShowReport: () => void
}) {
  const firstOpen = QUESTIONS.findIndex((q) => !answers.some((a) => a.questionNo === q.no))
  const [index, setIndex] = useState(firstOpen === -1 ? 0 : firstOpen)
  const [selected, setSelected] = useState<number | null>(null)

  const q = QUESTIONS[index]
  const result = answers.find((a) => a.questionNo === q.no)
  const allDone = answers.length >= QUESTIONS.length

  function go(i: number) {
    setIndex(i)
    setSelected(null)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="font-display text-sm font-semibold tracking-wide text-secondary uppercase">Tugas Akhir</p>
        <h2 className="text-3xl font-bold sm:text-4xl">5 Soal Faktor & Kelipatan ✏️</h2>
        <p className="flex items-center gap-2 text-lg text-muted-foreground">
          <Lock className="size-4" aria-hidden /> Setiap soal bernilai {POINTS.perQuestion} poin. Jawaban yang sudah dikunci{' '}
          <strong className="text-foreground">tidak dapat diubah</strong>.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Nomor soal">
        {QUESTIONS.map((qq, i) => {
          const r = answers.find((a) => a.questionNo === qq.no)
          return (
            <button
              key={qq.no}
              onClick={() => go(i)}
              aria-current={i === index}
              className={cn(
                'size-12 rounded-2xl border-2 font-display text-xl font-semibold',
                r ? (r.correct ? 'border-success bg-success text-white' : 'border-destructive bg-destructive text-white') : 'bg-card',
                i === index && 'ring-4 ring-ring/40',
              )}
            >
              {qq.no}
            </button>
          )
        })}
      </div>

      <div className="rounded-3xl border-2 bg-card p-5 sm:p-7">
        <p className="mb-1 font-display font-semibold text-primary">Soal {q.no} dari {QUESTIONS.length}</p>
        {q.story && <p className="mb-2 rounded-2xl bg-muted p-4 text-lg">📖 {q.story}</p>}
        <p className="mb-5 font-display text-2xl font-semibold">{q.text}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          {q.options.map((opt, i) => {
            const isChosen = result ? result.choice === i : selected === i
            const isCorrect = result && result.correctChoice === i
            return (
              <button
                key={i}
                disabled={!!result || busy}
                onClick={() => setSelected(i)}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border-2 p-4 text-left text-lg font-bold transition-colors motion-reduce:transition-none',
                  !result && 'hover:border-primary hover:bg-primary/5',
                  !result && isChosen && 'border-primary bg-primary/10',
                  result && isCorrect && 'border-success bg-success/15',
                  result && isChosen && !isCorrect && 'border-destructive bg-destructive/10',
                  result && !isChosen && !isCorrect && 'opacity-60',
                )}
              >
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted font-display text-lg',
                    isChosen && !result && 'bg-primary text-primary-foreground',
                    result && isCorrect && 'bg-success text-white',
                    result && isChosen && !isCorrect && 'bg-destructive text-white',
                  )}
                >
                  {LETTERS[i]}
                </span>
                {opt}
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {result ? (
            <p className={cn('font-display text-xl font-semibold', result.correct ? 'text-success' : 'text-destructive')}>
              {result.correct ? `Benar! +${POINTS.perQuestion} poin 🎉` : `Belum tepat. Jawaban benar: ${LETTERS[result.correctChoice]}`}
            </p>
          ) : (
            <p className="text-muted-foreground">{selected === null ? 'Pilih satu jawaban.' : 'Yakin? Jawaban tidak bisa diubah lagi.'}</p>
          )}

          {!result ? (
            <Button
              size="lg"
              className="chunky h-12 rounded-2xl px-6 text-base font-extrabold"
              disabled={selected === null || busy}
              onClick={() => selected !== null && onAnswer(q.no, selected)}
            >
              <Lock /> Kunci Jawaban
            </Button>
          ) : allDone ? (
            <Button size="lg" className="chunky h-12 rounded-2xl px-6 text-base font-extrabold" onClick={onShowReport}>
              Lihat Rapor Nilaiku 🏆
            </Button>
          ) : (
            <Button
              size="lg"
              variant="secondary"
              className="chunky h-12 rounded-2xl px-6 text-base font-extrabold"
              onClick={() => {
                const next = QUESTIONS.findIndex((qq) => !answers.some((a) => a.questionNo === qq.no))
                go(next === -1 ? index : next)
              }}
            >
              Soal Berikutnya <ArrowRight />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
