import { useState } from 'react'

import { cn } from '@/lib/utils'
import { POINTS } from '@/lib/module'
import { Callout, ReadingGate } from './shared'

function FrogBoard() {
  const [jump, setJump] = useState(3)
  return (
    <div className="rounded-3xl border-2 border-success/40 bg-card p-5 sm:p-6">
      <p className="font-display text-xl font-semibold">🐸 Papan Lompat Katak Kiki</p>
      <p className="mb-4 text-muted-foreground">Pilih panjang lompatan Kiki. Kotak yang diinjak adalah kelipatannya!</p>
      <div className="mb-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Panjang lompatan">
        {[2, 3, 4, 5, 6, 7, 8, 9].map((j) => (
          <button
            key={j}
            role="radio"
            aria-checked={jump === j}
            onClick={() => setJump(j)}
            className={cn(
              'size-12 rounded-2xl border-2 font-display text-xl font-semibold transition-colors motion-reduce:transition-none',
              jump === j ? 'border-success bg-success text-white' : 'bg-muted hover:border-success',
            )}
          >
            {j}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
        {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => {
          const hit = n % jump === 0
          return (
            <div
              key={n}
              className={cn(
                'flex aspect-square items-center justify-center rounded-lg text-xs font-bold sm:text-base',
                hit ? 'bg-success text-white' : 'bg-muted text-muted-foreground',
              )}
            >
              {hit && n === jump ? '🐸' : n}
            </div>
          )
        })}
      </div>
      <p className="mt-4 rounded-2xl bg-success/10 p-3 text-center font-bold">
        Kelipatan {jump}: {Array.from({ length: 6 }, (_, i) => jump * (i + 1)).join(', ')}, …
      </p>
    </div>
  )
}

export function MultiplePage({ done, busy, onComplete }: { done: boolean; busy?: boolean; onComplete: () => void }) {
  return (
    <article className="space-y-6 text-lg">
      <div className="space-y-2">
        <p className="font-display text-sm font-semibold tracking-wide text-secondary uppercase">Halaman 3</p>
        <h2 className="text-3xl font-bold sm:text-4xl">Mengenal Kelipatan 🐸</h2>
      </div>

      <p className="leading-relaxed">
        Setiap hari Beni menabung <strong>Rp2.000</strong>. Hari ke-1 tabungannya Rp2.000, hari ke-2 Rp4.000, hari ke-3
        Rp6.000, dan seterusnya. Angka 2, 4, 6, 8, … adalah <strong>kelipatan dari 2</strong>.
      </p>

      <Callout emoji="📌" title="Apa itu Kelipatan?" tone="accent">
        <p>
          <strong>Kelipatan</strong> suatu bilangan adalah hasil kali bilangan itu dengan 1, 2, 3, 4, dan seterusnya.
        </p>
        <p>Cara mudahnya: tambahkan bilangan itu terus-menerus (seperti lompat-lompat).</p>
      </Callout>

      <div className="overflow-hidden rounded-3xl border-2 bg-card">
        <div className="bg-secondary px-5 py-3 font-display text-lg font-semibold text-secondary-foreground">Kelipatan dari 4</div>
        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((k) => (
            <div key={k} className="bg-card px-5 py-3 font-display text-xl">
              4 × {k} = <strong className="text-secondary">{4 * k}</strong>
            </div>
          ))}
        </div>
        <div className="bg-muted px-5 py-3 font-bold">
          Jadi, kelipatan 4 adalah <span className="text-secondary">4, 8, 12, 16, 20, 24, …</span> (tidak ada habisnya!)
        </div>
      </div>

      <FrogBoard />

      <Callout emoji="🤝" title="Kelipatan Persekutuan & KPK" tone="primary">
        <p>Kelipatan yang sama dari dua bilangan disebut kelipatan persekutuan.</p>
        <p>
          Kelipatan 4: 4, 8, <strong>12</strong>, 16, 20, <strong>24</strong>, … <br />
          Kelipatan 6: 6, <strong>12</strong>, 18, <strong>24</strong>, 30, …
        </p>
        <p>
          Kelipatan persekutuan 4 dan 6: 12, 24, … Yang <strong>terkecil</strong> adalah <strong>12</strong>, disebut{' '}
          <strong>KPK</strong> (Kelipatan Persekutuan Terkecil).
        </p>
      </Callout>

      <div className="grid gap-4 sm:grid-cols-2">
        <Callout emoji="🔍" title="Faktor vs Kelipatan" tone="secondary">
          <p>
            <strong>Faktor</strong> → jumlahnya terbatas dan tidak lebih besar dari bilangannya.
          </p>
          <p>
            <strong>Kelipatan</strong> → jumlahnya tidak terbatas dan makin besar.
          </p>
        </Callout>
        <Callout emoji="🏠" title="Dalam Kehidupan Sehari-hari" tone="grape">
          <p>Lampu A berkedip tiap 2 detik, lampu B tiap 3 detik. Keduanya berkedip bersama tiap 6 detik (KPK 2 dan 3).</p>
        </Callout>
      </div>

      <ReadingGate done={done} busy={busy} points={POINTS.multiple} onComplete={onComplete} />
    </article>
  )
}
