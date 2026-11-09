# Contratos MVP

## Convenciones
- base path: `/api/v1`
- formato: JSON
- autenticacion: sesion segura por cookie
- versionado: por prefijo de ruta
- errores: objeto estandar con `code`, `message`, `details`, `requestId`

## Publico

## GET `/api/v1/public/search`
Parametros:
- `q`
- `locale`
- `industry`
- `category`
- `granularity`
- `aiStatus`
- `page`
- `pageSize`

Respuesta:
- `items`
- `total`
- `page`
- `pageSize`
- `facets`

## GET `/api/v1/public/activities`
Parametros:
- `locale`
- `industry`
- `category`
- `granularity`
- `aiStatus`
- `sort`
- `page`
- `pageSize`

## GET `/api/v1/public/activities/:slug`
Respuesta:
- actividad base
- traduccion segun locale
- estado oficial
- resumen editorial
- taxonomias
- evidencias aprobadas
- comentarios visibles
- actividades relacionadas si existen

## GET `/api/v1/public/evidence/:idOrSlug`
Respuesta:
- evidencia base
- traduccion segun locale
- tipo
- fuente
- contexto
- actividades asociadas
- estado de confiabilidad visible

## GET `/api/v1/public/methodology`
Respuesta:
- contenido institucional por locale
- escala 0 a 5

## Auth y cuenta

## POST `/api/v1/auth/register`
Body:
- `email`
- `password`
- `displayName`
- `termsAccepted`

## POST `/api/v1/auth/login`
Body:
- `email`
- `password`

## POST `/api/v1/auth/logout`

## POST `/api/v1/auth/password/forgot`
Body:
- `email`

## POST `/api/v1/auth/password/reset`
Body:
- `token`
- `newPassword`

## GET `/api/v1/me`

## PATCH `/api/v1/me`
Body:
- `displayName`

## Contribucion

## POST `/api/v1/me/activity-proposals`
Body:
- `granularity`
- `industryKeys[]`
- `categoryKeys[]`
- `translations.es`
- `translations.en`

## PATCH `/api/v1/me/activity-proposals/:id`
Permitido solo si sigue `pending`.

## GET `/api/v1/me/activity-proposals`

## GET `/api/v1/me/activity-proposals/:id`
Respuesta:
- `id`
- `status`
- `moderationNote`
- `granularity`
- `industryKeys[]`
- `categoryKeys[]`
- `translations.en`
- `translations.es`
- `canEdit`

## POST `/api/v1/me/evidence-proposals`
Body:
- `type`
- `sourceText`
- `sourceUrl`
- `eventDate`
- `activityKeys[]`
- `translations.es`
- `translations.en`

## PATCH `/api/v1/me/evidence-proposals/:id`
Permitido solo si sigue `pending`.

## GET `/api/v1/me/evidence-proposals`

## GET `/api/v1/me/evidence-proposals/:id`
Respuesta:
- `id`
- `status`
- `moderationNote`
- `type`
- `sourceText`
- `sourceUrl`
- `eventDate`
- `activityKeys[]`
- `translations.en`
- `translations.es`
- `canEdit`

## POST `/api/v1/activities/:activityId/comments`
Body:
- `text`
- `parentCommentId` opcional

## POST `/api/v1/evidence/:evidenceId/comments`
Body:
- `text`
- `parentCommentId` opcional

## POST `/api/v1/comments/:commentId/report`
Body:
- `reason`
- `details` opcional

## Moderacion

## GET `/api/v1/moderation/queue`
Filtros:
- `type`
- `status`
- `q`
- `page`
- `pageSize`

Para `type=comments`, la respuesta debe incluir contexto del target moderado:
- `target.activityId`
- `target.evidenceId`
- `target.parentCommentId`
- `target.activity` con `id`, `key`, `title`, `slug` si el comentario pertenece a una actividad
- `target.evidence` con `id`, `type`, `title`, `slug` y actividades asociadas si el comentario pertenece a una evidencia

## POST `/api/v1/moderation/activities/:id/approve`
## POST `/api/v1/moderation/activities/:id/reject`
## POST `/api/v1/moderation/activities/:id/request-correction`

## POST `/api/v1/moderation/evidence/:id/approve`
## POST `/api/v1/moderation/evidence/:id/reject`
## POST `/api/v1/moderation/evidence/:id/request-correction`

## POST `/api/v1/moderation/comments/:id/hide`
## POST `/api/v1/moderation/comments/:id/archive`
## POST `/api/v1/moderation/comments/:id/resolve-report`

Todas estas acciones deben requerir:
- `reason`

## Editorial

## GET `/api/v1/editorial/activities`
Filtros:
- `status`
- `q`
- `hasEditorialSummary`
- `hasEvidence`
- `officialAiStatus`
- `industry`
- `category`
- `locale`
- `page`
- `pageSize`

## GET `/api/v1/editorial/activities/:id`
Respuesta:
- actividad
- historial editorial
- evidencias asociadas
- resumen editorial vigente
- estado oficial vigente
- `reviewNavigation`

## POST `/api/v1/editorial/activities/bulk-status`
Body:
- `ids[]`
- `editorialStatus`
- `officialAiStatus` opcional
- `rationale`

Guardrails:
- `approved` masivo solo si la actividad tiene resumen editorial bilingue, al menos una evidencia y estado IA oficial efectivo

Respuesta:
- `requestedCount`
- `processedCount`
- `skippedCount`
- `notFoundCount`
- `results[]` con outcome por item

## POST `/api/v1/editorial/activities/:id/status`
Body:
- `officialAiStatus`
- `rationale`

## PATCH `/api/v1/editorial/activities/:id/summary`
Body:
- `translations.es.editorialSummary`
- `translations.en.editorialSummary`

## POST `/api/v1/editorial/evidence/:id/mark-reliability`
Body:
- `flag`
- `reason`

## Admin

## CRUD `/api/v1/admin/industries`
## CRUD `/api/v1/admin/categories`
## CRUD `/api/v1/admin/evidence-types`
## CRUD `/api/v1/admin/users`
## POST `/api/v1/admin/users/:id/roles`

## Seed import

## POST `/api/v1/admin/seed-imports`
Puede disparar una corrida de importacion del CSV oficial.

## GET `/api/v1/admin/seed-imports/:runId`
Respuesta:
- estado de corrida
- filas procesadas
- filas rechazadas
- warnings

## Reglas de contrato
- ningun endpoint mutante debe confiar en rol enviado por frontend
- el locale se resuelve por ruta o header, pero siempre con fallback definido
- los endpoints publicos solo exponen contenido aprobado y visible
- los endpoints internos deben devolver estados suficientes para backoffice y auditoria
