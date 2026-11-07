import { useLayoutEffect, useRef } from 'react'
import { Plus } from 'lucide-react'

/* Loader basado en gregorcollienne.com (medidas tomadas de la captura de referencia):
   - Fondo liso, "+" arriba al centro y GUITARRICADELAFUENTE en el centro, DETRÁS de las fotos.
   - 5 columnas simétricas: ancho 13,6vw y hueco 9,5vw (horizontal y vertical); las extremas salen cortadas.
   - Fotos verticales 3:4 y horizontales 4:3 (estas más anchas que la columna, centradas en su eje).
   - La columna central entra desde abajo; su última foto se centra, crece a pantalla completa y da paso al hero. */
export const HERO = 'https://guitarricadelafuente.com/tillmans-x-guitarrica-1800x.webp'
const TILE = 'https://guitarricadelafuente.com/tillmans-x-guitarrica-400x.webp'

// ➜ Pon aquí tus fotos (p. ej. '/img/01.webp' en /public). Vacío = recortes de la foto del hero.
const IMAGES: string[] = []

// 'p' = vertical · 'l' = horizontal. Un patrón por distancia al centro → columnas espejo idénticas.
const PATTERN = ['pppp', 'plppl', 'lplpp']
const LAND = '139%' // ancho de las horizontales respecto a la columna (18,9vw / 13,6vw)
const CENTER_TILES = 4 // fotos de la columna central (la última es el hero)
const DUR = 5000 // ms del auto-scroll
const EXPAND = 1200 // ms de la expansión final

const COLS = [
  { speed: 0.55, cls: 'hidden pt-[14vh] md:flex' },
  { speed: 0.78, cls: 'flex pt-[3vh]' },
  { speed: 1, cls: 'flex pt-[100vh]' }, // entra desde abajo
  { speed: 0.78, cls: 'flex pt-[3vh]' },
  { speed: 0.55, cls: 'hidden pt-[14vh] md:flex' },
]

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

export function Loader({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current!
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onDone()
      return
    }
    // Columnas visibles (en móvil las extremas están ocultas → 3 columnas, sigue simétrico)
    const cols = [...el.querySelectorAll<HTMLElement>('[data-col]')].filter((c) => c.offsetParent !== null)
    const mid = (cols.length - 1) / 2
    const center = cols[mid]
    let n = 0
    let raf = 0
    let dead = false

    const tile = (col: HTMLElement, i: number, k: number, src?: string) => {
      const kinds = PATTERN[k]
      const land = kinds[i % kinds.length] === 'l'
      const t = document.createElement('div')
      t.className = 'relative flex-none overflow-hidden bg-muted'
      t.style.aspectRatio = land ? '4 / 3' : '3 / 4'
      if (land) {
        t.style.width = LAND
        t.style.alignSelf = 'center'
      }
      const im = new Image()
      im.alt = ''
      im.decoding = 'async'
      im.className = 'h-full w-full object-cover'
      if (src) im.src = src
      else if (IMAGES.length) im.src = IMAGES[n++ % IMAGES.length]
      else {
        im.src = TILE
        im.style.objectPosition = `${(n * 37) % 100}% ${(n * 61) % 100}%`
        im.style.transform = `scale(${1.3 + (n++ % 4) * 0.4})`
      }
      t.append(im)
      col.append(t)
      return t
    }

    // Columna central: la última foto es la imagen del hero
    const centerTiles = Array.from({ length: CENTER_TILES }, (_, i) =>
      tile(center, i, 0, i === CENTER_TILES - 1 ? HERO : undefined)
    )
    const key = centerTiles[CENTER_TILES - 1]
    const vh = innerHeight
    const kr = key.getBoundingClientRect()
    const dist = kr.top + kr.height / 2 - vh / 2 // recorrido para dejar la foto final centrada
    const speed = (c: HTMLElement) => Number(c.dataset.speed)

    // Resto de columnas: se rellenan hasta cubrir su recorrido (velocidad < 1 = parallax)
    cols.forEach((c, ci) => {
      if (c === center) return
      const need = vh + dist * speed(c) + 60
      for (let i = 0; c.offsetHeight < need && i < 40; i++) tile(c, i, Math.abs(ci - mid))
    })

    const expand = () => {
      const r = key.getBoundingClientRect()
      const ghost = key.cloneNode(true) as HTMLElement // clon fuera de las columnas transformadas
      ghost.dataset.ghost = ''
      Object.assign(ghost.style, {
        position: 'fixed', zIndex: '4', aspectRatio: 'auto',
        top: r.top + 'px', left: r.left + 'px', width: r.width + 'px', height: r.height + 'px',
      })
      el.append(ghost)
      key.style.visibility = 'hidden'
      el.querySelectorAll<HTMLElement>('[data-fade]').forEach((f) => (f.style.opacity = '0'))
      ghost
        .animate(
          [
            { top: r.top + 'px', left: r.left + 'px', width: r.width + 'px', height: r.height + 'px' },
            { top: '0px', left: '0px', width: '100%', height: '100%' },
          ],
          { duration: EXPAND, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' }
        )
        .finished.then(() => !dead && onDone(), () => !dead && onDone())
    }

    const run = () => {
      if (dead) return
      const t0 = performance.now()
      const tick = (now: number) => {
        const t = Math.min((now - t0) / DUR, 1)
        const p = ease(t)
        cols.forEach((c) => (c.style.transform = `translate3d(0,${-p * dist * speed(c)}px,0)`))
        if (t < 1) raf = requestAnimationFrame(tick)
        else expand()
      }
      raf = requestAnimationFrame(tick)
    }

    // Espera a que decodifiquen las imágenes (máx. 3,5 s para no bloquear)
    Promise.race([
      Promise.all([...el.querySelectorAll('img')].map((i) => i.decode().catch(() => {}))),
      new Promise((r) => setTimeout(r, 3500)),
    ]).then(run)

    // Limpieza (StrictMode monta dos veces en dev)
    return () => {
      dead = true
      cancelAnimationFrame(raf)
      cols.forEach((c) => { c.replaceChildren(); c.style.transform = '' })
      el.querySelector('[data-ghost]')?.remove()
      el.querySelectorAll<HTMLElement>('[data-fade]').forEach((f) => (f.style.opacity = ''))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={ref} aria-hidden="true" className="fixed inset-0 z-[100] overflow-hidden bg-background">
      <Plus data-fade strokeWidth={1.25} className="absolute left-1/2 top-4 z-[5] h-7 w-7 -translate-x-1/2 text-foreground transition-opacity duration-500" />
      {/* Título detrás de las fotos (z-1 < columnas z-2) */}
      <h2 data-fade className="absolute inset-x-0 top-1/2 z-[1] -translate-y-1/2 whitespace-nowrap text-center font-display text-[7vw] font-bold leading-none tracking-[-0.03em] text-foreground transition-opacity duration-500 md:text-[4.6vw]">
        GUITARRICADELAFUENTE
      </h2>
      <div data-fade className="absolute inset-y-0 left-1/2 z-[2] flex w-max -translate-x-1/2 items-start gap-[var(--g)] [--cw:30vw] [--g:6vw] transition-opacity duration-500 md:[--cw:13.6vw] md:[--g:9.5vw]">
        {COLS.map((c, i) => (
          <div key={i} data-col data-speed={c.speed} className={`${c.cls} w-[var(--cw)] flex-none flex-col gap-[var(--g)] will-change-transform`} />
        ))}
      </div>
    </div>
  )
}
