# guitarricadelafuente-web (Next.js + Tailwind + shadcn/ui)

```bash
npx create-next-app@latest guitarrica-web --typescript --tailwind --app --src-dir --eslint
cd guitarrica-web
npx shadcn@latest init
npx shadcn@latest add button badge select sheet dialog popover command checkbox input label separator sonner
npm i react-hook-form zod @hookform/resolvers
# copia aquí la carpeta src/ de este zip (sobrescribe layout.tsx y page.tsx)
npm run dev
```
Pendiente: datos reales en `src/data/site.ts`, fotos de producto, endpoint del formulario (`community-form.tsx`), foto con licencia en `/public`.
