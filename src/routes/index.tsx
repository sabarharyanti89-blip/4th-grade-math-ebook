import { useCallback, useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, Lock, LogOut, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { MAX_TOTAL, STEPS, firstOpenStep, isDone, isUnlocked, type Progress, type StepId } from '@/lib/module'
import { completeGame, completePage, getProgress, startStudent, submitAnswer } from '@/server/ebook.functions'
import { Footer, Mascot, cdn } from '@/components/ebook/shared'
import { VideoPage } from '@/components/ebook/VideoPage'
import { FactorPage } from '@/components/ebook/FactorPage'
import { MultiplePage } from '@/components/ebook/MultiplePage'
import { GamePage } from '@/components/ebook/GamePage'
import { QuizPage } from '@/components/ebook/QuizPage'
import { ReportPage } from '@/components/ebook/ReportPage'

export const Route = createFileRoute('/')({
  component: Home,
})

const TOKEN_KEY = 'ebook-faktor-kelipatan-token'

function errorText(e: unknown) {
  return e instanceof Error ? e.message : 'Terjadi kesalahan. Coba lagi ya.'
}

function Home() {
  const [token, setToken] = useState<string | null | undefined>(undefined)
  const [progress, setProgress] = useState<Progress | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY)
    if (!saved) return setToken(null)
    getProgress({ data: { token: saved } })
      .then((p) => {
        setProgress(p)
        setToken(saved)
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      })
  }, [])

  function signIn(t: string, p: Progress) {
    localStorage.setItem(TOKEN_KEY, t)
    setProgress(p)
    setToken(t)
  }

  function signOut() {
    localStorage.removeItem(TOKEN_KEY)
    setProgress(null)
    setToken(null)
  }

  if (token === undefined) {
    return (
      <div className="mx-auto max-w-content space-y-6 px-4 py-10 sm:px-6">
        <Skeleton className="h-16 w-full rounded-3xl" />
        <Skeleton className="h-[420px] w-full rounded-3xl" />
      </div>
    )
  }
  if (!token || !progress) return <Welcome onSignIn={signIn} />
  return <Reader token={token} progress={progress} setProgress={setProgress} onSignOut={signOut} />
}

function Welcome({ onSignIn }: { onSignIn: (token: string, p: Progress) => void }) {
  const [name, setName] = useState('')
  const [className, setClassName] = useState('')
  const [absentNo, setAbsentNo] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 2 || !className.trim() || !Number(absentNo)) {
      toast.error('Isi nama, kelas, dan nomor absen dulu ya.')
      return
    }
    setBusy(true)
    try {
      const res = await startStudent({ data: { name, className, absentNo: Number(absentNo) } })
      const p = await getProgress({ data: { token: res.token } })
      toast.success(res.resumed ? `Selamat datang kembali, ${p.student.name}!` : `Halo ${p.student.name}, ayo mulai belajar!`)
      onSignIn(res.token, p)
    } catch (err) {
      toast.error(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-dots min-h-screen">
      <header className="mx-auto flex max-w-content items-center justify-between px-4 py-4 sm:px-6">
        <p className="font-display text-xl font-bold">
          <span className="text-primary">Faktor</span> & <span className="text-secondary">Kelipatan</span>
        </p>
        <Button asChild variant="outline" className="rounded-2xl font-bold">
          <Link to="/guru">
            <GraduationCap /> Akses Guru
          </Link>
        </Button>
      </header>

      <main className="mx-auto max-w-content px-4 pb-6 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] border-4 border-foreground chunky">
          <img
            src={cdn('hero.png', 1400)}
            srcSet={`${cdn('hero.png', 800)} 800w, ${cdn('hero.png', 1400)} 1400w`}
            sizes="(max-width: 1152px) 100vw, 1152px"
            alt="Dunia angka yang ceria dengan balok angka, balon, dan tangga pelangi perkalian"
            className="h-56 w-full object-cover sm:h-80"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 pt-16 sm:p-8">
            <p className="font-display text-sm font-semibold tracking-wide text-white/90 uppercase">
              Ebook Matematika · Kelas 4 · Semester 1
            </p>
            <h1 className="font-display text-4xl font-bold text-white sm:text-6xl">Faktor dan Kelipatan</h1>
          </div>
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.1fr_1fr]">
          <section className="space-y-5">
            <div className="flex items-center gap-4">
              <Mascot size={110} className="shrink-0" />
              <div className="relative rounded-3xl border-2 bg-card p-4 text-lg">
                Halo! Aku <strong>Kak Owi</strong>. Ayo belajar Faktor dan Kelipatan bersamaku. Kumpulkan poin di setiap
                halaman ya!
              </div>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2">
              {STEPS.map((s, i) => (
                <li key={s.id} className="flex items-center gap-3 rounded-2xl border-2 bg-card p-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl" aria-hidden>
                    {s.emoji}
                  </span>
                  <span className="font-bold">
                    <span className="text-muted-foreground">{i + 1}. </span>
                    {s.label.replace(/^Halaman \d · /, '')}
                  </span>
                </li>
              ))}
            </ol>
            <p className="text-muted-foreground">
              Halaman berikutnya terbuka otomatis setelah halaman sebelumnya selesai. Total poin maksimal {MAX_TOTAL}, lalu
              dihitung menjadi nilai akhir.
            </p>
          </section>

          <form onSubmit={submit} className="space-y-4 rounded-3xl border-4 border-foreground bg-card p-6 chunky sm:p-8">
            <h2 className="text-2xl font-bold">Masuk untuk mulai belajar ✨</h2>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-bold">
                Nama lengkap
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="contoh: Budi Santoso" className="h-12 rounded-xl text-lg" autoComplete="name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class" className="text-base font-bold">
                  Kelas
                </Label>
                <Input id="class" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="4A" className="h-12 rounded-xl text-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="absent" className="text-base font-bold">
                  No. Absen
                </Label>
                <Input id="absent" inputMode="numeric" type="number" min={1} max={99} value={absentNo} onChange={(e) => setAbsentNo(e.target.value)} placeholder="7" className="h-12 rounded-xl text-lg" />
              </div>
            </div>
            <Button type="submit" size="lg" disabled={busy} className="chunky h-14 w-full rounded-2xl text-lg font-extrabold">
              {busy ? 'Menyiapkan ebook…' : 'Mulai Belajar 🚀'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Sudah pernah masuk? Tulis nama, kelas, dan nomor absen yang sama untuk melanjutkan.
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Reader({
  token,
  progress,
  setProgress,
  onSignOut,
}: {
  token: string
  progress: Progress
  setProgress: (p: Progress) => void
  onSignOut: () => void
}) {
  const [step, setStep] = useState<StepId>(() => firstOpenStep(progress))
  const [busy, setBusy] = useState(false)

  const go = useCallback((s: StepId) => {
    setStep(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Saves an action, then opens the next unlocked step automatically.
  const run = useCallback(
    async (action: () => Promise<Progress>, message: string, next?: StepId) => {
      setBusy(true)
      try {
        const p = await action()
        setProgress(p)
        if (message) toast.success(message)
        if (next) setTimeout(() => go(next), 1200)
      } catch (err) {
        toast.error(errorText(err))
      } finally {
        setBusy(false)
      }
    },
    [go, setProgress],
  )

  const idx = STEPS.findIndex((s) => s.id === step)
  const prev = STEPS[idx - 1]
  const next = STEPS[idx + 1]
  const p = progress

  return (
    <div className="bg-dots min-h-screen">
      <header className="sticky top-0 z-30 border-b-2 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-content items-center gap-3 px-4 py-3 sm:px-6">
          <Mascot size={44} className="shrink-0 rounded-full bg-card" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg leading-tight font-bold">Faktor & Kelipatan</p>
            <p className="truncate text-sm text-muted-foreground">
              {p.student.name} · Kelas {p.student.className}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 font-display text-lg font-semibold text-accent-foreground">
            <Sparkles className="size-4" aria-hidden /> {p.total}
            <span className="hidden text-sm sm:inline"> poin</span>
          </span>
          <Button variant="ghost" size="icon" aria-label="Keluar" onClick={onSignOut}>
            <LogOut />
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-content gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_1fr]">
        <nav aria-label="Daftar halaman" className="lg:sticky lg:top-24 lg:self-start">
          <ol className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {STEPS.map((s, i) => {
              const unlocked = isUnlocked(s.id, p)
              const done = isDone(s.id, p)
              return (
                <li key={s.id} className="shrink-0">
                  <button
                    disabled={!unlocked}
                    onClick={() => go(s.id)}
                    aria-current={step === s.id ? 'step' : undefined}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl border-2 bg-card p-2.5 pr-4 text-left transition-colors motion-reduce:transition-none',
                      step === s.id && 'border-primary bg-primary/10',
                      !unlocked && 'cursor-not-allowed opacity-55',
                      unlocked && step !== s.id && 'hover:border-primary/50',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-xl text-xl',
                        done ? 'bg-success text-white' : 'bg-muted',
                      )}
                      aria-hidden
                    >
                      {done ? <CheckCircle2 className="size-5" /> : unlocked ? s.emoji : <Lock className="size-4" />}
                    </span>
                    <span className="whitespace-nowrap lg:whitespace-normal">
                      <span className="block text-xs font-bold text-muted-foreground">Langkah {i + 1}</span>
                      <span className="font-bold">
                        <span className="lg:hidden">{s.short}</span>
                        <span className="hidden lg:inline">{s.label}</span>
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
          <div className="mt-4 hidden rounded-2xl border-2 bg-card p-4 lg:block">
            <p className="text-sm font-bold text-muted-foreground">Poin kamu</p>
            <p className="font-display text-3xl font-bold">
              {p.total}
              <span className="text-base text-muted-foreground"> / {MAX_TOTAL}</span>
            </p>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(p.total / MAX_TOTAL) * 100}%` }} />
            </div>
          </div>
        </nav>

        <main className="min-w-0">
          <div className="rounded-[2rem] border-2 bg-background p-5 sm:p-8">
            {step === 'video' && (
              <VideoPage
                done={p.video > 0}
                onComplete={() =>
                  run(() => completePage({ data: { token, page: 'video' } }), 'Video selesai! +10 poin. Halaman 2 terbuka 🎉', 'factor')
                }
              />
            )}
            {step === 'factor' && (
              <FactorPage
                done={p.factor > 0}
                busy={busy}
                onComplete={() =>
                  run(() => completePage({ data: { token, page: 'factor' } }), 'Hebat! +10 poin. Halaman 3 terbuka 🎉', 'multiple')
                }
              />
            )}
            {step === 'multiple' && (
              <MultiplePage
                done={p.multiple > 0}
                busy={busy}
                onComplete={() =>
                  run(() => completePage({ data: { token, page: 'multiple' } }), 'Keren! +10 poin. Game terbuka 👾', 'game')
                }
              />
            )}
            {step === 'game' && (
              <GamePage
                done={p.gameDone}
                points={p.game}
                busy={busy}
                onComplete={(mistakes) =>
                  run(() => completeGame({ data: { token, mistakes } }), 'Poin game tersimpan! Soal terbuka ✏️', 'quiz')
                }
              />
            )}
            {step === 'quiz' && (
              <QuizPage
                answers={p.answers}
                busy={busy}
                onAnswer={(questionNo, choice) => run(() => submitAnswer({ data: { token, questionNo, choice } }), '')}
                onShowReport={() => go('report')}
              />
            )}
            {step === 'report' && <ReportPage progress={p} />}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            {prev ? (
              <Button variant="outline" className="h-12 rounded-2xl font-bold" onClick={() => go(prev.id)}>
                <ArrowLeft /> {prev.short}
              </Button>
            ) : (
              <span />
            )}
            {next && (
              <Button
                className="h-12 rounded-2xl font-bold"
                disabled={!isUnlocked(next.id, p)}
                onClick={() => go(next.id)}
              >
                {isUnlocked(next.id, p) ? null : <Lock />} {next.short} <ArrowRight />
              </Button>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
