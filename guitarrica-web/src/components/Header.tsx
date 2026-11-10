import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/* Header estilo web de artista. Siempre fijo. Su aspecto va LIGADO AL SCROLL (sin saltos ni umbrales):
   1. Sobre el hero: transparente, texto claro y degradado sutil arriba para el contraste.
   2. Durante los últimos FADE px antes de llegar a la altura a la que aterriza #tour (al pulsar TOUR en el menú),
      se va volviendo blanco poco a poco (fondo, borde y color del texto); al llegar a esa altura ya es 100 % blanco.
      No hace falta pulsar nada: basta con hacer scroll.
   3. Mientras el hero termina de salir de debajo de la barra se mantiene blanco; después, y a lo largo de GLASS px,
      pasa a glass (bg-background/80 + backdrop-blur) y se queda así.
   - Mecánica: update() calcula --p (blanco), --t (color del texto) y --q (glass) y los escribe en el <header>
     sin re-renderizar; el estilo los lee con calc()/var(). Una transición corta (200 ms) suaviza el seguimiento.
   - Su alto es var(--header-h) (definida en index.css, borde inferior incluido). Esa misma variable alimenta
     scroll-padding-top, así que al ir a una sección desde el menú su borde superior queda justo bajo la barra
     y la línea del header y la de la sección coinciden (nada de la sección queda tapado).
   - Nombre a la izquierda (mayúsculas) y entradas del menú alineadas a la derecha. Inter (font-sans).
   - La sección visible queda subrayada.
   - < lg: botón de menú a la derecha → menú a pantalla completa (Esc cierra, bloquea el scroll). */
const LINKS = [
  { label: 'TOUR', href: '#tour' },
  { label: 'shop', href: '#shop' },
  { label: 'CANCIONES', href: '#videos' },
  { label: 'bio', href: '#bio' },
  { label: 'community', href: '#community' },
  { label: 'booking', href: 'mailto:info@guitarricadelafuente.com' },
]
const SECTIONS = ['top', 'tour', 'shop', 'videos', 'bio', 'community']
const pad = 'px-[clamp(1rem,3vw,2.5rem)]'
const expo = 'ease-[cubic-bezier(.76,0,.24,1)]'
const EASE = 'cubic-bezier(.76,0,.24,1)'

const FADE = 220 // px de scroll durante los que la barra pasa de transparente a blanco (más = más sutil)
const GLASS = 96 // px de scroll, tras salir el hero, durante los que pasa de blanco a glass

const clamp = (n: number) => Math.min(1, Math.max(0, n))
const smooth = (n: number) => n * n * (3 - 2 * n)

// Entrada (transform/opacity) lenta y seguimiento del scroll (colores) corto
const TRANSITION = [
  `transform 500ms ${EASE}`,
  `opacity 500ms ${EASE}`,
  'background-color 200ms ease-out',
  'border-color 200ms ease-out',
  'color 200ms ease-out',
  'backdrop-filter 200ms ease-out',
].join(', ')

const SCROLL_STYLE: CSSProperties = {
  backgroundColor: 'hsl(var(--background) / calc(var(--p, 0) * (1 - 0.2 * var(--q, 0))))',
  borderColor: 'hsl(var(--border) / var(--p, 0))',
  color: 'color-mix(in srgb, hsl(var(--foreground)) calc(var(--t, 0) * 100%), #fafaf9)',
  backdropFilter: 'blur(calc(var(--q, 0) * 12px))',
  WebkitBackdropFilter: 'blur(calc(var(--q, 0) * 12px))',
}

// Con el menú móvil abierto la barra se funde con el menú (fondo sólido, sin borde)
const OPEN_STYLE: CSSProperties = {
  backgroundColor: 'hsl(var(--background))',
  borderColor: 'transparent',
  color: 'hsl(var(--foreground))',
  backdropFilter: 'none',
  WebkitBackdropFilter: 'none',
}

export function Header({ ready }: { ready: boolean }) {
  const [shown, setShown] = useState(false) // entrada inicial, 500 ms después de que acabe el loader
  const [open, setOpen] = useState(false) // menú móvil
  const [active, setActive] = useState('')
  const bar = useRef<HTMLElement>(null)
  const btn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => setShown(true), 500)
    return () => clearTimeout(t)
  }, [ready])

  // Aspecto de la barra según dónde acaba el hero respecto a ella
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = bar.current
      const hero = document.getElementById('top')
      if (!el || !hero) return
      const end = hero.getBoundingClientRect().bottom // borde inferior del hero respecto a la ventana
      const land = el.offsetHeight - 1 // dónde queda ese borde al ir a #tour (scroll-padding-top)
      const raw = clamp((land + FADE - end) / FADE) // 0 lejos → 1 al llegar a la altura de #tour
      el.style.setProperty('--p', smooth(raw).toFixed(3)) // blanco: fondo y borde
      el.style.setProperty('--t', smooth(clamp((raw - 0.35) / 0.3)).toFixed(3)) // color del texto (tramo central)
      el.style.setProperty('--q', smooth(clamp(-end / GLASS)).toFixed(3)) // glass, solo cuando el hero ya salió
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Sección visible → entrada activa del menú
  useEffect(() => {
    const els = SECTIONS.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e)
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id === 'top' ? '' : e.target.id)),
      { rootMargin: '-45% 0px -54% 0px' }
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])

  // Menú móvil: bloquea el scroll, Esc cierra y se cierra solo al pasar a escritorio
  useEffect(() => {
    if (!open) return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const mq = matchMedia('(min-width: 1024px)')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); btn.current?.focus() }
    }
    const onMq = () => { if (mq.matches) setOpen(false) }
    window.addEventListener('keydown', onKey)
    mq.addEventListener('change', onMq)
    return () => {
      document.documentElement.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onMq)
    }
  }, [open])

  return (
    <>
      <header
        ref={bar}
        style={{ ...(open ? OPEN_STYLE : SCROLL_STYLE), transition: TRANSITION }}
        className={cn(
          'fixed inset-x-0 top-0 z-50 h-[var(--header-h)] border-b font-sans',
          shown ? 'translate-y-0' : '-translate-y-full opacity-0'
        )}
      >
        {/* Degradado superior para que el texto claro se lea sobre cualquier foto; se apaga al volverse blanca la barra */}
        <div
          aria-hidden="true"
          style={{ opacity: open ? 0 : 'calc(1 - var(--p, 0))' }}
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-stone-950/60 to-transparent transition-opacity duration-200"
        />
        <div className={cn('mx-auto flex h-full max-w-screen-2xl items-center justify-between gap-6', pad)}>
          {/* Nombre a la izquierda */}
          <a
            href="#top"
            onClick={() => setOpen(false)}
            aria-label="Guitarricadelafuente, ir al inicio"
            className="whitespace-nowrap text-[4.2vw] font-medium uppercase leading-none tracking-tight sm:text-xl lg:text-xl xl:text-2xl"
          >
            Guitarricadelafuente
          </a>

          {/* Entradas a la derecha (escritorio) */}
          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="group/nav flex items-center gap-x-6 xl:gap-x-9">
              {LINKS.map(({ label, href }) => (
                <li key={label} className="transition-opacity duration-300 group-hover/nav:opacity-40 hover:!opacity-100">
                  <a
                    href={href}
                    aria-current={active === href.slice(1) ? 'location' : undefined}
                    className="relative inline-flex items-center gap-1 py-2 text-xs font-medium uppercase tracking-widest after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 focus-visible:outline-none focus-visible:after:scale-x-100 aria-[current=location]:after:scale-x-100 xl:text-sm"
                  >
                    {label}
                    {href.startsWith('mailto:') && <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Botón de menú a la derecha (móvil / tablet) */}
          <button
            ref={btn}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            className="-mr-2 inline-flex h-10 items-center gap-2 px-2 text-xs font-medium uppercase tracking-widest lg:hidden"
          >
            <span className="hidden sm:inline">{open ? 'close' : 'menu'}</span>
            {open ? <X className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" /> : <Menu className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />}
          </button>
        </div>
      </header>

      {/* Menú móvil a pantalla completa */}
      <div
        id="menu-movil"
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-40 flex flex-col justify-center bg-background pt-[var(--header-h)] font-sans text-foreground transition-[opacity,visibility] duration-300 lg:hidden',
          pad,
          open ? 'visible opacity-100' : 'invisible opacity-0'
        )}
      >
        <ul>
          {LINKS.map(({ label, href }, i) => (
            <li key={label} className="overflow-hidden border-b border-border first:border-t">
              <a
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-baseline justify-between py-4 text-5xl font-medium uppercase tracking-tight transition-transform duration-700',
                  expo,
                  open ? 'translate-y-0' : 'translate-y-full'
                )}
                style={{ transitionDelay: open ? `${120 + i * 50}ms` : '0ms' }}
              >
                <span className="inline-flex items-center gap-2">
                  {label}
                  {href.startsWith('mailto:') && <ArrowUpRight className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />}
                </span>
                <span className="text-xs font-medium tabular-nums tracking-widest text-muted-foreground">0{i + 1}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}