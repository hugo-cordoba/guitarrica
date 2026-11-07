# guitarrica-web

Réplica de guitarricadelafuente.com con loader previo al hero. Vite + React + TypeScript + Tailwind + shadcn/ui.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

- Más componentes: `npx shadcn@latest add dialog sheet …` (ya hay `components.json`).
- Loader: `src/components/Loader.tsx` → `IMAGES` (tus fotos en `/public`), `DUR`, `EXPAND`, `CENTER_TILES`, velocidades en `COLS`.
- La última tile usa `HERO` (misma imagen que el hero) para una transición continua. Respeta `prefers-reduced-motion`.
- Pendiente: descargar las imágenes remotas a `/public`, widgets de shop/tour/vídeo, `onSubmit` del formulario, lista completa de países y menú móvil.
