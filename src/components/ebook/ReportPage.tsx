import { Star } from 'lucide-react'

import { MAX_TOTAL, POINTS, QUESTION_COUNT, type Progress } from '@/lib/module'
import { cn } from '@/lib/utils'
import { Confetti, Mascot } from './shared'

function message(score: number) {
  if (score >= 90) return 'Luar biasa! Kamu juara Faktor & Kelipatan! 🌟'
  if (score >= 75) return 'Hebat! Pemahamanmu sudah sangat baik! 👏'
  if (score >= 60) return 'Bagus! Terus berlatih ya! 💪'
  return 'Tetap semangat! Ulangi materinya bersama Kak Owi ya. 📚'
}

export function ReportPage({ progress: p }: { progress: Progress }) {
  const stars = p.finalScore >= 90 ? 3 : p.finalScore >= 70 ? 2 : 1
  const rows = [
    { label: '🎬 Menonton video (Halaman 1)', value: p.video, max: POINTS.video },
    { label: '🧩 Membaca Faktor (Halaman 2)', value: p.factor, max: POINTS.factor },
    { label: '🐸 Membaca Kelipatan (Halaman 3)', value: p.multiple, max: POINTS.multiple },
    { label: '👾 Game Monster Momo', value: p.game, max: POINTS.gameMax },
    { label: `✏️ Tugas akhir (${QUESTION_COUNT} soal)`, value: p.quizScore, max: POINTS.perQuestion * QUESTION_COUNT },
  ]
  return (
    <div className="space-y-6">
      <Confetti />
      <div className="relative overflow-hidden rounded-3xl border-4 border-foreground bg-accent p-6 text-center chunky sm:p-8">
        <Mascot size={120} className="mx-auto" />
        <p className="font-display text-sm font-semibold tracking-wide uppercase">Rapor Nilaiku</p>
        <h2 className="text-3xl font-bold sm:text-4xl">{p.student.name}</h2>
        <p className="font-bold text-accent-foreground/80">
          Kelas {p.student.className} · No. Absen {p.student.absentNo}
        </p>
        <div className="my-4 flex justify-center gap-1" aria-label={`${stars} bintang`}>
          {[0, 1, 2].map((i) => (
            <Star key={i} className={cn('size-10', i < stars ? 'fill-primary text-primary' : 'text-accent-foreground/30')} aria-hidden />
          ))}
        </div>
        <p className="font-display text-7xl font-bold text-primary">{p.finalScore}</p>
        <p className="font-bold">Nilai Akhir (skala 100)</p>
        <p className="mt-3 text-lg font-bold">{message(p.finalScore)}</p>
      </div>

      <div className="overflow-hidden rounded-3xl border-2 bg-card">
        <ul className="divide-y">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center justify-between gap-4 px-5 py-4">
              <span className="font-bold">{r.label}</span>
              <span className="font-display text-xl font-semibold">
                {r.value}
                <span className="text-sm text-muted-foreground"> / {r.max}</span>
              </span>
            </li>
          ))}
          <li className="flex items-center justify-between gap-4 bg-primary px-5 py-4 text-primary-foreground">
            <span className="font-extrabold">Total Poin Seluruh Kegiatan</span>
            <span className="font-display text-2xl font-bold">
              {p.total} / {MAX_TOTAL}
            </span>
          </li>
        </ul>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Nilai akhir = total poin ÷ {MAX_TOTAL} × 100. Nilaimu sudah tersimpan dan dapat dilihat oleh Guru.
      </p>
    </div>
  )
}
