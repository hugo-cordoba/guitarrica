import { useLayoutEffect, useRef } from 'react'

/* Loader basado en gregorcollienne.com (medidas tomadas del primer frame de la grabación de referencia):
   - Fondo liso y GUITARRICADELAFUENTE en el centro, DETRÁS de las fotos.
   - 5 columnas simétricas: ancho 13,6vw y hueco 9,5vw (horizontal y vertical); las extremas salen cortadas.
   - Fotos verticales 3:4 y horizontales 4:3 (estas más anchas que la columna, centradas en su hueco).
   - TODAS las columnas comparten la misma rejilla vertical (celda 3:4 + hueco) y se mueven a la MISMA velocidad.
     En el primer frame las columnas interiores dejan su HUECO justo a la altura del título (se lee limpio);
     las exteriores centran una foto en esa línea.
   - La columna central también deja libre la celda de la línea del título, pero tiene fotos POR ENCIMA
     (arriba del todo, donde antes estaba el "+") y por debajo.
   - La última foto del tramo central se centra, crece a pantalla completa y da paso al hero.
     Debajo de ella la columna sigue con más fotos (hasta el borde inferior), así no queda hueco al empezar la expansión. */
export const HERO = 'https://guitarricadelafuente.com/tillmans-x-guitarrica-1800x.webp'
const TILE = 'https://guitarricadelafuente.com/tillmans-x-guitarrica-400x.webp'

// ➜ Pon aquí tus fotos (p. ej. '/img/01.webp' en /public). Vacío = recortes de la foto del hero.
const IMAGES: string[] = []

// 'p' = vertical · 'l' = horizontal. Un patrón por distancia al centro (0 central, 1 interiores, 2 exteriores)
// → columnas espejo idénticas. Se lee desde la fila "ancla" (la de la línea del título) hacia abajo.
// Con estos patrones, junto al título quedan siempre fotos verticales (no invaden el hueco del nombre).
const PATTERN = ['pppp', 'pplpl', 'plppl']
const LAND = '139%' // ancho de las horizontales respecto a la columna (18,9vw / 13,6vw)
const CENTER_TILES = 4 // fotos de la columna central hasta el hero incluido (la última es el hero)
const HOLD = 900 // ms con el primer frame quieto, para que se lea el nombre
const DUR = 5000 // ms del auto-scroll
const EXPAND = 1200 // ms de la expansión final

// Las extremas solo existen desde md; en móvil quedan 3 columnas y sigue simétrico.
const COLS = ['hidden md:flex', 'flex', 'flex', 'flex', 'hidden md:flex']

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

export function Loader({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current!
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onDone()
      return
    }
    // Columnas visibles
    const cols = [...el.querySelectorAll<HTMLElement>('[data-col]')].filter((c) => c.offsetParent !== null)
    const mid = (cols.length - 1) / 2
    const center = cols[mid]
    let n = 0
    let raf = 0
    let dead = false

    // Geometría de la rejilla (px). Todas las columnas comparten el mismo paso vertical.
    const vh = el.clientHeight
    const h = (center.offsetWidth * 4) / 3 // alto de una celda 3:4
    const g = parseFloat(getComputedStyle(center.parentElement!).columnGap) || 0
    const pitch = h + g
    const anchor = vh / 2 - h / 2 // celda centrada en la línea del título

    // Celda 3:4 de la rejilla; las horizontales se centran dentro (más anchas que la columna).
    // j = posición relativa a la fila ancla (negativa = por encima), solo para elegir vertical/horizontal.
    const tile = (col: HTMLElement, j: number, d: number, src?: string) => {
      const kinds = PATTERN[d]
      const land = kinds[((j % kinds.length) + kinds.length) % kinds.length] === 'l'
      const slot = document.createElement('div')
      slot.className = 'relative flex-none'
      slot.style.aspectRatio = '3 / 4'
      let box = slot
      if (land) {
        box = document.createElement('div')
        box.className = 'absolute left-1/2 top-1/2'
        Object.assign(box.style, { width: LAND, aspectRatio: '4 / 3', transform: 'translate(-50%, -50%)' })
        slot.append(box)
      }
      box.classList.add('overflow-hidden', 'bg-muted')
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
      box.append(im)
      col.append(slot)
      return slot
    }

    // Columna central. La primera foto del tramo "hacia el hero" queda una fila por debajo de la ancla
    // (misma rejilla que las demás columnas). Por encima:
    //   - la celda de la ancla (línea del título) queda VACÍA para que el nombre se lea,
    //   - y más arriba van fotos que asoman en el primer frame (donde antes estaba el "+").
    let cpos = anchor + pitch
    let up = 0 // celdas por encima de la primera foto que asoman (la última de ellas es la del título)
    while (cpos - g > 0) { cpos -= pitch; up++ }
    center.style.marginTop = cpos + 'px'
    for (let i = 0; i < up - 1; i++) tile(center, i - up, 0) // fotos de arriba
    if (up > 0) {
      const gap = document.createElement('div') // hueco a la altura del título
      gap.className = 'flex-none'
      gap.style.aspectRatio = '3 / 4'
      center.append(gap)
    }

    // Tramo hasta el hero: la última foto es la imagen del hero.
    const centerTiles = Array.from({ length: CENTER_TILES }, (_, i) =>
      tile(center, i, 0, i === CENTER_TILES - 1 ? HERO : undefined)
    )
    const key = centerTiles[CENTER_TILES - 1]
    const kr = key.getBoundingClientRect()
    const dist = kr.top + kr.height / 2 - vh / 2 // recorrido para dejar la foto final centrada

    // Fotos POR DEBAJO del hero: cuando éste queda centrado, la columna debe seguir hasta el borde inferior
    // (espacio libre bajo el hero = vh/2 - h/2). +1 de margen para que nunca asome el fondo al expandir.
    const below = Math.ceil((vh / 2 - h / 2 + g) / pitch) + 1
    for (let i = 0; i < below; i++) tile(center, CENTER_TILES + i, 0)

    // Resto de columnas: interiores (distancia impar) con el HUECO en la línea del título y exteriores
    // con una celda centrada en ella. Se rellenan hasta cubrir el recorrido (misma velocidad para todas).
    cols.forEach((c, ci) => {
      if (c === center) return
      const d = Math.abs(ci - mid)
      let pos = d % 2 ? anchor - pitch / 2 : anchor
      let above = 0 // filas por encima de la ancla que asoman en el primer frame
      while (pos - g > 0) { pos -= pitch; above++ }
      c.style.marginTop = pos + 'px'
      const need = vh + dist - pos + pitch
      for (let i = 0; c.offsetHeight < need && i < 60; i++) tile(c, i - above, d)
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
      const t0 = performance.now() + HOLD // primer frame quieto HOLD ms
      const tick = (now: number) => {
        const t = Math.min(Math.max((now - t0) / DUR, 0), 1)
        const y = -ease(t) * dist
        cols.forEach((c) => (c.style.transform = `translate3d(0,${y}px,0)`)) // todas a la par
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
      cols.forEach((c) => { c.replaceChildren(); c.style.transform = ''; c.style.marginTop = '' })
      el.querySelector('[data-ghost]')?.remove()
      el.querySelectorAll<HTMLElement>('[data-fade]').forEach((f) => (f.style.opacity = ''))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={ref} aria-hidden="true" className="fixed inset-0 z-[100] overflow-hidden bg-background">
      {/* Título detrás de las fotos (z-1 < columnas z-2), centrado en la línea donde las columnas dejan su hueco */}
      <h2 data-fade className="absolute inset-x-0 top-1/2 z-[1] -translate-y-1/2 whitespace-nowrap text-center font-display text-[7vw] font-bold leading-none tracking-[-0.03em] text-foreground transition-opacity duration-500 md:text-[4.6vw]">
        GUITARRICADELAFUENTE
      </h2>
      {/* El hueco vertical (--g) debe ser mayor que el alto del título: 9vw > 7vw en móvil, 9,5vw > 4,6vw en escritorio */}
      <div data-fade className="absolute inset-y-0 left-1/2 z-[2] flex w-max -translate-x-1/2 items-start gap-[var(--g)] [--cw:30vw] [--g:9vw] transition-opacity duration-500 md:[--cw:13.6vw] md:[--g:9.5vw]">
        {COLS.map((cls, i) => (
          <div key={i} data-col className={`${cls} w-[var(--cw)] flex-none flex-col gap-[var(--g)] will-change-transform`} />
        ))}
      </div>
    </div>
  )
}