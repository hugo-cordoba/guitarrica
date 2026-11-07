import { HERO } from '@/components/Loader'
import { CommunityForm } from '@/components/CommunityForm'
import { Header } from '@/components/Header'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

const pad = 'px-[clamp(1rem,3vw,2.5rem)]'
const expo = 'ease-[cubic-bezier(.76,0,.24,1)]'

const Slot = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn('grid min-h-56 place-items-center rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground', className)}>{children}</div>
)

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} className={cn('border-t border-border py-[clamp(4rem,10vw,8rem)]', pad)}>
    <h2 className="mb-8 text-4xl font-medium leading-none tracking-tight md:text-6xl">{title}</h2>
    {children}
  </section>
)

export function Site({ ready }: { ready: boolean }) {
  return (
    <>
      <Header ready={ready} />

      <main>
        <section id="top" className={cn('relative flex h-svh min-h-[32rem] items-end overflow-hidden pb-[clamp(1rem,3vw,2.5rem)]', pad)}>
          <img src={HERO} alt="Guitarricadelafuente" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
          <div className={cn('absolute inset-0 bg-gradient-to-t from-stone-950/60 to-transparent to-55% transition-opacity duration-1000', ready ? 'opacity-100' : 'opacity-0')} />
          <h1 className="relative z-10 text-stone-50 text-[clamp(2.5rem,9vw,9rem)] font-medium leading-[.95] tracking-tighter">
            {['spanish leather', 'tour 2026'].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[.08em]">
                <i className={cn('block not-italic transition-transform duration-[1100ms]', expo, ready ? 'translate-y-0' : 'translate-y-[110%]')} style={{ transitionDelay: `${i * 120}ms` }}>{line}</i>
              </span>
            ))}
          </h1>
        </section>

        <Section id="shop" title="shop">
          {/* TODO: integrar la tienda */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => <Slot key={n} className="aspect-[4/5]">producto</Slot>)}
          </div>
        </Section>
        <Section id="tour" title="tour"><Slot>Widget de fechas (Bandsintown, Songkick…)</Slot></Section>
        <Section id="videos" title="video"><Slot className="aspect-video">Embed de YouTube</Slot></Section>
        <Section id="bio" title="bio"><Slot>Texto de biografía</Slot></Section>
        <Section id="community" title="community"><CommunityForm /></Section>
      </main>

      <ThemeToggle visible={ready} />

      <footer className={cn('border-t border-border py-8 text-xs text-muted-foreground', pad)}>
        ©2025 Guitarricadelafuente, Todos los Derechos Reservados | Photography by Wolfgang Tillmans
      </footer>
    </>
  )
}