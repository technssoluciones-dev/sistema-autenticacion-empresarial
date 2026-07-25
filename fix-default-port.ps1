# Fix: puerto default 5433 en .env.example y docker-compose.yml
# (evita choque con Postgres nativo en el puerto 5432)

@'
# Aplicación
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*
LOG_LEVEL=debug

# Base de datos (PostgreSQL)
DB_HOST=localhost
# 5433, no 5432: evita choques con una instalación nativa de Postgres en
# Windows/Mac que ya esté escuchando en el puerto default (síntoma típico:
# "password authentication failed" aunque el password en este .env sea correcto,
# porque en realidad te conectaste al Postgres nativo, no al del docker-compose).
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=enterprise_auth
DB_SYNC=false
DB_LOGGING=false

# JWT (usado desde la Fase 4)
JWT_ACCESS_SECRET=change-this-to-a-random-secret-of-at-least-32-chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=change-this-to-a-different-random-secret-32-chars
JWT_REFRESH_EXPIRATION=7d

# Seguridad (usado desde la Fase 6)
THROTTLE_TTL=60
THROTTLE_LIMIT=100

'@ | Out-File -Encoding utf8 ".env.example"
$c = Get-Content -Raw ".env.example"
[System.IO.File]::WriteAllText("$PWD\.env.example", $c, (New-Object System.Text.UTF8Encoding($false)))

@'
services:
  api:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
    container_name: enterprise-auth-api
    restart: unless-stopped
    ports:
      - '${PORT:-3000}:3000'
    env_file:
      - .env
    environment:
      DB_HOST: postgres
    volumes:
      - ./src:/usr/src/app/src
      - ./test:/usr/src/app/test
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - enterprise-auth-net

  postgres:
    image: postgres:16-alpine
    container_name: enterprise-auth-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USERNAME:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-enterprise_auth}
    ports:
      - '${DB_PORT:-5433}:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USERNAME:-postgres}']
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - enterprise-auth-net

volumes:
  postgres_data:

networks:
  enterprise-auth-net:
    driver: bridge

'@ | Out-File -Encoding utf8 "docker-compose.yml"
$c = Get-Content -Raw "docker-compose.yml"
[System.IO.File]::WriteAllText("$PWD\docker-compose.yml", $c, (New-Object System.Text.UTF8Encoding($false)))
