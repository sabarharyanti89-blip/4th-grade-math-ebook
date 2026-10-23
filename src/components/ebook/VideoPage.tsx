import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, PlayCircle } from 'lucide-react'

import { Progress as Bar } from '@/components/ui/progress'
import { POINTS, VIDEO_ID, VIDEO_URL } from '@/lib/module'
import { PointBadge } from './shared'

// Minimal typings for the YouTube IFrame API.
type YTPlayer = {
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
  destroy: () => void
}
declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: unknown) => YTPlayer; PlayerState: { PLAYING: number; ENDED: number } }
    onYouTubeIframeAPIReady?: () => void
  }
}

const REQUIRED = 0.85

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  return new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }
    if (!document.getElementById('yt-iframe-api')) {
      const s = document.createElement('script')
      s.id = 'yt-iframe-api'
      s.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(s)
    }
  })
}

export function VideoPage({ done, onComplete }: { done: boolean; onComplete: () => void }) {
  const holder = useRef<HTMLDivElement>(null)
  const watched = useRef(new Set<number>())
  const sent = useRef(false)
  const doneRef = useRef(done)
  useEffect(() => {
    doneRef.current = done
  }, [done])
  const [ratio, setRatio] = useState(0)

  useEffect(() => {
    let player: YTPlayer | null = null
    let timer: ReturnType<typeof setInterval> | undefined
    let cancelled = false

    loadYouTubeApi().then(() => {
      if (cancelled || !holder.current || !window.YT) return
      const YT = window.YT
      player = new YT.Player(holder.current, {
        videoId: VIDEO_ID,
        width: '100%',
        height: '100%',
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
      })
      // Count each second actually played, so skipping ahead does not count.
      timer = setInterval(() => {
        if (!player?.getPlayerState) return
        const duration = player.getDuration()
        if (player.getPlayerState() === YT.PlayerState.PLAYING && duration > 0) {
          watched.current.add(Math.floor(player.getCurrentTime()))
          const r = Math.min(1, watched.current.size / Math.floor(duration))
          setRatio(r)
          if (r >= REQUIRED && !sent.current && !doneRef.current) {
            sent.current = true
            onComplete()
          }
        }
      }, 1000)
    })

    return () => {
      cancelled = true
      if (timer) clearInterval(timer)
      player?.destroy()
    }
    // onComplete is stable enough for a one-shot award; avoid re-creating the player.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pct = done ? 100 : Math.round((ratio / REQUIRED) * 100)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="font-display text-sm font-semibold tracking-wide text-secondary uppercase">Halaman 1</p>
        <h2 className="text-3xl font-bold sm:text-4xl">Ayo Menonton Video! 🎬</h2>
        <p className="text-lg text-muted-foreground">
          Tonton video tentang <strong className="text-foreground">Faktor dan Kelipatan</strong> sampai selesai. Poin
          akan masuk otomatis setelah kamu menonton.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border-4 border-foreground bg-foreground chunky">
        <div className="aspect-video w-full">
          <div ref={holder} className="size-full" />
        </div>
      </div>

      <div className="rounded-3xl border-2 bg-card p-5">
        {done ? (
          <div className="flex flex-wrap items-center gap-3">
            <CheckCircle2 className="size-8 text-success" aria-hidden />
            <p className="font-display text-xl font-semibold">Video sudah ditonton. Halaman 2 terbuka!</p>
            <PointBadge points={POINTS.video} />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 font-bold">
                <PlayCircle className="size-5 text-primary" aria-hidden /> Progres menonton
              </p>
              <span className="font-display text-lg font-semibold">{Math.min(100, pct)}%</span>
            </div>
            <Bar value={Math.min(100, pct)} className="h-4" />
            <p className="text-sm text-muted-foreground">
              Tonton tanpa melompat-lompat ya. Poin {POINTS.video} masuk otomatis saat bar penuh.
            </p>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Sumber video:{' '}
        <a className="font-semibold text-secondary underline" href={VIDEO_URL} target="_blank" rel="noreferrer">
          {VIDEO_URL}
        </a>
      </p>
    </div>
  )
}
