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
- [x] **Fase 4 — Autenticación (JWT + Refresh Tokens)** ✅[cite: 1]
- [ ] **Fase 5 — Roles y Permisos (RBAC)**[cite: 1]
- [ ] **Fase 6 — Seguridad (Helmet, Rate Limiting, OWASP API Top 10)**[cite: 1]
- [ ] **Fase 7 — OAuth2 (Google, GitHub)**[cite: 1]
- [ ] **Fase 8 — Auditoría**[cite: 1]
- [x] **Fase 9 — Testing (Unitario, Integración y E2E con 100% de éxito)** ✅[cite: 1]
- [ ] **Fase 10 — DevOps (CI/CD con GitHub Actions & Docker)**[cite: 1]

---

## 🛠️ Lo implementado hasta el momento

### 🔹 Fase 1 & 2: Base y Arquitectura Clean/DDD
- **Bloques Base de Dominio**: `Entity`, `AggregateRoot`, `ValueObject`, `UniqueEntityId`, `DomainEvent` y jerarquía de `DomainException`[cite: 1].
- **Capa de Aplicación**: Manejo de resultados con `Result<T, E>` y contrato `UseCase`[cite: 1].
- **Regla de Dependencias Estricta**: `Presentation → Application → Domain`, con `Infrastructure` implementando las interfaces definidas en `Domain`[cite: 1]. Reglas forzadas por **ESLint**[cite: 1].
- **Alias de Rutas**: Configurados `@shared/*`, `@modules/*`, `@config/*` tanto para desarrollo (`ts-node`) como compilación (`tsc-alias`) y pruebas (`Jest`)[cite: 1].

### 🔹 Fase 3 & 4: Dominio de Usuarios y Autenticación JWT
- **Entidades y Objetos de Valor**: `User`, `RefreshToken`, `Email`, `Password` (con hashing seguro mediante `bcrypt`)[cite: 1].
- **Casos de Uso de Autenticación**:
  - `RegisterUserUseCase`: Registro de nuevos usuarios con cifrado de contraseña[cite: 1].
  - `LoginUseCase`: Autenticación con verificación de credenciales y generación de Access/Refresh Token[cite: 1].
  - `RefreshTokenUseCase`: Rotación de tokens e invalidación[cite: 1].
  - `LogoutUseCase`: Revocación segura de tokens activos[cite: 1].
- **Mapeadores y Persistencia**: Mapeadores para desacoplar las entidades de dominio de los modelos ORM/Base de Datos[cite: 1].
- **Documentación OpenAPI / Swagger**: Endpoints documentados con esquemas interactivos (`/docs` o `/api/docs`)[cite: 1].

### 🔹 Fase 9: Testing & Calidad de Código
- **Suite de Pruebas Unitarias**: **13/13 Test Suites pasando** (43+ tests unitarios) cubriendo Entidades, Value Objects, Casos de Uso y Servicios[cite: 1].
- **Pruebas End-to-End (E2E)**: **2/2 Test Suites pasando** (7 tests de integración HTTP) validando el flujo completo de controladores de autenticación y salud[cite: 1].

---

## 📋 Requisitos

- **Node.js**: 20+[cite: 1]
- **npm**: 10+[cite: 1]
- **Docker & Docker Compose** (Recomendado)[cite: 1]

---

## ⚡ Cómo Ejecutar

### Opción A — Con Docker Compose (Recomendado)

```bash
# 1. Copiar el archivo de variables de entorno
cp .env.example .env

# 2. Configurar contraseñas y secrets en .env (mínimo 32 caracteres para JWT)
# 3. Levantar los contenedores
docker compose up --build