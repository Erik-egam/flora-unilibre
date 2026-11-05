<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Supabase

The app talks to Supabase through `SupabaseService` (`src/supabase/supabase.service.ts`), registered globally by `SupabaseModule`. It reads its configuration from the environment, validated at boot by `src/config/env.validation.ts`.

1. Create an account and a project at [supabase.com](https://supabase.com) (or run the stack locally with `pnpm supabase:start`).
2. Copy the template and fill in the values from **Project Settings → API**:

   ```bash
   $ cp .env.example .env
   ```

   | Variable | Required | Purpose |
   | --- | --- | --- |
   | `SUPABASE_URL` | yes | Project REST endpoint |
   | `SUPABASE_ANON_KEY` | yes | Anon client; every query goes through Row Level Security |
   | `SUPABASE_SERVICE_ROLE_KEY` | no | Admin client; bypasses RLS, server-side only |

3. Check the connection: `GET /health` returns `{ "status": "ok", "supabase": "up" }`, or `503` when the project is unreachable.

Use it from any provider or controller:

```ts
constructor(private readonly supabase: SupabaseService) {}

const { data, error } = await this.supabase.client.from('plants').select();
await this.supabase.admin.auth.admin.listUsers(); // requires the service role key
```

The clients are created with `persistSession`, `autoRefreshToken` and `detectSessionInUrl` disabled, because this is a backend and has no browser session to keep. Queries made with `client` are bound to the anon role, so enable Row Level Security and write policies per table; reach for `admin` only for trusted server-side work.

To get typed queries, generate the database types with `pnpm exec supabase gen types typescript --project-id <project-ref> > src/supabase/database.types.ts` and use `SupabaseClient<Database>` in `SupabaseService`.

## Prisma

Schema and migrations live in `prisma/`, the CLI is configured by `prisma.config.ts`, and the client is exposed through `PrismaService` (`src/prisma/prisma.service.ts`), registered globally by `PrismaModule`. Prisma 7 talks to PostgreSQL through the `@prisma/adapter-pg` driver adapter.

Add the two connections to `.env` (see `.env.example`):

| Variable | Used by | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | the app | Pooled connection (port `6543`), one pool shared by all requests |
| `DIRECT_URL` | the CLI | Direct connection (port `5432`), used for migrations and introspection |

Both come from **Supabase → Database → Connection string**. With `pnpm supabase:start` they are `postgresql://postgres:postgres@127.0.0.1:54322/postgres`.

```bash
$ pnpm db:migrate     # create/apply a migration while developing
$ pnpm db:deploy      # apply pending migrations (CI/production)
$ pnpm db:push        # sync the schema without a migration (prototyping)
$ pnpm db:studio      # browse the database
$ pnpm db:generate    # regenerate the client after editing the schema
```

`prisma generate` also runs on `pnpm install`, and the generated client is written to `src/generated/prisma` (git-ignored). The service opens the connection lazily on the first query, so booting the app or running tests does not require a reachable database.

Use it from any provider by injecting `PrismaService`:

```ts
constructor(private readonly prisma: PrismaService) {}

const plants = await this.prisma.plant.findMany();
```

Because Prisma connects with the database user, it **bypasses Supabase Row Level Security**. Keep per-user authorization in your queries (or use the `SupabaseService` client, which is RLS-aware) and never expose `PrismaService` to untrusted input without filtering.

> `prisma migrate dev` needs to create a shadow database. On a hosted Supabase project that may fail; run migrations against the local stack or a development branch, and apply them with `pnpm db:deploy` elsewhere.

## API

The CRUD is modular and layered: each feature under `src/<feature>/` is a Nest module split into `controller` (HTTP only) → `service` (rules, 404s) → `repository` (every Prisma query). `PrismaModule` and `SupabaseModule` are global, so feature modules only inject `PrismaService`.

| Method | Route | Notes |
| --- | --- | --- |
| `GET` | `/familias?q=&limit=&offset=` | `q` searches `nombre` |
| `GET` | `/familias/:id` | |
| `POST` | `/familias` | `201` |
| `PATCH` | `/familias/:id` | |
| `DELETE` | `/familias/:id` | `204`; `409` while it has especies |
| `GET` | `/especies?familiaId=&q=&limit=&offset=` | includes `familia` |
| `GET` | `/especies/:id` | includes `familia` |
| `POST` `PATCH` `DELETE` | `/especies` … | |
| `GET` | `/plantas?especieId=&q=&limit=&offset=` | includes `especie` + `familia` |
| `GET` | `/plantas/:id` | includes `especie` + `familia` |
| `POST` `PATCH` `DELETE` | `/plantas` … | |
| `GET` | `/flora?plantaId=&estado=&limit=&offset=` | ordered by plate number |
| `GET` | `/flora/:id` | includes `planta` + `especie` + `familia` |
| `POST` `PATCH` `DELETE` | `/flora` … | `id` is the plate number; immutable |

Lists return `{ data, total, limit, offset }`; `limit` is capped at 100 (default 20). Bodies are validated with `class-validator` by a global `ValidationPipe` (`whitelist` + `forbidNonWhitelisted`), so unknown fields are rejected with `400`. Prisma's constraint errors are mapped by `PrismaExceptionFilter`: `409` for duplicated unique values or FK violations, `404` for missing rows.

```bash
curl -X POST localhost:3000/flora \
  -H 'content-type: application/json' \
  -d '{"id":50,"plantaId":1,"latitud":4.60971,"longitud":-74.08175,"estado":"vivo"}'
```

Flora coordinates are stored as `decimal(9,6)` but returned as JSON numbers, and `estado` defaults to `vivo` in the database when omitted.

> There is no authentication on these routes yet, and Prisma bypasses Row Level Security: anyone who can reach the API can write. Add a guard (Supabase JWT) before exposing it outside your network.

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

### Vercel

Vercel runs the API as a single serverless function instead of a container:

- `api/index.mjs` is the entrypoint. It boots the Nest app once per lambda instance, then reuses the Express instance for every request.
- `vercel.json` sets `buildCommand: pnpm build` (the function imports the compiled `dist/` output) and rewrites every route to `/api/index`.
- `.vercelignore` keeps `.env` and local artifacts out of the upload.

1. Import the repository in Vercel. It picks pnpm from `pnpm-lock.yaml`.
2. In **Project → Settings → Environment Variables**, add `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `DATABASE_URL` (the pooled connection, port `6543`). `SUPABASE_SERVICE_ROLE_KEY` is optional. `DIRECT_URL` is only needed if you run migrations from CI.
3. Deploy. Locally, `pnpm start:dev` keeps using `src/main.ts`; `api/index.mjs` is only used by Vercel.

Notes:

- Apply migrations from your machine or CI with `pnpm db:deploy`. The function has no Prisma CLI and never uses `DIRECT_URL`.
- `regions: ["iad1"]` in `vercel.json` matches the Supabase project (`us-east-1`). Change both together.
- Each lambda instance keeps its own `pg` pool against the Supabase pooler, which is why `DATABASE_URL` must be the pooled URL (port `6543`, `pgbouncer=true`).
- Cold starts initialize Nest + Prisma on the first request after idle. `GET /health` probes the Supabase REST API, so it can return `503` even when Postgres queries work.

## Observability

In production applications, observability is essential for understanding how your system behaves, detecting issues early, and maintaining reliable performance.

[NestJS Observe](https://observe.nestjs.com) automatically instruments your NestJS application, giving you deep visibility into your system with minimal setup:

- **Distributed tracing:** Follow requests across services and understand how they flow through your system.
- **Waterfall analysis:** Visualize request execution and identify slow operations, bottlenecks, and unexpected delays.
- **Performance analysis:** Analyze application performance in real time and quickly pinpoint areas that need optimization.
- **Metrics:** Track key application and infrastructure metrics to understand system health and performance trends.
- **Logging:** Centralize and correlate logs with traces and other telemetry to make debugging easier.
- **Error tracking:** Detect errors quickly and investigate their root causes with the surrounding context.
- **SLA monitoring:** Track service-level objectives and identify when your application is approaching or exceeding defined thresholds.
- **Alarms and alerts:** Set up alerts for critical errors, performance degradation, SLA violations, and other anomalies so your team can react quickly.

This project is already instrumented. To connect it, run this and approve the code it prints at [observe.nestjs.com/link](https://observe.nestjs.com/link) - signing up for free if you have no account:

```bash
$ npx @nestjs/observe link
```

It writes the app key and secret into `.env` and makes every `nest start` script (`start`, `start:dev`, `start:debug`) load it. In production, set `OBSERVE_APP_KEY` and `OBSERVE_APP_SECRET` in the environment instead.

Or do it by hand: create an application and an API key at [observe.nestjs.com](https://observe.nestjs.com), and set the pair as `OBSERVE_APP_KEY` and `OBSERVE_APP_SECRET` in the environment the app runs in.

The free plan needs no payment details and covers 300,000 events a month. You can also browse the [live demo](https://www.observe-demo.nestjs.com/dashboard) first - the whole dashboard over a busy service's data, with nothing to install.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Auto-instrument your application with [NestJS Observe](https://observe.nestjs.com). Distributed tracing, metrics, and logging made easy. Error tracking and performance monitoring for your NestJS applications.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
