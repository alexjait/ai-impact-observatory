# Arquitectura MVP

## Resumen
La solucion propuesta para el MVP es una arquitectura web de tres capas sobre la preferencia tecnica confirmada:
- `frontend web`: Next.js
- `backend API`: NestJS
- `persistencia`: PostgreSQL con Prisma

La arquitectura se implementa como sistema desacoplado por responsabilidades, pero operado como despliegue compacto en una sola VPS con Docker Compose para el MVP. El objetivo es minimizar complejidad operativa sin sacrificar separacion de capas, SEO, trazabilidad, permisos ni capacidad de evolucion.

## Vista General
- Un `frontend` Next.js entrega el sitio publico, el area autenticada del usuario y el backoffice web.
- Un `backend` NestJS expone la API de negocio, administra autenticacion, permisos, moderacion, editorial, auditoria e integraciones.
- PostgreSQL almacena datos operativos, sesiones, trazabilidad y seed data importada.
- Resend envia emails transaccionales de producto.
- Hostinger Email se usa para correo humano u operativo fuera del flujo de aplicacion.
- Un reverse proxy de borde publica `web` y `api` bajo el mismo dominio y gestiona TLS.

## Decisiones Clave

## 1. Frontend y backend separados
Se mantiene Next.js separado de NestJS en lugar de concentrar toda la logica en el frontend.

Rationale:
- protege mejor la logica editorial, permisos y auditoria
- facilita evolucion futura hacia integraciones o API publica
- reduce acoplamiento entre UI y reglas de negocio

Tradeoff:
- suma una frontera de integracion adicional entre frontend y backend

## 2. Monolito modular
El backend se implementa como `modular monolith` en NestJS, no como microservicios.

Rationale:
- el dominio todavia esta en etapa de validacion
- el MVP necesita velocidad, consistencia y despliegue simple
- permite separar modulos sin pagar costo operativo de microservicios

Tradeoff:
- requiere disciplina de limites de modulo para evitar crecimiento desordenado

## 3. PostgreSQL como motor principal
Se adopta PostgreSQL como base unica para datos operativos, busqueda MVP, sesiones y auditoria.

Rationale:
- cubre bien relaciones complejas, trazabilidad y contenido multiidioma
- permite search MVP con `pg_trgm` y full text search sin sumar infraestructura extra
- simplifica backup, restore y operacion en VPS

Tradeoff:
- la busqueda no sera tan sofisticada como con un motor dedicado

## 4. Busqueda MVP sobre Postgres
No se incorpora Elasticsearch, Meilisearch ni OpenSearch en esta etapa.

Rationale:
- el seed actual tiene 550 filas y el catalogo inicial es manejable
- conviene resolver primero con indices trigram y FTS
- evita agregar una dependencia operativa prematura

Tradeoff:
- si el catalogo y el trafico crecen fuerte, habra que desacoplar search luego

## 5. Auth propia con sesion web first
Se recomienda auth propia orientada a web con sesiones persistidas en DB y cookies seguras HTTP-only.

Rationale:
- el producto actual es web-only
- las cookies seguras son mas adecuadas para un portal editorial con backoffice
- deja abierta una futura externalizacion o adicion de JWT para otros clientes

Tradeoff:
- la futura apertura de API para terceros requerira un modelo adicional o adaptado de tokens

Decision irreversible:
- para el MVP, la experiencia autenticada web debe apoyarse en sesion segura de primer partido

## 6. Rutas publicas con locale desde el dia 1
Aunque el locale path era recomendacion y no requisito duro, se recomienda adoptar `/en/...` y `/es/...` para contenido publico desde el inicio.

Rationale:
- baja friccion tecnica en Next.js
- mejora claridad para SEO y hreflang
- evita migraciones de URL mas costosas mas adelante

Tradeoff:
- agrega algo de complejidad en routing y metadata

Flexible:
- el backoffice puede permanecer fuera del esquema de locale path si la UX lo simplifica

## 7. Seed importado por pipeline controlado
El CSV no se debe cargar de forma manual directa a tablas finales.

Rationale:
- el archivo es bilingue por fila
- todas las filas tienen `estado_ia_inicial` vacio
- se necesita validacion, normalizacion y trazabilidad de importacion

Tradeoff:
- agrega trabajo inicial de importacion

## Topologia De Despliegue

## Entornos
- `local`: Docker Compose para desarrollo integrado
- `staging`: opcional pero recomendado para validar olas internas
- `production`: VPS Hostinger con Docker Compose

## Contenedores Minimos
- `web`: Next.js en modo standalone
- `api`: NestJS
- `db`: PostgreSQL
- `proxy`: Nginx o Caddy

## Componentes Externos
- Resend
- DNS y TLS del proveedor de hosting o proxy

## Componentes Diferidos
- cola dedicada como Redis/BullMQ
- cache distribuido
- motor de busqueda dedicado
- SSO externo

## Limites De Modulo

## Frontend Web
- `public-site`: home, metodologia, search, listados, detalle de actividad, detalle de evidencia
- `account`: login, registro, recuperacion, perfil, propuestas del usuario
- `contribution`: formularios de actividades y evidencias, comentarios, denuncias
- `backoffice`: moderacion, editorial, taxonomias, usuarios
- `i18n-seo`: locale routing, metadata, hreflang, canonical, fallback

## Backend API
- `auth`
- `users-and-roles`
- `activities`
- `activity-translations`
- `industries-and-categories`
- `evidence`
- `comments-and-reports`
- `moderation`
- `editorial`
- `audit-and-history`
- `search`
- `seed-import`
- `notifications`

Regla:
- ningun modulo debe leer o escribir tablas de otro modulo sin pasar por servicio de dominio o contrato explicito

## Modelo De Integracion

## Protocolo
- API REST JSON versionada bajo `/api/v1`

## Patron Cliente
- Next.js consume API por HTTP server-to-server en server components, actions o route handlers cuando convenga
- el cliente browser consume directamente solo donde la UX lo requiera

## Autenticacion
- cookie segura HTTP-only
- CSRF token para operaciones mutables si frontend y backend comparten dominio de primer partido
- rotacion y revocacion de sesiones desde DB

## Uploads
No se identifico una necesidad cerrada de media upload compleja para el MVP. Mantener este punto diferido hasta que UX o editorial lo vuelvan imprescindible.

## Modelo De Datos De Alto Nivel

## Entidades Principales
- `users`
- `roles`
- `user_role_assignments`
- `sessions`
- `activities`
- `activity_translations`
- `industries`
- `industry_translations`
- `functional_categories`
- `functional_category_translations`
- `activity_industries`
- `activity_categories`
- `evidence`
- `evidence_translations`
- `evidence_activities`
- `comments`
- `comment_reports`
- `moderation_actions`
- `editorial_activity_status_history`
- `audit_log`
- `seed_import_runs`
- `seed_import_items`

## Decisiones De Modelado
- `activities` y `evidence` son entidades base no duplicadas por idioma
- el texto visible por locale vive en tablas de traduccion
- comentarios no se traducen automaticamente
- el estado oficial de actividad vive en la entidad base y su historial en tabla historica
- las acciones de moderacion se registran como eventos, no solo como estado final

## Estados Recomendados
- `activities.editorial_status`: `pending`, `approved`, `rejected`, `needs_correction`, `archived`
- `evidence.editorial_status`: `pending`, `approved`, `rejected`, `needs_correction`, `archived`
- `comments.visibility_status`: `visible`, `hidden`, `archived`
- `comments.report_status`: `clean`, `reported`, `under_review`, `resolved`

## Seed Data
Hallazgos del CSV:
- 550 filas
- 25 sectores
- granularidades presentes: `funcion`, `tarea`, `rol`
- `estado_ia_inicial` vacio en todas las filas
- `idioma_referencia = bilingual_row`

Consecuencia arquitectonica:
- cada fila debe transformarse en una actividad base + traduccion `es` + traduccion `en`
- la importacion inicial no debe publicar automaticamente actividades sin resolver estado oficial y resumen editorial
- el pipeline debe soportar importacion a `draft editorial` o asignacion controlada de valores por defecto si negocio lo aprueba despues

## Estrategia De Seed Import

## Flujo
1. cargar CSV en memoria o staging
2. validar columnas requeridas
3. normalizar slugs y claves
4. upsert de industrias y sus traducciones
5. upsert de actividades base
6. upsert de activity translations `es` y `en`
7. registrar import run e items con errores o warnings
8. dejar actividades en estado no publico hasta completar metadatos editoriales faltantes

## Reglas
- el import debe ser idempotente por `activity_key`
- no debe borrar manualmente contenido editorial existente
- debe producir reporte de filas rechazadas o ambiguas

## Contratos De API
Los contratos detallados se documentan en [contratos_mvp_portal_impacto_ia.md](contratos_mvp_portal_impacto_ia.md).

## Seguridad
- sesiones en cookie segura HTTP-only, `SameSite=Lax` o mas estricto
- hash de password con algoritmo de password hashing moderno
- rate limiting en login, registro, comentarios, propuestas y denuncias
- control de permisos por rol en backend, nunca solo en frontend
- sanitizacion de texto enriquecido o markdown si se habilita
- auditoria obligatoria para acciones de moderacion, editorial y administracion

## Performance
- Next.js debe priorizar render server-side o static revalidation para paginas publicas SEO
- API publica y listados deben paginar siempre
- Postgres debe tener indices por slug, estado, locale, sector y busqueda trigram
- cache HTTP o revalidation para detalle publico y listados editoriales

## Observabilidad
- logs JSON estructurados en `web` y `api`
- request id o correlation id por request
- health endpoints separados para `web`, `api` y `db`
- auditoria funcional persistida en DB
- dashboard operativo minimo en logs del VPS o agregador futuro

## Riesgos y Tradeoffs
- `auth propia`: da control y coherencia con el backoffice, pero eleva responsabilidad de seguridad
- `search en Postgres`: excelente para MVP, pero con limite a mediano plazo
- `single VPS`: buena para costo y velocidad inicial, pero con tolerancia limitada a fallos
- `seed incompleto editorialmente`: obliga a pipeline que diferencie importacion de publicacion
- `frontend + backend separados`: mejora limites, pero suma coordinacion y contratos

## Referencias Tecnicas Requeridas
- Next.js App Router, i18n routing, metadata API, standalone deploy
- NestJS modules, guards, interceptors, validation, exception filters
- Prisma schema design, migrations, indexing y relation modeling
- PostgreSQL `pg_trgm`, full text search, constraints, transactional upserts
- Resend API
- Docker Compose, reverse proxy y backup de PostgreSQL

## Handoff Para Backend
- implementar como monolito modular NestJS
- arrancar por auth, roles, activities, evidence, comments, moderation, editorial, audit y seed-import
- priorizar migraciones y constraints antes que endpoints secundarios
- diseñar importador de seed como comando o job controlado, no como script ad hoc sin trazabilidad

## Handoff Para Frontend Web
- estructurar app en zonas `public`, `account` y `admin`
- asumir locale public path desde inicio
- consumir API versionada y no acceder a DB directamente
- preparar layouts y metadata compatibles con SEO multiidioma

## Handoff Para UX/UI
- trabajar sobre arquitectura con tres zonas claras: publico, usuario autenticado y backoffice
- contemplar estado draft editorial posterior a seed import
- diferenciar con claridad contenido editorial, comunitario y moderacion

## Handoff Para Frontend Mobile
- sin implementacion actual
- preservar contratos y auth de forma que una app futura pueda agregarse sin reescribir dominio

## Handoff Para Testing
- preparar pruebas por rol y por estado
- incluir pruebas de importacion del seed
- validar permisos server-side, no solo visibilidad de interfaz
- validar locale fallback, SEO metadata y publicacion por estado

## Sugerencias Para `templates/project-state.md`
- mover `Arquitectura Definida` a `Si`
- mover etapa a `Gate 2 en progreso`, con arquitectura definida y UX/UI pendiente
- cambiar siguiente agente recomendado a `ux-ui-web-mobile`
- agregar como entregables disponibles este documento y el documento de contratos
