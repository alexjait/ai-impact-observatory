# Backend

Backend del MVP construido sobre NestJS + Prisma + PostgreSQL.

## Estado actual
- bootstrap tecnico del backend completado
- auth web basada en sesion propia con soporte para identidad local y Google
- registro local con verificacion obligatoria de email antes del primer login
- emails transaccionales via Resend para verificacion, bienvenida y recuperacion de contrasena
- preservacion de `locale` (`en` / `es`) en emails y links de auth
- validacion server-side de Cloudflare Turnstile en register, login, forgot password y reset password
- taxonomias base y catalogo publico
- endpoints publicos de actividades, evidencias, metodologia y taxonomias
- endpoint admin para importacion controlada del seed oficial
- reset reutilizable del dominio seedable para recargar el CSV final sin tocar usuarios, roles o sesiones
- propuestas de actividades y evidencias operativas
- detalle privado de propuestas por `id` para habilitar edicion desde frontend
- comentarios, respuestas simples y denuncias operativas
- propuestas en `needs_correction` reeditables por usuario con reenvio a `pending`
- configuracion publica para ocultar o mostrar comentarios y denuncias desde backoffice
- traduccion automatica de propuestas de evidencia desde el idioma cargado por el usuario
- CRUD estructural de actividades y evidencias desde backoffice, con alta, edicion, publicacion y archivado
- endpoints de auth social preparados para Google:
  - `GET /api/v1/auth/providers`
  - `GET /api/v1/auth/google/start`
  - `GET /api/v1/auth/google/callback`
  - `POST /api/v1/auth/social/complete-signup`
- Prisma Client generado
- build TypeScript y Nest verificado en esta sesion
- migracion SQL inicial generada en `backend/prisma/migrations/0001_init/migration.sql`

## Notas operativas de seguridad
- existe throttling global via `@nestjs/throttler`
  - perfil `default`: 60 requests por minuto por IP
  - perfil `auth`: 10 requests por minuto por IP
- el perfil `auth` hoy se aplica a todos los endpoints de autenticacion y tambien al `POST /api/v1/contact/messages`
- el formulario de contacto ahora exige Turnstile ademas del rate limiting server-side
- la IP remota ahora se resuelve via `request.ip`
  - si el backend corre detras de un proxy confiable, habilitar `TRUST_PROXY=true`
  - en local el valor por defecto sigue siendo `false`
- `helmet` ya queda con una CSP explicita y restrictiva para la superficie API

## Pendiente para correr localmente con base activa
1. usar la `.env` local o copiar `.env.example` a `.env`
2. verificar que PostgreSQL este disponible en `localhost:5433`
3. crear la base si no existe con `npm run db:ensure`
4. aplicar migraciones con `npm run db:setup` o `npm run prisma:migrate:deploy`
5. completar configuracion Google si se quiere validar login social (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `APP_BASE_URL`, `API_BASE_URL`)
6. levantar la API con `npm run start:dev`
7. recargar el seed final con `npm run seed:reload` si se quiere limpiar e importar de nuevo
   - por defecto usa `../docs/seed_portal_impacto_ia_bilingue_tres_evidencias_corregido.csv`
8. ejecutar smoke tests de auth local, auth Google, catalogo publico e importacion de seed

## Estado actual de Google OAuth en local
- configuracion local ya validada con `google.enabled=true`
- redirect inicial validado hacia Google con callback `http://localhost:3001/api/v1/auth/google/callback`
- primer login real validado con onboarding en `/auth/social/complete`
- alta social completada y retorno exitoso a `/me?locale=en`
- persistencia de sesion verificada en navegacion posterior

## Nota sobre pruebas de Google
- el flujo real de Google OAuth fue validado manualmente con cuentas de prueba
- no forma parte del smoke automatizado para evitar depender de credenciales humanas e interaccion externa

## Smoke tests utiles
- auth local: `npm run smoke:auth:local`
  - cubre register, login, forgot password, reset real con harness local, invalidacion de sesion y guard de cuentas solo-sociales
- catalogo publico: `npm run smoke:public`
  - cubre metodologia, taxonomias bilingues, filtros, busqueda y ocultamiento de contenido pendiente
- seed admin: `npm run smoke:admin:seed`
  - cubre auth requerida, restriccion de rol admin, reset + corrida del import oficial y persistencia editorial `approved`
- editorial: `npm run smoke:editorial`
  - cubre cola editorial, filtros, aprobacion masiva con guardrails, actualizacion de resumen, cambio de estado oficial, aprobacion de actividad del seed y moderacion de comentario reportado
- CRUD de catalogo en backoffice:
  - `GET /api/v1/editorial/catalog/references`
  - `GET /api/v1/editorial/catalog/activities`
  - `GET /api/v1/editorial/catalog/activities/:id`
  - `POST /api/v1/editorial/catalog/activities`
  - `PATCH /api/v1/editorial/catalog/activities/:id`
  - `POST /api/v1/editorial/catalog/activities/:id/status`
  - `GET /api/v1/editorial/catalog/evidence`
  - `GET /api/v1/editorial/catalog/evidence/:id`
  - `POST /api/v1/editorial/catalog/evidence`
  - `PATCH /api/v1/editorial/catalog/evidence/:id`
  - `POST /api/v1/editorial/catalog/evidence/:id/status`
- contribucion y comentarios: `npm run smoke:contributions`
  - genera reporte JSON en `output/testing/`
  - valida tambien que la cola de moderacion encuentre comentarios reportados por actividad asociada y exponga contexto legible del target
  - valida tambien reenvio a `pending` despues de corregir propuestas y traduccion automatica de evidencia
- contribucion y comentarios no felices: `npm run smoke:contributions:negative`
  - cubre auth requerida, propuesta ajena, taxonomia invalida, reply invalido, self-report y comentario vacio

## Base local elegida
- nombre sugerido: `ai_impact_observatory_dev`
- credenciales esperadas por defecto: `postgres / postgres`
- base administrativa para crearla si no existe: `postgres`

## Comandos utiles de seed final
- limpiar solo el dominio seedable: `npm run seed:reset`
- importar el CSV final sin limpiar antes: `npm run seed:import`
- limpiar e importar el CSV final en una sola pasada: `npm run seed:reload`

El reset seedable elimina:
- actividades, evidencias, taxonomias y sus traducciones/relaciones
- propuestas, comentarios, reportes y acciones de moderacion/editorial asociadas
- historial de corridas del seed

Y preserva:
- usuarios
- roles
- sesiones
- identidades de auth
- configuracion publica del portal

## Nota
En esta sesion ya se instalaron dependencias, se genero Prisma Client, se aplicaron migraciones locales, se implemento el refactor de identidad local + Google, el paquete de contribucion con propuestas, comentarios y denuncias, y una primera superficie real de moderacion/editorial para operar el seed desde API. Tambien existe ya una accion masiva de estado editorial con guardrails para `approved`, y la cola de comentarios moderables ahora puede buscar por actividad/evidencia asociada y devolver contexto legible del target. Ya hubo smoke tests reales contra PostgreSQL local. Google OAuth con credenciales reales tambien quedo validado manualmente en local. Ademas, el frontend publico ahora puede ocultar comentarios y denuncias mediante configuracion de backoffice, y las propuestas de evidencia aceptan carga en un solo idioma con traduccion automatica al segundo locale para revision posterior. El backoffice ahora tambien expone CRUD estructural para actividades y evidencias materializadas del catalogo, con relaciones, slugs, taxonomias y archivado sin borrado duro. Lo que sigue pendiente es profundizar el testing automatizado especifico de ese CRUD y seguir puliendo ergonomia operativa.
