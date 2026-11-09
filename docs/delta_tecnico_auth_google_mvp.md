# Delta Tecnico Auth Google MVP

## Resumen
Este documento transforma el delta funcional de autenticacion con Google en una definicion tecnica implementable para el MVP.

La decision arquitectonica base se mantiene:
- backend NestJS
- sesion web first con cookie segura HTTP-only
- auth local vigente por email y contrasena

El cambio consiste en extender el modelo de identidad para soportar Google como proveedor externo sin reemplazar la sesion web local.

## Decision Tecnica Principal

## 1. Modelo de identidad unificado
El sistema deja de asumir que `User` equivale a un unico metodo de acceso.

Se recomienda separar:
- `User`: identidad base del producto
- `AuthIdentity`: metodos de autenticacion vinculados a un usuario
- `Session`: sesion web del portal, independiente de si el login fue local o Google

Resultado:
- un usuario puede tener identidad local
- un usuario puede tener identidad Google
- un usuario puede tener ambas identidades vinculadas
- toda navegacion autenticada sigue resolviendose por sesion propia del portal

## 2. Google no reemplaza la sesion propia
Google se usa solo para probar identidad en el login social.
Despues del callback exitoso:
- el backend resuelve o crea el `User`
- el backend crea una `Session` propia
- el navegador sigue operando con la misma cookie de sesion que el resto del MVP

Motivo:
- evita mezclar tokens de Google con autorizacion interna
- preserva guards, permisos y backoffice actuales
- reduce impacto sobre frontend y backend ya construidos

## 3. No auto-link silencioso por email
Si existe una cuenta local con el mismo email:
- no se crea un segundo `User`
- no se vincula automaticamente la identidad Google
- se devuelve un estado de conflicto controlado para resolver desde flujo propio

Motivo:
- el modelo local actual no exige email verificado previo
- por lo tanto, email igual no alcanza como criterio seguro de union automatica

## Cambios De Modelo Recomendados

## Entidades nuevas

### `AuthProvider`
Enum recomendado:
- `local`
- `google`

### `AuthIdentity`
Campos recomendados:
- `id`
- `userId`
- `provider`
- `providerUserId`
- `email`
- `emailVerified`
- `displayNameSnapshot`
- `avatarUrl`
- `linkedAt`
- `lastLoginAt`
- `createdAt`
- `updatedAt`

Constraints recomendados:
- unique `(provider, providerUserId)`
- unique parcial o regla equivalente para identidad local por email

## Cambios en `User`
Campos recomendados:
- `primaryEmail` en lugar de depender exclusivamente de `email` como metodo de auth
- `displayName`
- `isActive`
- `termsAcceptedAt`
- `localePreference`
- `createdAt`
- `updatedAt`

## Cambios en auth local
El password no debe seguir colgado directamente de `User`.
Opciones viables:

### Opcion recomendada MVP
Mover password hash a `AuthIdentity` cuando `provider = local`

Ventajas:
- unifica el modelo
- evita columnas nulas o semantica mixta en `User`
- simplifica soportar otros proveedores futuros

Campos extra para identidad local:
- `passwordHash` nullable solo para provider `local`

## Cambios en sesiones
`Session` puede mantenerse casi igual.
Campo adicional recomendado:
- `authIdentityId` opcional para auditar por que via se genero la sesion

No es obligatorio para el MVP, pero es recomendable.

## Cambios De Modulo

## Backend `auth`
Submodulos logicos recomendados:
- `local-auth`
- `social-auth`
- `identity-linking`
- `session-management`

## Responsabilidades
- `local-auth`: registro, login, forgot/reset password
- `social-auth`: inicio OAuth, callback, mapping del perfil Google
- `identity-linking`: conflicto de email, vinculacion manual futura si entra en MVP
- `session-management`: cookie, rotacion, logout, perfil autenticado

## Flujos Tecnicos Recomendados

## 1. Registro local
1. validar payload
2. verificar que no exista identidad local con ese email
3. crear `User`
4. crear `AuthIdentity(provider=local)`
5. asignar rol base
6. crear sesion propia

## 2. Login local
1. buscar `AuthIdentity(provider=local, email)`
2. validar password
3. cargar `User`
4. crear sesion propia

## 3. Inicio Google
1. frontend llama endpoint de inicio social
2. backend redirige a Google OAuth con `state` y `returnTo`
3. Google vuelve al callback del backend

## 4. Callback Google
1. validar `state`
2. intercambiar `code` por tokens del proveedor
3. leer perfil base del usuario
4. buscar `AuthIdentity(provider=google, providerUserId)`
5. si existe:
   - actualizar snapshot minimo
   - crear sesion propia
6. si no existe:
   - buscar conflicto por email con identidad local
   - si hay conflicto, devolver estado de conflicto
   - si no hay conflicto, crear `User` + `AuthIdentity(provider=google)` en estado listo o pendiente de terminos

## 5. Primer alta Google con terminos
Flujo recomendado:
- si Google llega por primera vez y no existe cuenta ni conflicto, crear un registro temporal funcional o una sesion limitada de onboarding
- luego exigir aceptacion de terminos
- recien al confirmar terminos, crear la sesion completa de producto

Implementacion MVP simplificada aceptable:
- crear `User` y `AuthIdentity`
- marcar onboarding pendiente
- no habilitar sesion completa hasta completar terminos

## Contratos Recomendados

## Mantener
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/password/forgot`
- `POST /api/v1/auth/password/reset`
- `GET /api/v1/me`
- `PATCH /api/v1/me`

## Agregar
- `GET /api/v1/auth/google/start`
- `GET /api/v1/auth/google/callback`
- `POST /api/v1/auth/social/complete-signup`
- `GET /api/v1/auth/providers`

## Endpoint: `GET /api/v1/auth/google/start`
Objetivo:
- iniciar login o registro social

Query params:
- `returnTo` opcional

Respuesta:
- redireccion HTTP a Google

## Endpoint: `GET /api/v1/auth/google/callback`
Objetivo:
- procesar el callback del proveedor

Resultados posibles:
- `302` a app autenticada si el login queda completo
- `302` a pantalla de terminos si falta completar onboarding
- `302` a pantalla de conflicto si existe cuenta local previa

## Endpoint: `POST /api/v1/auth/social/complete-signup`
Body:
- `termsAccepted`

Precondicion:
- contexto temporal de alta social pendiente

Resultado:
- sesion completa del portal

## Endpoint: `GET /api/v1/auth/providers`
Respuesta sugerida:
- `local.enabled`
- `google.enabled`

Sirve para frontend configurable por entorno.

## Errores Y Codigos Recomendados
- `AUTH_INVALID_CREDENTIALS`
- `AUTH_EMAIL_ALREADY_REGISTERED`
- `AUTH_SOCIAL_ACCOUNT_CONFLICT`
- `AUTH_SOCIAL_PROVIDER_ERROR`
- `AUTH_SOCIAL_TERMS_REQUIRED`
- `AUTH_PASSWORD_NOT_AVAILABLE`

## Reglas De Seguridad
- almacenar `state` anti-CSRF para OAuth
- validar redirect URIs estrictamente
- no exponer tokens de Google al frontend si el backend completa el flujo server-side
- persistir solo datos minimos del perfil externo
- auditar `login_method` en eventos de auth
- rate limit en endpoints locales y control de abuso en inicio social

## Cambios En Frontend Web
- login y registro deben ofrecer Google como CTA equivalente
- el frontend debe soportar retorno al contexto original via `returnTo`
- debe existir pantalla de conflicto de cuenta
- debe existir pantalla o modal de terminos para primer alta social si el callback no completa el alta

## Cambios En UX
- el flujo de acceso sigue siendo uno solo, con dos metodos
- el conflicto por email debe resolverse sin mensajes vagos
- `forgot password` no debe sugerirse como solucion para cuentas solo-Google

## Impacto En Backend Actual

## Se mantiene
- estrategia de sesion por cookie
- guard de sesion
- perfil autenticado por `GET /me`
- roles y asignacion base

## Debe refactorizarse
- schema Prisma de `User`
- servicio `AuthService`
- endpoints de auth
- recuperacion de password diferenciando cuenta local de social

## Secuencia Recomendada De Implementacion
1. refactor de schema Prisma a modelo `User + AuthIdentity + Session`
2. migracion inicial o incremental de auth
3. adaptacion de auth local existente al nuevo modelo
4. implementacion de inicio y callback Google
5. implementacion de conflicto y onboarding de terminos
6. smoke tests de auth local + social

## Riesgos Y Tradeoffs
- mover password fuera de `User` agrega refactor ahora, pero evita deuda fuerte mas adelante
- no auto-link por email agrega un paso UX, pero protege identidad
- callback server-side simplifica seguridad, pero obliga a coordinar mejor frontend y backend

## Referencias Tecnicas Para Implementacion
- Google OAuth 2.0 / OpenID Connect para aplicaciones web server-side
- NestJS guards, controllers y providers para callback OAuth
- Prisma modeling para identities vinculadas
- cookies HTTP-only, CSRF state y manejo de redirects

## Paquete Exacto Recomendado Para `backend-web`
- refactor de modelo de auth a identidades vinculadas
- soporte local + Google en misma identidad de usuario
- endpoints:
  - `GET /api/v1/auth/google/start`
  - `GET /api/v1/auth/google/callback`
  - `POST /api/v1/auth/social/complete-signup`
  - adaptacion de `register`, `login`, `forgot`, `reset`
- migracion Prisma correspondiente
- smoke tests de auth local y auth Google mockeado
