# Enterprise Auth — Authentication as a Service

Sistema de Autenticación Empresarial construido con **NestJS**, **TypeScript** y **PostgreSQL**,
siguiendo **Clean Architecture / DDD** y estándares de producción. El objetivo no es un simple "login",
sino un servicio de autenticación reutilizable, modular y seguro (a escala reducida como Auth0, Keycloak o AWS Cognito) que cualquier aplicación pueda integrar vía API.

---

## 🚀 Estado del Proyecto

El desarrollo avanza por fases. Cada fase debe compilar, pasar sus tests y quedar documentada antes de iniciar la siguiente.

- [x] **Fase 1 — Base del proyecto** ✅
- [x] **Fase 2 — Arquitectura (Clean Architecture / DDD)** ✅
- [x] **Fase 3 — Dominio de Usuarios** ✅
- [x] **Fase 4 — Autenticación (JWT + Refresh Tokens)** ✅
- [ ] **Fase 5 — Roles y Permisos (RBAC)**
- [ ] **Fase 6 — Seguridad (Helmet, Rate Limiting, OWASP API Top 10)**
- [ ] **Fase 7 — OAuth2 (Google, GitHub)**
- [ ] **Fase 8 — Auditoría**
- [x] **Fase 9 — Testing (Unitario, Integración y E2E con 100% de éxito)** ✅
- [ ] **Fase 10 — DevOps (CI/CD con GitHub Actions & Docker)**

---

## 🛠️ Lo implementado hasta el momento

### 🔹 Fase 1 & 2: Base y Arquitectura Clean/DDD
- **Bloques Base de Dominio**: `Entity`, `AggregateRoot`, `ValueObject`, `UniqueEntityId`, `DomainEvent` y jerarquía de `DomainException`.
- **Capa de Aplicación**: Manejo de resultados con `Result<T, E>` y contrato `UseCase`.
- **Regla de Dependencias Estricta**: `Presentation → Application → Domain`, con `Infrastructure` implementando las interfaces definidas en `Domain`. Reglas forzadas por **ESLint**.
- **Alias de Rutas**: Configurados `@shared/*`, `@modules/*`, `@config/*` tanto para desarrollo (`ts-node`) como compilación (`tsc-alias`) y pruebas (`Jest`).

### 🔹 Fase 3 & 4: Dominio de Usuarios y Autenticación JWT
- **Entidades y Objetos de Valor**: `User`, `RefreshToken`, `Email`, `Password` (con hashing seguro mediante `bcrypt`).
- **Casos de Uso de Autenticación**:
  - `RegisterUserUseCase`: Registro de nuevos usuarios con cifrado de contraseña.
  - `LoginUseCase`: Autenticación con verificación de credenciales y generación de Access/Refresh Token.
  - `RefreshTokenUseCase`: Rotación de tokens e invalidación.
  - `LogoutUseCase`: Revocación segura de tokens activos.
- **Mapeadores y Persistencia**: Mapeadores para desacoplar las entidades de dominio de los modelos ORM/Base de Datos.
- **Documentación OpenAPI / Swagger**: Endpoints documentados con esquemas interactivos (`/docs` o `/api/docs`).

### 🔹 Fase 9: Testing & Calidad de Código
- **Suite de Pruebas Unitarias**: **13/13 Test Suites pasando** (43+ tests unitarios) cubriendo Entidades, Value Objects, Casos de Uso y Servicios.
- **Pruebas End-to-End (E2E)**: **2/2 Test Suites pasando** (7 tests de integración HTTP) validando el flujo completo de controladores de autenticación y salud.

---

## 📋 Requisitos

- **Node.js**: 20+
- **npm**: 10+
- **Docker & Docker Compose** (Recomendado)

---

## ⚡ Cómo Ejecutar

### Opción A — Con Docker Compose (Recomendado)

```bash
# 1. Copiar el archivo de variables de entorno
cp .env.example .env

# 2. Configurar contraseñas y secrets en .env (mínimo 32 caracteres para JWT)
# 3. Levantar los contenedores
docker compose up --build

La API quedará disponible en http://localhost:3000/api/v1

La documentación Swagger en http://localhost:3000/docs
Opción B — Entorno Local
Bash

# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno (.env)
cp .env.example .env

# 3. Iniciar en modo desarrollo
npm run start:dev

🧪 Testing
Bash

# Ejecutar tests unitarios
npm run test

# Ejecutar tests unitarios con reporte de cobertura
npm run test:cov

# Ejecutar tests End-to-End (E2E)
npm run test:e2e

🧹 Calidad de Código
Bash

# Ejecutar linter con corrección automática
npm run lint

# Formatear código con Prettier
npm run format

Husky y lint-staged garantizan que ningún archivo sea commiteado sin pasar el linter y formateador.
📁 Estructura del Proyecto

enterprise-auth/
├── src/
│   ├── config/              # Variables de entorno tipadas y validadas con Joi
│   ├── modules/
│   │   ├── health/          # Módulo de Health Check
│   │   └── users/           # Módulo de Usuarios y Autenticación
│   │       ├── application/     # Casos de uso (Login, Register, Refresh, Logout) y DTOs
│   │       ├── domain/          # Entidades (User, RefreshToken), VOs e Interfaces
│   │       ├── infrastructure/  # Mapeadores, Repositorios y Hashers
│   │       └── presentation/    # Controladores REST HTTP y DTOs
│   ├── shared/
│   │   ├── application/     # Result<T,E>, interfaz UseCase
│   │   ├── domain/          # Entity, AggregateRoot, ValueObject, DomainEvents
│   │   ├── filters/         # Filtro global de excepciones HTTP
│   │   └── logger/          # Logging estructurado JSON (Pino)
│   ├── app.module.ts
│   └── main.ts
├── test/                    # Pruebas E2E (auth.e2e-spec.ts, health.e2e-spec.ts)
├── docs/                    # Diagramas y documentación de arquitectura
├── Dockerfile
├── docker-compose.yml
└── README.md

🛠️ Stack Tecnológico

Node.js 20+ · TypeScript · NestJS · PostgreSQL · JWT · Passport · bcrypt · Docker · Swagger / OpenAPI · Jest · Supertest · ESLint · Prettier · Husky
📜 Licencia

MIT — TECHNS Soluciones Informáticas
