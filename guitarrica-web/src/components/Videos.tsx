import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

/* Sección de vídeos: un vídeo destacado grande + 2 laterales.
   - Solo se carga la miniatura de YouTube; el reproductor (youtube-nocookie) se monta al pulsar play,
     así no se descarga nada de terceros ni se ponen cookies hasta que la persona lo pide.
   - Pulsar un lateral lo intercambia con el destacado y lo reproduce; el que estaba pasa al lateral.
   - Las tarjetas son siempre oscuras (como las fotos del hero), en modo claro y oscuro.
   - Se muestran 3 vídeos: el primero de VIDEOS arranca como destacado. */

type Video = { id: string; title: string; meta: string; thumb?: string }

// ➜ Tus vídeos. `id` es lo que va tras "v=" en la URL de YouTube.
//   `thumb` (opcional): portada propia, p. ej. '/img/video-1.webp'. Sin ella se usa la miniatura de YouTube.
const VIDEOS: Video[] = [
  { id: 'VIDEO_ID_1', title: 'Título del vídeo 1', meta: 'Videoclip · 2026' },
  { id: 'VIDEO_ID_2', title: 'Título del vídeo 2', meta: 'Videoclip · 2026' },
  { id: 'VIDEO_ID_3', title: 'Título del vídeo 3', meta: 'Videoclip · 2025' },
]

const CHANNEL = 'https://www.youtube.com/@guitarricadelafuente' // ➜ comprueba la URL de tu canal

const pad = 'px-[clamp(1rem,3vw,2.5rem)]'
const thumbUrl = (id: string, size: 'maxresdefault' | 'hqdefault') => `https://i.ytimg.com/vi/${id}/${size}.jpg`

function Thumb({ video }: { video: Video }) {
  const [src, setSrc] = useState(video.thumb ?? thumbUrl(video.id, 'maxresdefault'))
  const fallback = thumbUrl(video.id, 'hqdefault')
  // maxresdefault no existe en todos los vídeos (YouTube devuelve entonces un gris de 120 px): se pasa a hqdefault
  const toFallback = () => setSrc((s) => (s === fallback ? s : fallback))
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={toFallback}
      onLoad={(e) => { if (!video.thumb && e.currentTarget.naturalWidth <= 120) toFallback() }}
      className="absolute inset-0 h-full w-full object-cover"
    />
  )
}

function Poster({ video, big, onPlay, className }: { video: Video; big?: boolean; onPlay: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Reproducir ${video.title}`}
      className={cn(
        'group relative block w-full overflow-hidden bg-stone-900 text-left text-stone-50 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      <Thumb video={video} />
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/0 to-stone-950/10" />

      <span
        aria-hidden="true"
        className={cn(
          'absolute left-4 top-4 grid place-items-center rounded-full bg-stone-50 text-stone-950 transition-colors duration-300 group-hover:bg-primary group-focus-visible:bg-primary md:left-6 md:top-6',
          big ? 'h-14 w-14 md:h-16 md:w-16' : 'h-10 w-10 md:h-12 md:w-12'
        )}
      >
        <Play className={cn('translate-x-px fill-current', big ? 'h-5 w-5' : 'h-4 w-4')} />
      </span>

      <span className="absolute inset-x-0 bottom-0 p-4 md:p-6">
        <span className="block text-xs text-stone-300">{video.meta}</span>
        <span
          className={cn(
            'mt-1.5 block font-display font-semibold leading-[.95] tracking-tighter',
            big ? 'text-3xl sm:text-5xl lg:text-6xl' : 'text-xl md:text-2xl'
          )}
        >
          {video.title}
        </span>
      </span>
    </button>
  )
}

export function Videos() {
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)
  const stage = useRef<HTMLDivElement>(null)

  const main = VIDEOS[active]
  const side = VIDEOS.flatMap((video, i) => (i === active ? [] : [{ video, i }])).slice(0, 2)

  const play = (i: number) => {
    setActive(i)
    setPlaying(true)
    // En móvil el destacado queda arriba del lateral pulsado: lo traemos a la vista
    stage.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  // Al reproducir, el foco pasa al reproductor (teclado y lectores de pantalla)
  useEffect(() => {
    if (playing) stage.current?.querySelector('iframe')?.focus({ preventScroll: true })
  }, [playing, active])

  return (
    <section id="videos" className={cn('border-t border-border py-[clamp(5rem,10vw,8rem)]', pad)}>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="text-4xl font-medium leading-none tracking-tight md:text-6xl">Canciones</h2>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground lg:pb-1">
          Mira los últimos videoclips de Guitarricadelafuente aquí o entra en su{' '}
          <a
            href={CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-foreground underline decoration-muted-foreground/50 underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:decoration-foreground"
          >
            canal de YouTube
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          </a>
          .
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-4">
        {/* Destacado */}
        <div ref={stage} className="relative aspect-video scroll-mt-24 overflow-hidden bg-stone-900">
          {playing ? (
            <iframe
              key={main.id}
              src={`https://www.youtube-nocookie.com/embed/${main.id}?autoplay=1&rel=0&playsinline=1`}
              title={main.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <Poster key={main.id} video={main} big onPlay={() => play(active)} className="absolute inset-0 h-full" />
          )}
        </div>

        {/* Laterales: en escritorio se reparten la altura del destacado */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 lg:gap-4">
          {side.map(({ video, i }) => (
            <Poster key={video.id} video={video} onPlay={() => play(i)} className="aspect-video lg:aspect-auto lg:h-full" />
          ))}
        </div>
      </div>
    </section>
  )
}