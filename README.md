# AI Impact Observatory

Portal para explorar el impacto de la inteligencia artificial en actividades y evidencias, con contribuciones de usuarios y herramientas editoriales. Incluye `frontend-web` (Next.js), `backend` (NestJS), PostgreSQL y Prisma.

## Preparacion

1. Instalar Docker con Compose y Node.js con npm; iniciar Docker.
2. Copiar `.env.docker.example` a `.env.docker`, `backend/.env.example` a `backend/.env` y `frontend-web/.env.example` a `frontend-web/.env.local`. El Compose de desarrollo requiere los tres archivos.
3. Ajustar las variables locales. El backend de desarrollo carga `backend/.env` y el frontend carga `frontend-web/.env.local`; configurá allí las credenciales y claves correspondientes. No subas estos archivos a Git.

El stack queda agrupado en Docker Desktop bajo `aiio-observatory` salvo que cambies `COMPOSE_PROJECT_NAME`.

## Comandos principales

```bash
npm run infra:build
npm run infra:up
npm run infra:logs
npm run infra:down
```

Esto levanta en desarrollo containerizado:

- frontend: `http://localhost:3000`
- backend: `http://localhost:3001/api/v1`
- postgres: `localhost:5433`

## Seed inicial

Si queres poblar la base nueva con el dataset del proyecto:

```bash
docker compose --env-file .env.docker -f docker-compose.yml -f docker-compose.dev.yml exec backend npm run seed:reload
```

El compose monta `./docs` dentro del contenedor backend como `/docs`, y el seed usa ese path interno.

## Verificacion de email

- El registro local requiere verificación de email antes del primer login.
- Configurá `RESEND_API_KEY` y `RESEND_FROM_EMAIL` en `.env.docker` o `.env.production`.
- En desarrollo, el `from` recomendado es `onboarding@resend.dev`.
- Los emails de verificacion, bienvenida y recuperacion se envian en el mismo idioma (`en` / `es`) con el que el usuario inicio el flujo.
- Los links incluidos en esos emails preservan ese mismo `locale`.

## Recuperacion de contrasena

- `password/forgot` envia el email de recuperacion cuando la cuenta existe, sin exponer esa informacion en pantalla.
- `/auth/reset-password` toma el token desde la URL y le pide al usuario solo la nueva contrasena y su confirmacion.
- Registro y reset comparten la misma politica de contrasena segura: minimo 8 caracteres, con mayuscula, minuscula y numero.

## Captcha

- El backend valida Cloudflare Turnstile server-side en `register`, `login`, `password/forgot` y `password/reset`.
- Configurá `NEXT_PUBLIC_TURNSTILE_SITE_KEY` para el frontend.
- ConfigurÃ¡ `TURNSTILE_SECRET_KEY` en `.env.docker`, `.env.production` o `backend/.env`.
- La secret queda solo en backend; no debe exponerse al frontend.

Sin las claves de Turnstile y Resend, las funciones que dependen de esos servicios no estarán disponibles. Google OAuth requiere además sus propias credenciales.

## Produccion / VPS

1. Copiar `.env.production.example` a `.env.production`.
2. Completar dominio, credenciales y flags segun el entorno.
3. Ejecutar:

```bash
npm run infra:prod:build
npm run infra:prod:up
```

Logs y apagado:

```bash
npm run infra:prod:logs
npm run infra:prod:down
```

## Notas operativas

- El backend espera a PostgreSQL y ejecuta `prisma migrate deploy` antes de iniciar.
- PostgreSQL persiste en el volumen Docker `postgres_data`.
- En Docker, el frontend usa:
  - `NEXT_PUBLIC_API_BASE_URL` para el navegador
  - `API_INTERNAL_BASE_URL` para SSR dentro de la red Docker
- El flujo local existente fuera de Docker sigue disponible con los `.env` propios de `backend` y `frontend-web`.

## Calidad

GitHub Actions comprueba la compilación de ambos componentes, el lint del frontend y las vulnerabilidades de dependencias de severidad alta o superior. Dependabot revisa semanalmente las dependencias npm y mensualmente las acciones; las actualizaciones mayores se planifican manualmente.

Los scripts `smoke:*` requieren servicios y datos de prueba activos, por lo que se ejecutan por separado del CI.

## Licencia

Distribuido bajo la licencia [MIT](LICENSE).
