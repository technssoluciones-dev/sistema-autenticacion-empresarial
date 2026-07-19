# Enterprise Auth — Authentication as a Service

Sistema de Autenticación Empresarial construido con **NestJS**, **TypeScript** y **PostgreSQL**,
siguiendo **Clean Architecture** y estándares de producción. El objetivo no es un simple "login",
sino un servicio de autenticación reutilizable, similar en concepto (a escala reducida) a Auth0,
Keycloak o AWS Cognito, que cualquier aplicación pueda integrar vía API.

## Estado del proyecto

El desarrollo avanza por fases. Cada fase debe compilar, pasar sus tests y quedar documentada
antes de iniciar la siguiente.

- [x] **Fase 1 — Base del proyecto** ✅ (esta entrega)
- [ ] Fase 2 — Arquitectura (Clean Architecture: domain / application / infrastructure / presentation)
- [ ] Fase 3 — Dominio de Usuarios
- [ ] Fase 4 — Autenticación (JWT + Refresh Tokens)
- [ ] Fase 5 — Roles y Permisos (RBAC)
- [ ] Fase 6 — Seguridad (Helmet, rate limiting, OWASP API Top 10)
- [ ] Fase 7 — OAuth2 (Google, GitHub)
- [ ] Fase 8 — Auditoría
- [ ] Fase 9 — Testing (unit, integración, e2e, cobertura > 80%)
- [ ] Fase 10 — DevOps (CI/CD con GitHub Actions)

## Qué incluye la Fase 1

- Proyecto NestJS + TypeScript en modo `strict`.
- ESLint + Prettier + Husky + lint-staged (calidad de código forzada en cada commit).
- Variables de entorno tipadas y validadas con Joi (`src/config`), la app **no arranca** si
  falta una variable requerida o el `JWT_SECRET` es demasiado corto.
- `ConfigModule` global con configuraciones por namespace (`app`, `database`, `jwt`).
- Logger estructurado en JSON con `nestjs-pino` (listo para CloudWatch / ELK / Datadog), con
  `requestId` trazable por petición.
- Documentación OpenAPI/Swagger automática en `/docs`.
- Endpoints de salud (`/api/v1/health`, `/api/v1/health/liveness`) con `@nestjs/terminus`,
  pensados para probes de Docker/Kubernetes/ALB.
- Helmet, CORS configurable y `ValidationPipe` global (whitelist + transform).
- Filtro global de excepciones: toda respuesta de error sigue el mismo contrato JSON.
- Docker + Docker Compose (API + PostgreSQL) para desarrollo local.
- Estructura de carpetas preparada para Clean Architecture (se puebla en la Fase 2).

## Requisitos

- Node.js 20+
- npm 10+
- Docker y Docker Compose (opcional, pero recomendado)

## Cómo ejecutar

### Opción A — Con Docker Compose (recomendado)

```bash
cp .env.example .env
# Editar .env y completar JWT_ACCESS_SECRET / JWT_REFRESH_SECRET (mínimo 32 caracteres)

docker compose up --build
```

La API quedará disponible en `http://localhost:3000/api/v1`
y la documentación Swagger en `http://localhost:3000/docs`.

### Opción B — Local (sin Docker)

Requiere una instancia de PostgreSQL accesible.

```bash
npm install
cp .env.example .env
# Completar las variables de entorno

npm run start:dev
```

## Testing

```bash
npm run test          # unit tests
npm run test:cov      # unit tests con reporte de cobertura
npm run test:e2e       # tests end-to-end (se amplían a partir de la Fase 9)
```

## Calidad de código

```bash
npm run lint      # ESLint con autofix
npm run format    # Prettier
```

Husky ejecuta `lint-staged` automáticamente en cada commit (`.ts` se lintean y formatean antes
de ser aceptados).

## Estructura del proyecto

```
enterprise-auth/
├── src/
│   ├── config/          # Variables de entorno tipadas y validadas (Joi)
│   ├── modules/
│   │   └── health/      # Health checks (liveness / readiness)
│   ├── shared/
│   │   ├── logger/      # Logging estructurado (Pino)
│   │   └── filters/      # Filtro global de excepciones
│   ├── common/          # (Fase 2) utilidades transversales
│   ├── app.module.ts
│   └── main.ts
├── test/                # Tests e2e (Fase 9)
├── docker/
│   └── Dockerfile.dev
├── .github/workflows/   # CI/CD (Fase 10)
├── Dockerfile
├── docker-compose.yml
└── README.md
```

> A partir de la Fase 2, `src/` se reorganiza en capas de Clean Architecture:
> `domain/`, `application/`, `infrastructure/` y `presentation/` por módulo de negocio
> (`auth`, `users`, `roles`, `permissions`, `audit`).

## Stack tecnológico

Node.js 20+ · TypeScript · NestJS · PostgreSQL · JWT · Passport · bcrypt · Docker · Swagger ·
Jest · Supertest · ESLint · Prettier · Husky

## Licencia

MIT — TECHNS Soluciones Informáticas
