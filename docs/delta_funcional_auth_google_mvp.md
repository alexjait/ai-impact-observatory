# Delta Funcional Auth Google MVP

## Resumen
Este documento actualiza el alcance funcional vigente del MVP para incorporar autenticacion social con Google sin reabrir el resto de los modulos ya aprobados.

El objetivo del delta es permitir que una persona:
- se registre con email y contrasena
- inicie sesion con email y contrasena
- se registre o inicie sesion mediante Google

La plataforma sigue siendo web responsive, mantiene auth local y conserva la estrategia de sesion web segura como experiencia objetivo del MVP.

## Cambio Funcional Incorporado

## Autenticacion Y Cuenta
Se amplia el modulo de autenticacion y cuenta con estas capacidades:
- registro local por email y contrasena
- login local por email y contrasena
- registro o login por Google
- coexistencia entre cuenta local y cuenta social bajo una unica identidad de usuario
- aceptacion de terminos tambien en el primer alta via Google

## Reglas De Negocio Del Delta

## 1. Google aplica a registro y login
- Si la persona no existe aun en el sistema y entra con Google, el sistema puede crear una cuenta nueva.
- Si la persona ya tiene una identidad social Google vinculada, el sistema la autentica y crea sesion.

## 2. Se permiten cuentas solo-sociales
- El MVP debe permitir cuentas creadas unicamente con Google, sin password local obligatoria.
- Para cuentas solo-sociales, la recuperacion de acceso inicial depende del proveedor Google.
- El flujo de `forgot password` aplica solo a cuentas con password local existente.

## 3. No debe existir duplicacion de usuario por proveedor
- La cuenta de usuario es una sola entidad base.
- Los metodos de acceso son identidades vinculadas a esa cuenta base.
- Un mismo usuario puede existir con auth local, auth Google o ambos metodos vinculados.

## 4. Colision entre cuenta local y Google con mismo email
Regla funcional recomendada para MVP:
- No auto-vincular silenciosamente una cuenta local existente con Google solo por coincidencia de email.
- Si una persona intenta entrar con Google y ya existe una cuenta local con el mismo email, el sistema debe interrumpir la creacion de una nueva cuenta y mostrar flujo de resolucion.
- La resolucion minima funcional segura es una de estas:
  - la persona inicia sesion con su metodo actual y vincula Google desde su cuenta
  - o el sistema ejecuta una verificacion adicional controlada antes de vincular

Motivo:
- la cuenta local del MVP actual no exige verificacion previa de email
- por lo tanto, la coincidencia de email por si sola no alcanza como criterio seguro de vinculacion automatica

## 5. Primer acceso con Google
- En el primer acceso exitoso con Google, el sistema debe recopilar y persistir al menos:
  - email devuelto por Google
  - indicador de email verificado por Google si estuviera disponible
  - nombre visible inicial
  - identificador estable del proveedor
  - avatar opcional si el proveedor lo entrega
- Si la persona llega por Google por primera vez, debe aceptar terminos antes de completar el alta funcional.

## 6. Perfil
- El nombre visible inicial puede precargarse desde Google.
- El usuario puede editar localmente su nombre visible despues del alta.
- Avatar importado desde Google es opcional y no obligatorio para el MVP.

## 7. Sesion
- El resultado funcional de login local y login Google debe converger en la misma experiencia de sesion web.
- Luego del acceso exitoso, el usuario vuelve al contexto anterior cuando corresponda.

## Impacto En Alcance Funcional Vigente

## Se actualiza
- modulo `Autenticacion Y Cuenta`
- criterios de aceptacion de auth
- reglas de negocio de identidad
- backlog de arquitectura, UX/UI, backend, frontend web y testing

## No se modifica
- comentarios
- propuestas
- moderacion
- editorial
- taxonomias
- seed
- i18n general
- SEO general

## Backlog Impactado Por Especialidad

## Arquitectura
- ARQ-AUTH-01: definir modelo de identidad unico con multiples metodos de autenticacion por usuario
- ARQ-AUTH-02: definir regla tecnica de vinculacion entre cuenta local y Google
- ARQ-AUTH-03: definir persistencia de proveedor, provider user id, email verificado, avatar y estado de vinculacion
- ARQ-AUTH-04: definir flujo de sesion web posterior a callback OAuth sin romper la estrategia de cookies seguras
- ARQ-AUTH-05: definir impacto sobre recuperacion de cuenta, terminos y trazabilidad de altas via Google

## UX/UI
- UX-AUTH-01: actualizar login y registro para mostrar acceso con Google junto a email y contrasena
- UX-AUTH-02: definir primer acceso via Google con aceptacion de terminos
- UX-AUTH-03: definir pantalla o mensaje de colision entre cuenta local y Google con mismo email
- UX-AUTH-04: definir mensajes para cuenta solo-social, cuenta vinculada y errores del proveedor
- UX-AUTH-05: definir si el usuario puede vincular Google desde perfil en el MVP o queda diferido

## Backend
- BE-AUTH-01: extender modelo de usuario para soportar identidades de proveedor externo
- BE-AUTH-02: implementar inicio de flujo Google OAuth para web
- BE-AUTH-03: implementar callback seguro y creacion de sesion local posterior
- BE-AUTH-04: implementar alta de cuenta social en primer acceso con aceptacion de terminos
- BE-AUTH-05: implementar manejo de colision con cuenta local existente sin duplicar usuario
- BE-AUTH-06: auditar altas y logins via Google

## Frontend Web
- FEW-AUTH-01: agregar CTA de continuar con Google en login y registro
- FEW-AUTH-02: implementar retorno al contexto original tras login Google
- FEW-AUTH-03: implementar pantalla de aceptacion de terminos en primer acceso social si hace falta
- FEW-AUTH-04: implementar experiencia clara para conflicto de cuenta existente

## Testing
- QA-AUTH-01: validar registro local y login local sin regresion
- QA-AUTH-02: validar alta nueva via Google
- QA-AUTH-03: validar login via Google para cuenta social ya existente
- QA-AUTH-04: validar conflicto entre cuenta local existente y Google con mismo email
- QA-AUTH-05: validar cuentas solo-sociales sin acceso a `forgot password`
- QA-AUTH-06: validar retorno al contexto previo tras login local y social

## Criterios De Aceptacion Actualizados

## Autenticacion Y Cuenta
- AC-AUT-01: Un usuario puede registrarse con email, contrasena y aceptacion de terminos.
- AC-AUT-02: Un usuario puede iniciar sesion y cerrar sesion.
- AC-AUT-03: Un usuario puede solicitar recuperacion de contrasena para una cuenta con password local.
- AC-AUT-04: Un usuario autenticado puede editar su perfil basico.
- AC-AUT-05: Un usuario puede registrarse o iniciar sesion mediante Google.
- AC-AUT-06: En el primer alta via Google, el sistema exige aceptacion de terminos antes de completar el acceso funcional.
- AC-AUT-07: Si existe una cuenta local con el mismo email, el sistema no crea automaticamente un segundo usuario ni vincula silenciosamente la cuenta Google.
- AC-AUT-08: Una cuenta creada solo con Google puede iniciar sesion sin password local.
- AC-AUT-09: El resultado de login local y login Google devuelve a la misma experiencia autenticada del portal.

## UX Complementaria Esperada
- El acceso con Google debe verse como opcion primaria equivalente, no escondida.
- El usuario debe entender cuando esta creando cuenta nueva, iniciando sesion o entrando en un conflicto de identidad.
- El mensaje de conflicto entre cuenta local y Google debe indicar siguiente paso sin ambiguedad.

## Riesgos Y Dependencias
- El MVP actual de auth local no contempla verificacion previa de email, por lo que la vinculacion automatica por email coincidente es riesgosa.
- Google Sign-In incorpora dependencia externa de configuracion OAuth, consent screen, redirect URIs y secreto de aplicacion.
- El flujo de recuperacion de cuenta debe diferenciar cuentas locales y cuentas solo-sociales.
- La implementacion requerira ajustes en contratos y arquitectura antes de profundizar backend.

## Decisiones Humanas Pendientes
No queda una decision bloqueante para cerrar el delta funcional si se acepta esta recomendacion:
- permitir cuentas solo-sociales
- no auto-vincular por coincidencia de email
- exigir terminos en primer acceso via Google

Si negocio quisiera auto-vinculacion por email, eso si deberia considerarse una nueva decision sensible y requeriria protecciones adicionales.

## Sugerencias De Actualizacion Para `templates/project-state.md`
- marcar que el delta funcional de Google auth ya fue resuelto
- cambiar siguiente agente recomendado a `software_architect`
- dejar explicitado que el backend no debe seguir implementando auth hasta recibir el delta tecnico de identidad

