# Flora Unilibre — API en Next.js

API REST del catálogo de flora (familias, especies, plantas y placas) migrada
desde NestJS a **Next.js 16 (App Router) + Route Handlers**.

Conserva las rutas, los códigos HTTP, el envelope de paginación y los mensajes
de error del backend anterior, por lo que los clientes existentes no necesitan
cambios.

## Stack

| Pieza | Tecnología |
| --- | --- |
| Framework | Next.js 16.4 (Route Handlers, runtime Node.js) |
| Lenguaje | TypeScript 6 |
| Base de datos | PostgreSQL (Supabase) |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Validación | Zod 4 |
| Supabase | `@supabase/supabase-js` |
| Tests | Vitest 5 |

## Puesta en marcha

```bash
pnpm install
cp .env.example .env   # completa las credenciales
pnpm db:generate       # genera el cliente Prisma en src/generated/prisma
pnpm dev
```

La app queda en `http://localhost:3000`.

## Variables de entorno

| Variable | Requerida | Uso |
| --- | --- | --- |
| `SUPABASE_URL` | sí | Endpoint REST del proyecto |
| `SUPABASE_ANON_KEY` | sí | Cliente anónimo, sujeto a Row Level Security |
| `SUPABASE_SERVICE_ROLE_KEY` | no | Cliente admin; omite RLS, solo en servidor |
| `DATABASE_URL` | sí | Conexión pooled de Postgres (puerto `6543`), usada por la app |
| `DIRECT_URL` | no | Conexión directa (puerto `5432`), usada por migraciones |
| `PORT` | no | Puerto de `next start` (por defecto `3000`) |

Next carga `.env` automáticamente. El entorno se valida con Zod en la primera
petición (`src/lib/env.ts`), de modo que `next build` no requiere credenciales
reales.

## Endpoints

La lista completa, las reglas de validación, los datos de prueba y los comandos
`curl` están en [`docs/endpoints.md`](docs/endpoints.md).

| Método | Ruta | Notas |
| --- | --- | --- |
| `GET` | `/` | `Hello World!` (compatibilidad con la app Nest) |
| `GET` | `/health` | `200 {status:"ok",supabase:"up"}` o `503 {status:"degraded",supabase:"down"}` |
| `GET` | `/familias?q=&limit=&offset=` | `q` busca en `nombre` |
| `GET` | `/familias/:id` | |
| `POST` | `/familias` | `201` |
| `PATCH` | `/familias/:id` | |
| `DELETE` | `/familias/:id` | `204`; `409` mientras tenga especies |
| `GET` | `/especies?familiaId=&q=&limit=&offset=` | incluye `familia` |
| `GET` | `/especies/:id` | incluye `familia` |
| `POST` | `/especies` | `201` |
| `PATCH` | `/especies/:id` | |
| `DELETE` | `/especies/:id` | `204` |
| `GET` | `/plantas?especieId=&q=&limit=&offset=` | incluye `especie` + `familia` |
| `GET` | `/plantas/:id` | incluye `especie` + `familia` |
| `POST` | `/plantas` | `201` |
| `PATCH` | `/plantas/:id` | |
| `DELETE` | `/plantas/:id` | `204` |
| `GET` | `/flora?plantaId=&estado=&limit=&offset=` | ordenado por número de placa |
| `GET` | `/flora/:id` | incluye `planta` + `especie` + `familia` |
| `POST` | `/flora` | `201`; `id` es el número de placa |
| `PATCH` | `/flora/:id` | `id` es inmutable |
| `DELETE` | `/flora/:id` | `204` |

Los listados devuelven `{ data, total, limit, offset }`; `limit` va de 1 a 100
(por defecto 20). Los cuerpos y query params desconocidos se rechazan con `400`.
Los errores de Prisma se traducen a `409` (P2002/P2003), `404` (P2025) y `400`
(P2011/P2014). Las rutas inexistentes devuelven JSON con el mismo formato que
Nest.

Ejemplo:

```bash
curl -X POST localhost:3000/flora \
  -H 'content-type: application/json' \
  -d '{"id":50,"plantaId":1,"latitud":4.60971,"longitud":-74.08175,"estado":"vivo"}'
```

## Estructura

```
src/
├── app/                     # Route Handlers (una carpeta por recurso)
│   ├── familias/route.ts
│   ├── familias/[id]/route.ts
│   └── ...
├── lib/
│   ├── env.ts               # validación del entorno (Zod)
│   ├── errors.ts            # ApiError + mapeo de errores Prisma
│   ├── http.ts              # json(), noContent(), parseJson/parseQuery/parseId
│   ├── pagination.ts        # limit/offset + PageDto
│   ├── prisma.ts            # singleton de Prisma (cacheado en globalThis)
│   └── supabase.ts          # clientes anon/admin + health check
└── modules/
    ├── familia/             # repository → service → schemas
    ├── especie/
    ├── planta/
    └── flora/
```

Cada módulo mantiene la separación del backend Nest: el **repository** concentra
las consultas Prisma, el **service** las reglas y los 404, y los **schemas** Zod
validan la entrada. Los servicios se exponen como singletons (`getFamiliaService`,
etc.) desde el `index.ts` de cada módulo.

## Prisma y Supabase

```bash
pnpm db:migrate     # crear/aplicar migraciones en desarrollo
pnpm db:deploy      # aplicar migraciones pendientes (CI/producción)
pnpm db:push        # sincronizar el esquema sin migración
pnpm db:studio      # explorar la base
pnpm db:generate    # regenerar el cliente
```

- El esquema está en `prisma/schema.prisma`; las migraciones en `prisma/migrations`.
- El cliente se genera en `src/generated/prisma` (ignorado por git) con imports
  sin extensión, para que el bundler de Next lo resuelva.
- `DATABASE_URL` debe ser la conexión **pooled** (`6543`): cada instancia
  serverless mantiene su propio pool.
- Prisma conecta como dueño de la base y **omite Row Level Security**. Usa
  `getSupabaseClient()` para consultas sujetas a RLS y `getSupabaseAdmin()` solo
  para trabajo de servidor confiable.

## Tests

```bash
pnpm test          # suite unitaria (servicios, schemas, errores, route handlers)
pnpm test:watch
pnpm test:cov
```

## Despliegue en Vercel

1. Importa el proyecto en Vercel (detecta pnpm y Next automáticamente).
2. Configura `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `DATABASE_URL` en
   **Settings → Environment Variables**; `SUPABASE_SERVICE_ROLE_KEY` es opcional.
3. Despliega. `vercel.json` fija la región `iad1` (cámbiala junto con la del
   proyecto Supabase si es necesario).
4. Aplica migraciones desde tu máquina o CI con `pnpm db:deploy`.

## Diferencias con la versión NestJS

- Los controllers y la inyección de dependencias de Nest se sustituyen por
  Route Handlers y singletons por módulo.
- `class-validator` + `ValidationPipe` se sustituyen por Zod; se conservan los
  límites, la obligatoriedad y el rechazo de campos desconocidos.
- `PrismaExceptionFilter` se sustituye por `apiErrorResponse()`.
- `@nestjs/observe` no se migra (es específico de Nest): la app ya no reporta
  trazas a NestJS Observe.
- No hay autenticación ni CORS, igual que en la versión anterior. Añade un guard
  o middleware antes de exponer la API fuera de tu red.
