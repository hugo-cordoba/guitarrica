import { cn } from '@/lib/utils'

/* Sección de tour: fecha · ciudad · sala, solo texto, sin líneas y muy compacto.
   - Desde xl: 3 bloques de 3 columnas (9 en total) que se leen de arriba abajo y de izquierda a derecha.
   - Por debajo de xl: una sola lista centrada (3 columnas; en móvil, fecha + ciudad con la sala debajo).
   - Rejilla con subgrid: las columnas se alinean entre filas y cada bloque se ajusta a su contenido,
     así el conjunto queda centrado de verdad. */

type Show = [date: string, city: string, venue: string]

// ➜ Fechas en formato dd.mm.aa
const SHOWS: Show[] = [
  ['25.02.26', 'New York', 'Bowery Ballroom'],
  ['27.02.26', 'New York', 'Bowery Ballroom'],
  ['28.02.26', 'Washington', 'The Atlantis'],
  ['03.03.26', 'Chicago', 'Lincoln Hall'],
  ['06.03.26', 'Los Angeles', 'The Roxy'],
  ['07.03.26', 'San Francisco', 'The Independent'],
  ['10.03.26', 'Buenos Aires', 'Niceto'],
  ['13.03.26', 'Buenos Aires', 'Lollapaloza Argentina'],
  ['14.03.26', 'Santiago de Chile', 'Lollapaloza Chile'],
  ['19.03.26', 'Sao Paulo', 'Fabrique'],
  ['21.03.26', 'Bogotá', 'Estereo Picnic'],
  ['25.03.26', 'Lima', 'C.C. Legia'],
  ['27.03.26', 'Monterrey', 'Tecate Palnorte'],
  ['03.04.26', 'Benicassim', 'SanSan'],
  ['10.04.26', 'Milan', 'Fabrique'],
  ['11.04.26', 'Berlin', 'Metropol'],
  ['01.05.26', 'Murcia', 'Warm Up'],
  ['03.06.26', 'Barcelona', 'Primavera Sound'],
  ['20.06.26', 'Santiago de Compostela', 'O son do camiño'],
  ['03.07.26', 'Vilanova i la Geltrú', 'Vida Festival'],
  ['07.07.26', 'Montreux', 'Montreux Jazz Festival'],
  ['11.07.26', 'Málaga', 'Plaza de toros de Málaga'],
  ['31.07.26', 'Santander', 'Santander Music'],
  ['09.08.26', 'Chiclana de la F.', 'Concert Music Festival'],
  ['05.09.26', 'Zaragoza', 'Vive Latino'],
  ['17.09.26', 'Mallorca', 'Son Fusteret'],
  ['19.09.26', 'Barcelona', 'Festival B'],
  ['02.10.26', 'Madrid', 'Movistar Arena'],
]

const pad = 'px-[clamp(1rem,3vw,2.5rem)]'
const LIST = 'grid grid-cols-[auto_1fr] gap-x-5 sm:grid-cols-[auto_auto_auto]'

// '25.02.26' → '2026-02-25' (para <time dateTime>)
const iso = (d: string) => {
  const [dd, mm, yy] = d.split('.')
  return `20${yy}-${mm}-${dd}`
}

// Reparte las fechas en n bloques equilibrados (con 28 fechas y 3 bloques: 10 · 9 · 9)
const split = (items: Show[], n: number) => {
  const base = Math.floor(items.length / n)
  const extra = items.length % n
  let from = 0
  return Array.from({ length: n }, (_, k) => {
    const to = from + base + (k < extra ? 1 : 0)
    const part = items.slice(from, to)
    from = to
    return part
  })
}

const BLOCKS = split(SHOWS, 3)

function Row({ show: [date, city, venue] }: { show: Show }) {
  return (
    <li className="col-span-2 grid grid-cols-subgrid items-baseline py-1.5 sm:col-span-3 sm:py-0.5">
      <time dateTime={iso(date)} className="tabular-nums">{date}</time>
      <span className="font-medium">{city}</span>
      <span className="col-start-2 text-muted-foreground sm:col-start-3">{venue}</span>
    </li>
  )
}

export function Tour() {
  return (
    <section id="tour" className={cn('border-t border-border py-[clamp(5rem,10vw,8rem)]', pad)}>
      <div className="text-sm leading-5 xl:text-[13px] 2xl:text-sm">
        {/* < xl: una sola lista */}
        <ul className={cn(LIST, 'mx-auto w-full sm:w-fit xl:hidden')}>
          {SHOWS.map((show) => <Row key={`${show[0]}-${show[1]}`} show={show} />)}
        </ul>

        {/* ≥ xl: 3 bloques de 3 columnas */}
        <div className="mx-auto hidden w-fit grid-cols-[auto_auto_auto] items-start gap-x-[clamp(2.5rem,4vw,4rem)] xl:grid">
          {BLOCKS.map((rows, i) => (
            <ul key={i} className={LIST}>
              {rows.map((show) => <Row key={`${show[0]}-${show[1]}`} show={show} />)}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}