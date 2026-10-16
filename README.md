# Dr. Luifer V2

Sistema del consultorio dental construido con React, TypeScript, Vite y Firebase Realtime Database.

## Stack moderno

- React 19 + TypeScript estricto
- Vite 7 con separación de chunks por dominio
- Tailwind CSS 4 mediante el plugin oficial para Vite
- Lucide React para iconografía SVG accesible y tree-shakable
- React Hook Form + Zod para formularios tipados y validados
- Day.js centralizado en `src/lib/dayjs.ts`, con zona clínica `America/Asuncion`
- Firebase modular con suscripciones Realtime Database conservadas
- Inter Variable autoalojada, sin dependencia de Google Fonts durante la carga

La migración visual es progresiva: `src/tailwind.css` contiene el nuevo sistema de diseño y
`src/styles.css` conserva temporalmente los componentes existentes y las reglas de impresión.

## Desarrollo local

```bash
pnpm install
pnpm dev
```

## Verificación

```bash
pnpm typecheck
pnpm check
```

## Variables de entorno

Crea un `.env.local` usando como base `.env.example`.

Variables requeridas:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_READ_ONLY`

La rama V2 usa `VITE_FIREBASE_READ_ONLY=true` como defensa adicional. Además, el código V2
fuerza el modo de solo lectura incluso si una variable de Netlify intenta desactivarlo: mantiene
las lecturas y suscripciones en tiempo real, pero bloquea `set()` y `remove()` para proteger
pacientes y datos de producción mientras se trabaja en la nueva interfaz. Habilitar escrituras
requiere un cambio deliberado de código y su correspondiente revisión.

## Build

```bash
pnpm build
```

## Deploy en Netlify

1. Conecta este repositorio de GitHub en Netlify.
2. Producción utiliza `main`; la V2 utiliza el Branch Deploy `version-v2-minimalista`.
3. Netlify ya leerá `netlify.toml`.
4. Carga en Netlify las mismas variables de entorno listadas arriba.
5. Cada `push` a `version-v2-minimalista` actualiza únicamente el enlace de la V2.
