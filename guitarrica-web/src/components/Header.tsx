import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/* Header estilo web de artista:
   - Siempre fijo: nunca se oculta al hacer scroll.
   - Nombre a la izquierda (mayúsculas) y entradas del menú alineadas a la derecha.
   - Misma tipografía que el resto de la web (Inter, font-sans).
   - Sobre el hero: transparente, texto claro y degradado sutil arriba para el contraste.
   - Al salir del hero: barra sólida con blur y borde fino; la sección visible queda subrayada.
   - < lg: botón de menú a la derecha → menú a pantalla completa (Esc cierra, bloquea el scroll). */
const LINKS = [
  { label: 'shop', href: '#shop' },
  { label: 'TOUR', href: '#tour' },
  { label: 'CANCIONES', href: '#videos' },
  { label: 'bio', href: '#bio' },
  { label: 'community', href: '#community' },
  { label: 'booking', href: 'mailto:info@guitarricadelafuente.com' },
]
const SECTIONS = ['top', 'shop', 'tour', 'videos', 'bio', 'community']
const BAR = 64 // h-16
const pad = 'px-[clamp(1rem,3vw,2.5rem)]'
const expo = 'ease-[cubic-bezier(.76,0,.24,1)]'

export function Header({ ready }: { ready: boolean }) {
  const [shown, setShown] = useState(false) // entrada inicial, 500 ms después de que acabe el loader
  const [solid, setSolid] = useState(false) // fuera del hero → barra sólida
  const [open, setOpen] = useState(false) // menú móvil
  const [active, setActive] = useState('')
  const btn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => setShown(true), 500)
    return () => clearTimeout(t)
  }, [ready])

  // Barra sólida una vez superado el hero
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const hero = (document.getElementById('top')?.offsetHeight ?? window.innerHeight) - BAR
      setSolid(window.scrollY > hero)
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

  const bar = solid && !open

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b font-sans transition-[transform,opacity,background-color,border-color,color] duration-500',
          expo,
          shown ? 'translate-y-0' : '-translate-y-full opacity-0',
          bar ? 'border-border bg-background/80 text-foreground backdrop-blur-md' : 'border-transparent',
          !bar && (open ? 'text-foreground' : 'text-stone-50')
        )}
      >
        {/* Degradado superior para que el texto claro se lea sobre cualquier foto */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-stone-950/60 to-transparent transition-opacity duration-500',
            bar || open ? 'opacity-0' : 'opacity-100'
          )}
        />
        <div className={cn('mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-6', pad)}>
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
          'fixed inset-0 z-40 flex flex-col justify-center bg-background pt-16 font-sans text-foreground transition-[opacity,visibility] duration-300 lg:hidden',
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