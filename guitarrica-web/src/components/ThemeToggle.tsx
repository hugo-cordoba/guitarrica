import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* Widget flotante: claro por defecto; la elección se guarda en localStorage
   (index.html la aplica antes del primer pintado para evitar parpadeos). */
export function ThemeToggle({ visible }: { visible: boolean }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch { /* sin almacenamiento */ }
  }
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
      className={cn(
        'fixed bottom-5 right-5 z-50 rounded-full bg-background/80 backdrop-blur transition-opacity delay-500 duration-700',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
