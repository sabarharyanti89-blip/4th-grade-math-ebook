import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Clock, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function cdn(file: string, w: number) {
  return `/.netlify/images?url=/img/${file}&w=${w}&fm=webp`
}

export function Mascot({ className, size = 160 }: { className?: string; size?: number }) {
  return (
    <img
      src={cdn('mascot.png', size * 2)}
      alt="Kak Owi, burung hantu pemandu belajar"
      width={size}
      height={size}
      className={cn('object-cover mix-blend-multiply', className)}
      style={{ width: size, height: size }}
    />
  )
}

export function PointBadge({ points, className }: { points: number; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm font-extrabold text-accent-foreground',
        className,
      )}
    >
      <Sparkles className="size-4" aria-hidden /> +{points} poin
    </span>
  )
}

export function Footer() {
  return (
    <footer className="py-8 text-center text-sm text-muted-foreground">
      Ebook Matematika Kelas 4 · Semester 1 ·{' '}
      <span className="font-display font-semibold text-primary">Created by Nata</span>
    </footer>
  )
}

const CONFETTI_COLORS = ['var(--primary)', 'var(--secondary)', 'var(--accent)', 'var(--grape)', 'var(--success)']

export function Confetti({ count = 60 }: { count?: number }) {
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 2.4 + Math.random() * 2,
      size: 6 + Math.random() * 8,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      round: Math.random() > 0.5,
    })),
  )
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden motion-reduce:hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * (p.round ? 1 : 0.5),
            background: p.color,
            borderRadius: p.round ? '999px' : '2px',
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Finish button for reading pages: unlocks after the reader reaches the
 * bottom of the page and has spent a minimum time on it.
 */
export function ReadingGate({
  done,
  points,
  minSeconds = 20,
  onComplete,
  busy,
}: {
  done: boolean
  points: number
  minSeconds?: number
  onComplete: () => void
  busy?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)
  const [left, setLeft] = useState(minSeconds)

  useEffect(() => {
    if (done) return
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [done])

  useEffect(() => {
    const el = ref.current
    if (!el || done) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.6 })
    io.observe(el)
    return () => io.disconnect()
  }, [done])

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-success/40 bg-success/10 p-6 text-center">
        <CheckCircle2 className="size-10 text-success" aria-hidden />
        <p className="font-display text-xl font-semibold">Hebat! Halaman ini sudah selesai.</p>
        <PointBadge points={points} />
      </div>
    )
  }

  const ready = seen && left === 0
  return (
    <div ref={ref} className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-primary/40 bg-card p-6 text-center">
      <p className="font-display text-xl font-semibold">Sudah selesai membaca?</p>
      <p className="text-muted-foreground">
        Tekan tombol di bawah untuk mendapat <strong className="text-foreground">{points} poin</strong> dan membuka halaman berikutnya.
      </p>
      <Button size="lg" className="chunky h-14 rounded-2xl px-8 text-lg font-extrabold" disabled={!ready || busy} onClick={onComplete}>
        {ready ? (
          <>
            <CheckCircle2 className="size-5" aria-hidden /> Saya Sudah Selesai Membaca
          </>
        ) : (
          <>
            <Clock className="size-5" aria-hidden />
            {left > 0 ? `Baca dulu ya… ${left} detik` : 'Gulir sampai bawah dulu'}
          </>
        )}
      </Button>
    </div>
  )
}

export function Callout({
  emoji,
  title,
  children,
  tone = 'accent',
}: {
  emoji: string
  title: string
  children: React.ReactNode
  tone?: 'accent' | 'secondary' | 'primary' | 'grape'
}) {
  const tones = {
    accent: 'border-accent bg-accent/25',
    secondary: 'border-secondary/50 bg-secondary/10',
    primary: 'border-primary/40 bg-primary/10',
    grape: 'border-grape/40 bg-grape/10',
  }
  return (
    <div className={cn('rounded-3xl border-2 p-5', tones[tone])}>
      <p className="mb-2 flex items-center gap-2 font-display text-lg font-semibold">
        <span className="text-2xl" aria-hidden>
          {emoji}
        </span>
        {title}
      </p>
      <div className="space-y-2 leading-relaxed">{children}</div>
    </div>
  )
}
