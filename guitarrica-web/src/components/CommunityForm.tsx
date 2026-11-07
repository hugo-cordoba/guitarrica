import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Lista abreviada: copiar la completa de la web original si hace falta
const COUNTRIES = ['Spain', 'Argentina', 'Chile', 'Colombia', 'France', 'Germany', 'Italy', 'Mexico', 'Portugal', 'United Kingdom', 'United States']

const Field = ({ label, id, className = '', ...p }: { label: string; id: string; className?: string } & React.ComponentProps<'input'>) => (
  <div className={`grid gap-2 ${className}`}>
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} name={id} {...p} />
  </div>
)

export function CommunityForm() {
  return (
    // TODO: conectar con el backend de suscripciones
    <form className="grid max-w-3xl gap-x-6 gap-y-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
      <Field label="Email" id="email" type="email" required autoComplete="email" className="sm:col-span-2" />
      <Field label="Nombre" id="nombre" autoComplete="given-name" />
      <Field label="Apellidos" id="apellidos" autoComplete="family-name" />
      <Field label="Fecha de nacimiento *" id="nacimiento" type="date" required />
      <Field label="Código Postal" id="cp" autoComplete="postal-code" />
      <div className="grid gap-2">
        <Label htmlFor="pais">País *</Label>
        <select id="pais" name="pais" required defaultValue=""
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <option value="" disabled>Selecciona tu país / región</option>
          {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <Field label="Móvil" id="movil" type="tel" autoComplete="tel" />
      <div className="flex items-start gap-3 sm:col-span-2">
        <Checkbox id="privacidad" required className="mt-0.5" />
        <Label htmlFor="privacidad" className="text-xs font-normal leading-relaxed">
          He leído y acepto la{' '}
          <a className="underline" href="https://www.sonymusic.es/politica-de-privacidad-y-cookies/" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>{' '}
          y, en consecuencia, deseo recibir información sobre <b>Guitarricadelafuente</b> a través de correo electrónico, SMS, Whatsapp u otros medios electrónicos.
        </Label>
      </div>
      <div className="flex items-start gap-3 sm:col-span-2">
        <Checkbox id="comercial" className="mt-0.5" />
        <Label htmlFor="comercial" className="text-xs font-normal leading-relaxed">
          Quiero recibir información comercial, concursos, material promocional de SONY MUSIC ENTERTAINMENT ESPAÑA, S.L. y sus artistas a través de correo electrónico, SMS, Whatsapp u otros medios electrónicos.
        </Label>
      </div>
      <Button type="submit" size="lg" className="justify-self-start">SUSCRÍBETE</Button>
    </form>
  )
}
