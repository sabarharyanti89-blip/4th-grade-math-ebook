import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { POINTS } from '@/lib/module'
import { Callout, ReadingGate } from './shared'

function factorPairs(n: number) {
  const pairs: [number, number][] = []
  for (let a = 1; a * a <= n; a++) if (n % a === 0) pairs.push([a, n / a])
  return pairs
}

function factorsOf(n: number) {
  return factorPairs(n)
    .flatMap(([a, b]) => (a === b ? [a] : [a, b]))
    .sort((x, y) => x - y)
}

const DOT_COLORS = ['bg-primary', 'bg-secondary', 'bg-grape', 'bg-success']

function FactorExplorer() {
  const [n, setN] = useState(12)
  const pairs = factorPairs(n)
  const factors = factorsOf(n)

  return (
    <div className="rounded-3xl border-2 border-secondary/50 bg-card p-5 sm:p-6">
      <p className="font-display text-xl font-semibold">🍪 Lab Kue Kak Owi</p>
      <p className="mb-4 text-muted-foreground">
        Pilih jumlah kue. Lihat berapa banyak cara menyusunnya menjadi barisan yang sama panjang!
      </p>

      <div className="mb-5 flex items-center justify-center gap-4">
        <Button variant="outline" size="icon-lg" className="rounded-full" aria-label="Kurangi" onClick={() => setN((v) => Math.max(1, v - 1))}>
          <Minus />
        </Button>
        <div className="min-w-24 rounded-2xl bg-accent px-6 py-2 text-center font-display text-4xl font-bold text-accent-foreground">
          {n}
        </div>
        <Button variant="outline" size="icon-lg" className="rounded-full" aria-label="Tambah" onClick={() => setN((v) => Math.min(36, v + 1))}>
          <Plus />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {pairs.map(([rows, cols], i) => (
          <div key={rows} className="rounded-2xl bg-muted p-4">
            <p className="mb-2 font-bold">
              {rows} baris × {cols} kue = {n}
            </p>
            <div className="flex max-w-full flex-wrap gap-3 overflow-x-auto">
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(cols, 18)}, minmax(0, 1fr))` }}>
                {Array.from({ length: rows * Math.min(cols, 18) }, (_, k) => (
                  <span key={k} className={`size-3 rounded-full ${DOT_COLORS[i % DOT_COLORS.length]}`} />
                ))}
              </div>
              {cols > 18 && <span className="self-center text-sm text-muted-foreground">…dan seterusnya</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-secondary/10 p-4 text-center">
        <p className="text-sm font-bold text-muted-foreground">Faktor dari {n} adalah</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {factors.map((f) => (
            <span key={f} className="rounded-xl bg-secondary px-3 py-1 font-display text-xl font-semibold text-secondary-foreground">
              {f}
            </span>
          ))}
        </div>
        {factors.length === 2 && (
          <p className="mt-3 font-bold text-grape">✨ {n} hanya punya 2 faktor, jadi {n} adalah bilangan prima!</p>
        )}
      </div>
    </div>
  )
}

export function FactorPage({ done, busy, onComplete }: { done: boolean; busy?: boolean; onComplete: () => void }) {
  return (
    <article className="space-y-6 text-lg">
      <div className="space-y-2">
        <p className="font-display text-sm font-semibold tracking-wide text-secondary uppercase">Halaman 2</p>
        <h2 className="text-3xl font-bold sm:text-4xl">Mengenal Faktor 🧩</h2>
      </div>

      <p className="leading-relaxed">
        Bayangkan kamu punya <strong>12 kue</strong> dan ingin membaginya kepada teman-teman{' '}
        <strong>sama banyak tanpa sisa</strong>. Kamu bisa membaginya kepada 1, 2, 3, 4, 6, atau 12 orang. Bilangan-bilangan
        itulah yang disebut <strong>faktor dari 12</strong>.
      </p>

      <Callout emoji="📌" title="Apa itu Faktor?" tone="accent">
        <p>
          <strong>Faktor</strong> suatu bilangan adalah bilangan-bilangan yang dapat <strong>membagi habis</strong>{' '}
          bilangan tersebut (tidak ada sisa).
        </p>
        <p>Contoh: 12 : 3 = 4 (habis). Jadi, 3 adalah faktor dari 12. Tetapi 12 : 5 = 2 sisa 2, jadi 5 bukan faktor dari 12.</p>
      </Callout>

      <h3 className="text-2xl font-semibold">Cara Mencari Faktor: Pasangan Perkalian</h3>
      <p className="leading-relaxed">
        Cari dua bilangan yang jika dikalikan hasilnya sama dengan bilangan itu. Mulai dari 1, lalu naik satu per satu.
      </p>
      <div className="overflow-hidden rounded-3xl border-2 bg-card">
        <div className="bg-primary px-5 py-3 font-display text-lg font-semibold text-primary-foreground">Faktor dari 18</div>
        <ul className="divide-y">
          {[
            [1, 18],
            [2, 9],
            [3, 6],
          ].map(([a, b]) => (
            <li key={a} className="flex items-center justify-between px-5 py-3">
              <span className="font-display text-xl">
                {a} × {b} = 18
              </span>
              <span className="text-sm font-bold text-muted-foreground">
                {a} dan {b} adalah faktor
              </span>
            </li>
          ))}
        </ul>
        <div className="bg-muted px-5 py-3 font-bold">
          Jadi, faktor dari 18 adalah <span className="text-primary">1, 2, 3, 6, 9, 18</span>.
        </div>
      </div>

      <FactorExplorer />

      <div className="grid gap-4 sm:grid-cols-2">
        <Callout emoji="💡" title="Ingat ya!" tone="secondary">
          <p>Angka 1 adalah faktor dari semua bilangan.</p>
          <p>Setiap bilangan adalah faktor dari dirinya sendiri.</p>
        </Callout>
        <Callout emoji="⭐" title="Bilangan Prima" tone="grape">
          <p>
            Bilangan yang hanya punya <strong>2 faktor</strong> (1 dan dirinya sendiri) disebut <strong>bilangan prima</strong>.
          </p>
          <p>Contoh: 2, 3, 5, 7, 11, 13.</p>
        </Callout>
      </div>

      <Callout emoji="🤝" title="Faktor Persekutuan" tone="primary">
        <p>Faktor yang sama dari dua bilangan disebut faktor persekutuan.</p>
        <p>
          Faktor 12: 1, 2, 3, 4, 6, 12 · Faktor 18: 1, 2, 3, 6, 9, 18 <br />
          Faktor persekutuan 12 dan 18: <strong>1, 2, 3, 6</strong>. Yang terbesar adalah <strong>6</strong> (disebut FPB).
        </p>
      </Callout>

      <ReadingGate done={done} busy={busy} points={POINTS.factor} onComplete={onComplete} />
    </article>
  )
}
