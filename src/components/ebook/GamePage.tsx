import { useMemo, useState } from 'react'
import { RotateCcw, Trophy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { POINTS } from '@/lib/module'
import { Confetti, PointBadge } from './shared'

type Round = {
  kind: 'feed' | 'balloon'
  title: string
  hint: string
  numbers: number[]
  isTarget: (n: number) => boolean
}

const ROUNDS: Round[] = [
  {
    kind: 'feed',
    title: 'Momo lapar! Beri Momo kue FAKTOR dari 12',
    hint: 'Momo hanya mau makan bilangan yang membagi habis 12.',
    numbers: [1, 2, 3, 4, 5, 6, 8, 9, 10, 12],
    isTarget: (n) => 12 % n === 0,
  },
  {
    kind: 'balloon',
    title: 'Pecahkan semua balon KELIPATAN 3',
    hint: 'Kelipatan 3: hasil 3 × 1, 3 × 2, 3 × 3, …',
    numbers: [3, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20],
    isTarget: (n) => n % 3 === 0,
  },
  {
    kind: 'feed',
    title: 'Momo masih lapar! Beri kue FAKTOR dari 18',
    hint: 'Coba cari pasangan perkalian yang hasilnya 18.',
    numbers: [1, 2, 3, 4, 5, 6, 8, 9, 12, 18],
    isTarget: (n) => 18 % n === 0,
  },
]

const BALLOON_COLORS = ['bg-primary', 'bg-secondary', 'bg-grape', 'bg-success', 'bg-accent']

function shuffle<T>(arr: T[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function Monster({ mood }: { mood: 'idle' | 'yum' | 'yuck' }) {
  return (
    <div className={cn('relative mx-auto w-44 sm:w-52', mood === 'idle' && 'animate-bob', mood === 'yuck' && 'animate-wiggle')}>
      <svg viewBox="0 0 200 180" className="w-full drop-shadow-lg" aria-hidden>
        <path d="M40 60 L30 20 L65 45 Z" fill="var(--grape)" />
        <path d="M160 60 L170 20 L135 45 Z" fill="var(--grape)" />
        <ellipse cx="100" cy="105" rx="85" ry="72" fill="var(--grape)" />
        <ellipse cx="100" cy="125" rx="55" ry="40" fill="color-mix(in oklch, var(--grape) 60%, white)" />
        <circle cx="70" cy="72" r="20" fill="white" />
        <circle cx="130" cy="72" r="20" fill="white" />
        {mood === 'yuck' ? (
          <>
            <path d="M60 66 L80 78 M80 66 L60 78" stroke="var(--foreground)" strokeWidth="5" strokeLinecap="round" />
            <path d="M120 66 L140 78 M140 66 L120 78" stroke="var(--foreground)" strokeWidth="5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx={mood === 'yum' ? 70 : 74} cy="74" r="9" fill="var(--foreground)" />
            <circle cx={mood === 'yum' ? 130 : 134} cy="74" r="9" fill="var(--foreground)" />
          </>
        )}
        <g className={mood === 'yum' ? 'animate-chomp' : undefined} style={{ transformOrigin: '100px 120px' }}>
          {mood === 'yuck' ? (
            <path d="M70 130 Q100 110 130 130" stroke="var(--foreground)" strokeWidth="6" fill="none" strokeLinecap="round" />
          ) : (
            <>
              <path d="M62 110 Q100 160 138 110 Z" fill="var(--foreground)" />
              <path d="M85 145 Q100 135 115 145 Q100 152 85 145" fill="var(--primary)" />
              <rect x="80" y="110" width="12" height="12" fill="white" rx="2" />
              <rect x="108" y="110" width="12" height="12" fill="white" rx="2" />
            </>
          )}
        </g>
        <circle cx="45" cy="105" r="9" fill="var(--primary)" opacity="0.45" />
        <circle cx="155" cy="105" r="9" fill="var(--primary)" opacity="0.45" />
      </svg>
      {mood !== 'idle' && (
        <span className="absolute -top-2 -right-4 rounded-2xl border-2 bg-card px-3 py-1 font-display text-lg font-semibold">
          {mood === 'yum' ? 'Nyam! 😋' : 'Bleh! 🤢'}
        </span>
      )}
    </div>
  )
}

export function GamePage({
  done,
  points,
  busy,
  onComplete,
}: {
  done: boolean
  points: number
  busy?: boolean
  onComplete: (mistakes: number) => void
}) {
  const [practice, setPractice] = useState(false)
  const [round, setRound] = useState(0)
  const [picked, setPicked] = useState<number[]>([])
  const [wrong, setWrong] = useState<number | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [mood, setMood] = useState<'idle' | 'yum' | 'yuck'>('idle')
  const [seed, setSeed] = useState(0)

  const r = ROUNDS[round]
  const finished = round >= ROUNDS.length
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const order = useMemo(() => (r ? shuffle(r.numbers) : []), [round, seed])
  const targets = r ? r.numbers.filter(r.isTarget) : []
  const remaining = targets.filter((n) => !picked.includes(n)).length

  function pick(n: number) {
    if (!r || picked.includes(n)) return
    if (r.isTarget(n)) {
      const next = [...picked, n]
      setPicked(next)
      setMood('yum')
      setTimeout(() => setMood('idle'), 700)
      if (targets.every((t) => next.includes(t))) {
        setTimeout(() => {
          setRound((x) => x + 1)
          setPicked([])
        }, 900)
      }
    } else {
      setMistakes((m) => m + 1)
      setWrong(n)
      setMood('yuck')
      setTimeout(() => {
        setWrong(null)
        setMood('idle')
      }, 700)
    }
  }

  function restart() {
    setRound(0)
    setPicked([])
    setMistakes(0)
    setSeed((s) => s + 1)
  }

  const earned = Math.max(POINTS.gameMin, POINTS.gameMax - mistakes)

  if (done && !practice) {
    return (
      <div className="space-y-6">
        <Header />
        <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-success/40 bg-success/10 p-8 text-center">
          <Trophy className="size-14 text-primary" aria-hidden />
          <p className="font-display text-2xl font-semibold">Game sudah selesai! Momo kenyang 🎉</p>
          <PointBadge points={points} className="text-base" />
          <Button variant="outline" className="rounded-2xl" onClick={() => { setPractice(true); restart() }}>
            <RotateCcw /> Main lagi (latihan, poin tidak berubah)
          </Button>
        </div>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="space-y-6">
        <Header />
        {!practice && <Confetti />}
        <div className="flex flex-col items-center gap-4 rounded-3xl border-2 bg-card p-8 text-center">
          <Monster mood="yum" />
          <p className="font-display text-3xl font-bold">Kamu berhasil! 🎉</p>
          <p className="text-lg text-muted-foreground">
            Salah pilih: <strong className="text-foreground">{mistakes} kali</strong>
          </p>
          {practice ? (
            <Button variant="outline" className="rounded-2xl" onClick={() => setPractice(false)}>
              Kembali
            </Button>
          ) : (
            <>
              <PointBadge points={earned} className="text-base" />
              <Button
                size="lg"
                className="chunky h-14 rounded-2xl px-8 text-lg font-extrabold"
                disabled={busy}
                onClick={() => onComplete(mistakes)}
              >
                Simpan Poin & Lanjut ke Soal ✏️
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Header />
      <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
        {ROUNDS.map((_, i) => (
          <span
            key={i}
            className={cn(
              'rounded-full px-3 py-1',
              i < round ? 'bg-success text-white' : i === round ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
            )}
          >
            Babak {i + 1}
          </span>
        ))}
        <span className="ml-auto rounded-full bg-muted px-3 py-1">❌ Salah: {mistakes}</span>
      </div>

      <div className="rounded-3xl border-2 bg-card p-5 sm:p-6">
        <p className="text-center font-display text-2xl font-semibold">{r.title}</p>
        <p className="mb-4 text-center text-muted-foreground">
          {r.hint} · Sisa: <strong className="text-foreground">{remaining}</strong>
        </p>

        {r.kind === 'feed' ? (
          <>
            <Monster mood={mood} />
            <div className="mt-6 grid grid-cols-5 gap-3">
              {order.map((n) => {
                const eaten = picked.includes(n)
                return (
                  <button
                    key={`${round}-${n}`}
                    onClick={() => pick(n)}
                    disabled={eaten}
                    aria-label={`Kue angka ${n}`}
                    className={cn(
                      'flex aspect-square items-center justify-center rounded-full border-4 border-dashed border-accent-foreground/30 bg-accent font-display text-2xl font-bold text-accent-foreground transition-transform hover:scale-110 motion-reduce:transition-none sm:text-3xl',
                      eaten && 'animate-pop',
                      wrong === n && 'animate-wiggle bg-destructive text-white',
                    )}
                  >
                    {n}
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-3 gap-x-3 gap-y-6 pt-2 sm:grid-cols-6">
            {order.map((n, i) => {
              const popped = picked.includes(n)
              return (
                <button
                  key={`${round}-${n}`}
                  onClick={() => pick(n)}
                  disabled={popped}
                  aria-label={`Balon angka ${n}`}
                  className={cn('group relative mx-auto flex flex-col items-center', !popped && 'animate-bob')}
                  style={{ animationDelay: `${(i % 5) * 0.3}s` }}
                >
                  {popped ? (
                    <span className="flex h-20 w-16 items-center justify-center text-3xl">💥</span>
                  ) : (
                    <>
                      <span
                        className={cn(
                          'flex h-20 w-16 items-center justify-center rounded-[50%_50%_45%_45%] font-display text-2xl font-bold text-white shadow-inner transition-transform group-hover:scale-110 motion-reduce:transition-none',
                          BALLOON_COLORS[i % BALLOON_COLORS.length],
                          wrong === n && 'animate-wiggle',
                        )}
                      >
                        {n}
                      </span>
                      <span className="h-6 w-px bg-foreground/40" />
                    </>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function Header() {
  return (
    <div className="space-y-2">
      <p className="font-display text-sm font-semibold tracking-wide text-secondary uppercase">Game Seru</p>
      <h2 className="text-3xl font-bold sm:text-4xl">Monster Momo & Balon Ajaib 👾🎈</h2>
      <p className="text-lg text-muted-foreground">
        Selesaikan 3 babak. Makin sedikit salah, makin banyak poin (maksimal {POINTS.gameMax} poin)!
      </p>
    </div>
  )
}
