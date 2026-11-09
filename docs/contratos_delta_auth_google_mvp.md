# Contratos Delta Auth Google MVP

## Convenciones
- base path: `/api/v1`
- autenticacion final del portal: sesion segura por cookie
- Google se usa como proveedor de identidad, no como sesion del producto

## Endpoints Nuevos

## GET `/api/v1/auth/google/start`
Objetivo:
- iniciar login o registro con Google

Query:
- `returnTo` opcional

Respuesta:
- `302` a Google OAuth

## GET `/api/v1/auth/google/callback`
Objetivo:
- procesar respuesta del proveedor

Query esperada:
- `code`
- `state`

Respuestas funcionales:
- `302` a `returnTo` si login completo
- `302` a ruta de onboarding si falta aceptar terminos
- `302` a ruta de conflicto si existe cuenta local previa con mismo email

## POST `/api/v1/auth/social/complete-signup`
Objetivo:
- completar el alta social pendiente

Body:
- `termsAccepted`

Respuesta:
- `user`

Errores:
- `AUTH_SOCIAL_TERMS_REQUIRED`
- `AUTH_INVALID_SOCIAL_SIGNUP_CONTEXT`

## GET `/api/v1/auth/providers`
Objetivo:
- informar metodos de acceso disponibles por entorno

Respuesta:
- `local.enabled`
- `google.enabled`

## Endpoints Existentes Impactados

## POST `/api/v1/auth/register`
Sin cambios funcionales de contrato.

## POST `/api/v1/auth/login`
Sin cambios funcionales de contrato.

## POST `/api/v1/auth/password/forgot`
Nuevo comportamiento:
- si el email corresponde solo a cuenta Google, no debe iniciar reset real
- debe responder de forma segura sin filtrar existencia sensible

## POST `/api/v1/auth/password/reset`
Debe aplicar solo a identidades `local`.

## GET `/api/v1/me`
Respuesta recomendada extendida:
- `authMethods[]`
- `hasLocalPassword`

## PATCH `/api/v1/me`
Puede mantenerse igual en MVP.

## Estados De Error Recomendados
- `AUTH_SOCIAL_ACCOUNT_CONFLICT`
- `AUTH_SOCIAL_PROVIDER_ERROR`
- `AUTH_SOCIAL_TERMS_REQUIRED`
- `AUTH_PASSWORD_NOT_AVAILABLE`
