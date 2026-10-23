import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, Download, LogOut, RefreshCw, Search, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MAX_TOTAL, QUESTIONS } from '@/lib/module'
import { deleteStudent, getRecap, teacherLogin, type RecapRow } from '@/server/ebook.functions'
import { Footer, Mascot } from '@/components/ebook/shared'

export const Route = createFileRoute('/guru')({
  head: () => ({ meta: [{ title: 'Akses Guru · Faktor & Kelipatan' }] }),
  component: TeacherPage,
})

const PIN_KEY = 'ebook-faktor-kelipatan-guru'
const LETTERS = ['A', 'B', 'C', 'D']

function fmtDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

function csvCell(v: string | number) {
  const s = String(v)
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function buildCsv(rows: RecapRow[]) {
  const header = [
    'No',
    'Nama',
    'Kelas',
    'No Absen',
    'Poin Video',
    'Poin Faktor',
    'Poin Kelipatan',
    'Total Poin Membaca',
    'Poin Game',
    ...QUESTIONS.map((q) => `Soal ${q.no} (Jawaban)`),
    ...QUESTIONS.map((q) => `Soal ${q.no} (Poin)`),
    'Nilai Soal',
    'Total Poin',
    `Nilai Akhir (dari ${MAX_TOTAL})`,
    'Status',
    'Mulai',
    'Selesai',
  ]
  const lines = rows.map((r, i) => {
    const byNo = (no: number) => r.answers.find((a) => a.questionNo === no)
    return [
      i + 1,
      r.student.name,
      r.student.className,
      r.student.absentNo,
      r.video,
      r.factor,
      r.multiple,
      r.readingPoints,
      r.game,
      ...QUESTIONS.map((q) => {
        const a = byNo(q.no)
        return a ? `${LETTERS[a.choice]}${a.correct ? ' (benar)' : ' (salah)'}` : '-'
      }),
      ...QUESTIONS.map((q) => byNo(q.no)?.points ?? 0),
      r.quizScore,
      r.total,
      r.finalScore,
      r.finished ? 'Selesai' : 'Belum selesai',
      fmtDate(r.createdAt),
      fmtDate(r.finishedAt),
    ]
      .map(csvCell)
      .join(',')
  })
  return '﻿' + [header.map(csvCell).join(','), ...lines].join('\r\n')
}

function TeacherPage() {
  const [pin, setPin] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setPin(sessionStorage.getItem(PIN_KEY))
    setReady(true)
  }, [])

  if (!ready) return null
  if (!pin) {
    return (
      <Login
        onLogin={(p) => {
          sessionStorage.setItem(PIN_KEY, p)
          setPin(p)
        }}
      />
    )
  }
  return (
    <Dashboard
      pin={pin}
      onLogout={() => {
        sessionStorage.removeItem(PIN_KEY)
        setPin(null)
      }}
    />
  )
}

function Login({ onLogin }: { onLogin: (pin: string) => void }) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await teacherLogin({ data: { pin: value } })
      toast.success('Selamat datang, Bapak/Ibu Guru!')
      onLogin(value)
    } catch {
      toast.error('PIN Guru salah. Coba lagi.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-dots flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-3xl border-4 border-foreground bg-card p-8 chunky">
          <Mascot size={96} className="mx-auto" />
          <div className="text-center">
            <h1 className="text-3xl font-bold">Akses Guru</h1>
            <p className="text-muted-foreground">Masukkan PIN Guru untuk melihat rekap nilai siswa.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pin" className="text-base font-bold">
              PIN Guru
            </Label>
            <Input id="pin" type="password" value={value} onChange={(e) => setValue(e.target.value)} className="h-12 rounded-xl text-lg" autoFocus />
          </div>
          <Button type="submit" size="lg" disabled={busy || !value} className="chunky h-12 w-full rounded-2xl text-lg font-extrabold">
            {busy ? 'Memeriksa…' : 'Masuk'}
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link to="/">
              <ArrowLeft /> Kembali ke ebook
            </Link>
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  )
}

function Dashboard({ pin, onLogout }: { pin: string; onLogout: () => void }) {
  const [rows, setRows] = useState<RecapRow[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [classFilter, setClassFilter] = useState('Semua')
  const [toDelete, setToDelete] = useState<RecapRow | null>(null)

  async function load() {
    setLoading(true)
    try {
      setRows(await getRecap({ data: { pin } }))
    } catch {
      toast.error('Sesi Guru berakhir. Silakan masuk lagi.')
      onLogout()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const classes = useMemo(
    () => ['Semua', ...Array.from(new Set((rows ?? []).map((r) => r.student.className.toUpperCase()))).sort()],
    [rows],
  )
  const filtered = useMemo(
    () =>
      (rows ?? []).filter(
        (r) =>
          (classFilter === 'Semua' || r.student.className.toUpperCase() === classFilter) &&
          r.student.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [rows, query, classFilter],
  )

  const finished = filtered.filter((r) => r.finished)
  const avg = finished.length ? Math.round(finished.reduce((s, r) => s + r.finalScore, 0) / finished.length) : 0

  function download() {
    const blob = new Blob([buildCsv(filtered)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const suffix = classFilter === 'Semua' ? 'semua-kelas' : `kelas-${classFilter}`
    a.href = url
    a.download = `rekap-nilai-faktor-kelipatan-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('File CSV berhasil diunduh.')
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await deleteStudent({ data: { pin, id: toDelete.id } })
      toast.success(`Data ${toDelete.student.name} dihapus.`)
      setToDelete(null)
      load()
    } catch {
      toast.error('Gagal menghapus data.')
    }
  }

  return (
    <div className="bg-dots min-h-screen">
      <header className="border-b-2 bg-background/90">
        <div className="mx-auto flex max-w-content items-center gap-3 px-4 py-3 sm:px-6">
          <Mascot size={44} className="shrink-0 rounded-full bg-card" />
          <div className="flex-1">
            <h1 className="font-display text-xl leading-tight font-bold">Akses Guru · Rekap Nilai</h1>
            <p className="text-sm text-muted-foreground">Faktor dan Kelipatan · Kelas 4 Semester 1</p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/">
              <ArrowLeft /> Ebook
            </Link>
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={onLogout}>
            <LogOut /> <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-content space-y-6 px-4 py-6 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Jumlah siswa', value: filtered.length, icon: '👧🧒' },
            { label: 'Sudah selesai', value: finished.length, icon: '✅' },
            { label: 'Rata-rata nilai akhir', value: avg, icon: '⭐' },
          ].map((s) => (
            <div key={s.label} className="rounded-3xl border-2 bg-card p-5">
              <p className="text-sm font-bold text-muted-foreground">
                <span aria-hidden>{s.icon}</span> {s.label}
              </p>
              <p className="font-display text-4xl font-bold">{rows ? s.value : '–'}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-3xl border-2 bg-card p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama siswa…" className="h-11 rounded-xl pl-9" aria-label="Cari nama siswa" />
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filter kelas">
            {classes.map((c) => (
              <Button key={c} role="radio" aria-checked={classFilter === c} size="sm" variant={classFilter === c ? 'secondary' : 'outline'} className="rounded-xl" onClick={() => setClassFilter(c)}>
                {c}
              </Button>
            ))}
          </div>
          <Button variant="outline" className="h-11 rounded-xl" onClick={load} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : undefined} /> Muat ulang
          </Button>
          <Button className="chunky h-11 rounded-xl font-extrabold" onClick={download} disabled={!filtered.length}>
            <Download /> Unduh CSV
          </Button>
        </div>

        <div className="overflow-hidden rounded-3xl border-2 bg-card">
          {!rows ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-10 text-center">
              <Users className="size-10 text-muted-foreground" aria-hidden />
              <p className="font-display text-xl font-semibold">Belum ada data siswa</p>
              <p className="text-muted-foreground">Data akan muncul setelah siswa masuk dan mulai belajar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead className="text-center">Absen</TableHead>
                  <TableHead className="text-center">Video</TableHead>
                  <TableHead className="text-center">Faktor</TableHead>
                  <TableHead className="text-center">Kelipatan</TableHead>
                  <TableHead className="text-center">Game</TableHead>
                  {QUESTIONS.map((q) => (
                    <TableHead key={q.no} className="text-center">
                      S{q.no}
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Nilai Soal</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Nilai Akhir</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Aksi</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r, i) => (
                  <TableRow key={r.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="font-bold">{r.student.name}</TableCell>
                    <TableCell>{r.student.className}</TableCell>
                    <TableCell className="text-center">{r.student.absentNo}</TableCell>
                    <TableCell className="text-center">{r.video}</TableCell>
                    <TableCell className="text-center">{r.factor}</TableCell>
                    <TableCell className="text-center">{r.multiple}</TableCell>
                    <TableCell className="text-center">{r.gameDone ? r.game : '–'}</TableCell>
                    {QUESTIONS.map((q) => {
                      const a = r.answers.find((x) => x.questionNo === q.no)
                      return (
                        <TableCell key={q.no} className="text-center">
                          {a ? (
                            <span className={a.correct ? 'font-bold text-success' : 'font-bold text-destructive'}>
                              {LETTERS[a.choice]}
                            </span>
                          ) : (
                            '–'
                          )}
                        </TableCell>
                      )
                    })}
                    <TableCell className="text-center">{r.quizScore}</TableCell>
                    <TableCell className="text-center font-bold">{r.total}</TableCell>
                    <TableCell className="text-center">
                      <span className="rounded-lg bg-accent px-2 py-1 font-display text-base font-semibold text-accent-foreground">
                        {r.finalScore}
                      </span>
                    </TableCell>
                    <TableCell>
                      {r.finished ? (
                        <span className="rounded-full bg-success/15 px-2 py-1 text-xs font-bold text-success">Selesai</span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">Belajar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon-sm" aria-label={`Hapus data ${r.student.name}`} onClick={() => setToDelete(r)}>
                        <Trash2 className="text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Total poin = membaca (video 10 + faktor 10 + kelipatan 10) + game (maks. 20) + soal (5 × 20). Nilai akhir = total ÷{' '}
          {MAX_TOTAL} × 100. Huruf hijau = jawaban benar, merah = salah.
        </p>
      </main>
      <Footer />

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus data siswa?</DialogTitle>
            <DialogDescription>
              Semua poin dan jawaban milik <strong>{toDelete?.student.name}</strong> akan dihapus. Siswa dapat mengulang dari
              awal. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 /> Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
