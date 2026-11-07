import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/* Header estilo web de artista (sin logo, solo menú):
   - Sobre el hero: transparente, texto claro y un degradado sutil arriba para asegurar el contraste.
   - Al salir del hero: barra sólida con blur y borde fino; se oculta al bajar y reaparece al subir.
   - Escritorio: entradas centradas en mayúsculas con tracking ancho, subrayado animado y atenuación
     de las demás al pasar el ratón; la sección visible queda subrayada.
   - Móvil: botón "menu" → menú a pantalla completa con titulares grandes (Esc cierra, bloquea el scroll). */
const LINKS = [
  { label: 'shop', href: '#shop' },
  { label: 'tour', href: '#tour' },
  { label: 'video', href: '#videos' },
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
  const [hidden, setHidden] = useState(false) // bajando → se oculta
  const [open, setOpen] = useState(false) // menú móvil
  const [active, setActive] = useState('')
  const btn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => setShown(true), 500)
    return () => clearTimeout(t)
  }, [ready])

  // Estado según el scroll: sólido tras el hero; se oculta al bajar y reaparece al subir
  useEffect(() => {
    let last = window.scrollY
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.scrollY
      const hero = (document.getElementById('top')?.offsetHeight ?? window.innerHeight) - BAR
      setSolid(y > hero)
      if (y <= hero) { setHidden(false); last = y }
      else if (Math.abs(y - last) > 4) { setHidden(y > last); last = y }
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
    const mq = matchMedia('(min-width: 768px)')
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
          'fixed inset-x-0 top-0 z-50 border-b transition-[transform,opacity,background-color,border-color,color] duration-500',
          expo,
          !shown ? '-translate-y-full opacity-0' : hidden && !open ? '-translate-y-full' : 'translate-y-0',
          bar ? 'border-border bg-background/80 text-foreground backdrop-blur-md' : 'border-transparent',
          !bar && (open ? 'text-foreground' : 'text-stone-50')
        )}
      >
        {/* Degradado superior para que el texto claro se lea sobre cualquier foto */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-stone-950/40 to-transparent transition-opacity duration-500',
            bar || open ? 'opacity-0' : 'opacity-100'
          )}
        />
        <div className={cn('mx-auto flex h-16 max-w-screen-2xl items-center justify-end md:justify-center', pad)}>
          <nav aria-label="Principal" className="hidden md:block">
            <ul className="group/nav flex items-center gap-x-10 lg:gap-x-14">
              {LINKS.map(({ label, href }) => (
                <li key={label} className="transition-opacity duration-300 group-hover/nav:opacity-40 hover:!opacity-100">
                  <a
                    href={href}
                    aria-current={active === href.slice(1) ? 'location' : undefined}
                    className="relative inline-flex items-center gap-1 py-2 text-xs font-medium uppercase tracking-widest after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 focus-visible:outline-none focus-visible:after:scale-x-100 aria-[current=location]:after:scale-x-100"
                  >
                    {label}
                    {href.startsWith('mailto:') && <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button
            ref={btn}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="menu-movil"
            className="-mr-2 inline-flex h-10 items-center gap-2 px-2 text-xs font-medium uppercase tracking-widest md:hidden"
          >
            <span>{open ? 'close' : 'menu'}</span>
            {open ? <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" /> : <Menu className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />}
          </button>
        </div>
      </header>

      {/* Menú móvil a pantalla completa */}
      <div
        id="menu-movil"
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-40 flex flex-col justify-center bg-background pt-16 text-foreground transition-[opacity,visibility] duration-300 md:hidden',
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
                  'flex items-baseline justify-between py-4 font-display text-5xl font-semibold tracking-tight transition-transform duration-700',
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