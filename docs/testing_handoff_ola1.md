# Testing Handoff Ola 1

## Alcance Cubierto
- smoke HTTP de auth local backend
- smoke HTTP de catalogo publico backend
- smoke HTTP de importacion admin del seed backend
- smoke HTTP de editorial y moderacion backend
- smoke HTTP de contribucion backend
- smoke UI reproducible de frontend web con navegador real
- smoke UI reproducible de backoffice con navegador real
- validacion manual de Google OAuth real en entorno local
- chequeo geometrico del catalogo publico para detectar overlap entre sidebar, controles y cards
- validacion del flujo detalle de actividad -> `Proponer nueva evidencia` con actividad preseleccionada

## Flujo Cubierto Por `smoke:auth:local`
1. valida providers locales
2. registra usuario local
3. verifica perfil autenticado
4. hace logout y login
5. ejecuta forgot password y valida persistencia de token
6. ejecuta reset password real con token de harness local
7. verifica invalidacion de sesiones previas
8. verifica rechazo del password viejo
9. verifica login con password nuevo
10. verifica que `forgot password` sobre cuenta solo-social no cree tokens

## Suite Disponible
- `backend`: `npm run smoke:auth:local`
- `backend`: `npm run smoke:public`
- `backend`: `npm run smoke:admin:seed`
- `backend`: `npm run smoke:editorial`
- `backend`: `npm run smoke:contributions`
- `backend`: `npm run smoke:contributions:negative`
- `frontend-web`: `npm run smoke:ui`
- `frontend-web`: `npm run smoke:backoffice`
- `repo`: `powershell -ExecutionPolicy Bypass -File scripts/run-smoke-suite.ps1`

## Flujo Validado Manualmente Para Google OAuth
1. se configuro `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `GOOGLE_REDIRECT_URI` en `backend/.env`
2. se verifico `GET /api/v1/auth/providers` con `google.enabled=true`
3. se verifico el redirect de `GET /api/v1/auth/google/start`
4. desde la UI de login se abrio el flujo real con Google
5. al primer ingreso con `alex.jait.altman@gmail.com` se redirigio correctamente a `/auth/social/complete`
6. luego de aceptar terminos se completo el alta social y se llego a `/me?locale=en`
7. en navegaciones posteriores la sesion persistio y la app ya no exigio reautenticacion inmediata

## Cuentas De Prueba Habilitadas
- `alex.jait.altman@gmail.com`
- `the.creators.arsenal.company@gmail.com`

## Flujo Cubierto Por `smoke:public`
1. asegura fixtures publicas aprobadas y pendientes para actividad, evidencia y taxonomias
2. valida metodologia en `en` y `es`
3. valida taxonomias bilingues en `en` y `es`
4. valida listado publico filtrado por taxonomia
5. valida busqueda publica
6. valida detalle publico de actividad en `en` y `es`
7. valida que actividades pendientes no sean visibles
8. valida detalle publico de evidencia en `en` y `es`
9. valida que evidencias pendientes no sean visibles

## Flujo Cubierto Por `smoke:admin:seed`
1. valida rechazo de importacion sin autenticacion
2. valida rechazo de importacion para usuario autenticado no admin
3. promueve un usuario de smoke a admin en base
4. ejecuta la importacion oficial del seed por endpoint admin real
5. valida estado final, filas procesadas y warnings esperados
6. consulta el detalle del run por `id`
7. valida `404` para run inexistente
8. valida persistencia de una actividad importada en estado editorial `pending`

## Flujo Cubierto Por `smoke:editorial`
1. registra usuario de smoke y lo promueve a `EDITOR` + `MODERATOR`
2. crea fixtures editoriales pendientes con taxonomias y evidencia
3. valida aprobacion masiva con mezcla de `updated` y `skipped`
4. valida guardrails de bulk `approved` sobre contenido incompleto
5. valida filtros editoriales operativos por `q`, resumen, evidencia, industria, categoria y estado oficial
6. abre el detalle editorial de una actividad pendiente y valida `reviewNavigation`
7. actualiza resumen editorial en `en` y `es`
8. cambia estado oficial y `editorialStatus` a `approved` con fundamento
9. valida que la actividad quede visible en el portal publico
10. valida filtro de aprobadas con resumen editorial completo
11. crea comentario sobre la actividad ya aprobada
12. reporta ese comentario con otro usuario
13. consulta la cola de moderacion de comentarios
14. oculta el comentario reportado
15. valida que el comentario deje de verse publicamente

## Flujo Cubierto Por `smoke:ui`
1. valida que backend y frontend esten accesibles en local
2. valida acceso anonimo a area privada de propuestas en `es`
3. valida mensaje de Google deshabilitado en login
4. valida error de alta social sin contexto valido
5. valida geometricamente en `Explorar` que el panel de filtros no se superponga con la primera card
6. valida geometricamente la misma regla en `Cambios fuertes`
7. registra un usuario contribuyente con email y password
8. verifica ingreso a perfil autenticado
9. hace logout y login con `returnTo` hacia propuestas privadas
10. crea una propuesta de actividad desde el formulario real
11. verifica que la propuesta aparezca en la bandeja privada
12. entra al modo de edicion de esa propuesta y la actualiza
13. abre una actividad publica y publica un comentario
14. valida una pantalla publica en `es`
15. abre una evidencia publica y publica un comentario
16. registra un segundo usuario reportante
17. responde el comentario de actividad del primer usuario
18. denuncia ese comentario desde la UI real
19. guarda capturas y reporte JSON en `frontend-web/output/playwright/`
20. el bloque autenticado del smoke usa bootstrap de sesion por API para evitar flakes del submit de login/register y concentrar la validacion de UI en propuestas, comentarios y catalogo

## Flujo Cubierto Por `smoke:backoffice`
1. valida que backend y frontend esten accesibles en local
2. registra un operador de backoffice y le asigna roles `ADMIN`, `EDITOR` y `MODERATOR`
3. registra usuarios auxiliares para crear fixtures reales
4. crea una propuesta de actividad para la cola de moderacion
5. crea una propuesta de evidencia para la cola de moderacion
6. crea y denuncia un comentario real para la cola de comentarios
7. hace login del operador por la UI con `returnTo=/backoffice`
8. valida el guard de acceso anonimo al backoffice
9. valida dashboard real de backoffice
10. entra a la cola de moderacion de actividades y usa la busqueda visible del formulario
11. abre el detalle inline de una propuesta de actividad y solicita correccion
12. entra a la cola de moderacion de evidencia y usa la busqueda visible del formulario
13. abre el detalle inline de la propuesta y valida la fuente
14. entra a la cola de comentarios, usa la busqueda visible y resuelve una denuncia real
15. valida que la cola de comentarios encuentre la denuncia buscando por la actividad asociada, no solo por texto del comentario
16. valida que el target enriquecido del comentario sea visible dentro de la tarjeta de moderacion
17. entra al workspace editorial de actividades importadas
18. filtra la cola editorial desde la UI por titulo visible
19. valida desde UI el guardrail de bulk `approved` sobre una actividad incompleta
20. ejecuta una bulk action editorial exitosa sobre una actividad lista
21. valida copy y navegacion de lane editorial
22. actualiza resumen editorial bilingue desde la UI
23. valida el retorno automatico a la cola editorial despues del guardado
24. valida el panel de follow-through y sus atajos visibles en el workspace
25. guarda captura y reporte JSON en `frontend-web/output/playwright/`
26. el acceso autenticado del smoke usa bootstrap de sesion por API para evitar flakes del submit de login y concentrar la validacion de UI en moderacion y editorial

## Flujo Cubierto Por `smoke:contributions`
1. registra dos usuarios
2. crea propuesta de actividad
3. valida detalle privado de propuesta de actividad
4. actualiza propuesta de actividad y valida persistencia
5. crea propuesta de evidencia
6. valida detalle privado de propuesta de evidencia
7. consulta detalle moderador de propuesta de actividad
8. consulta detalle moderador de propuesta de evidencia
9. actualiza propuesta de evidencia y valida persistencia
10. valida busqueda de propuestas en colas de moderacion
11. crea comentario en actividad
12. crea reply desde segundo usuario
13. crea comentario en evidencia
14. denuncia comentario
15. valida persistencia de denuncia y visibilidad publica
16. valida que la cola de moderacion de comentarios encuentre el comentario reportado por `activity.key`
17. valida que la API de moderacion devuelva contexto enriquecido del target para ese comentario

## Flujo Cubierto Por `smoke:contributions:negative`
1. valida rechazo de comentario sin autenticacion
2. valida rechazo de lectura y edicion de propuesta ajena
3. valida rechazo por taxonomia invalida
4. valida rechazo de reply sobre reply
5. valida rechazo de reply cruzado entre actividad y evidencia
6. valida rechazo de denuncia del propio comentario
7. valida rechazo de comentario vacio

## Runner Integral
- `scripts/run-smoke-suite.ps1` ejecuta toda la suite principal
- hace precheck de backend y frontend antes de correr
- genera reporte JSON en `output/testing/`
- corta en el primer fallo y deja traza util para handoff

## Evidencia De Ejecucion Reciente
- suite integral validada en local con reporte:
  - `output/testing/smoke-suite-20260401-101303.json`
- smoke UI validado con bootstrap de sesion estable:
  - `frontend-web/output/playwright/smoke-ui-1775049197925.json`
- captura de actividad validada en la ultima corrida integral:
  - `frontend-web/output/playwright/smoke-ui-activity-1775049197925.png`
- captura de evidencia validada en la ultima corrida integral:
  - `frontend-web/output/playwright/smoke-ui-evidence-1775049197925.png`
- smoke backoffice validado con bootstrap de sesion estable:
  - `frontend-web/output/playwright/smoke-backoffice-1775049219013.json`
- captura de backoffice validada en la ultima corrida integral:
  - `frontend-web/output/playwright/smoke-backoffice-1775049219013.png`
- suite integral validada en local con reporte:
  - `output/testing/smoke-suite-20260331-122827.json`
- smoke UI validado con chequeo geometrico de catalogo publico:
  - `frontend-web/output/playwright/smoke-ui-1774970922160.json`
- captura de actividad validada despues del fix de layout:
  - `frontend-web/output/playwright/smoke-ui-activity-1774970922160.png`
- captura de evidencia validada despues del fix de layout:
  - `frontend-web/output/playwright/smoke-ui-evidence-1774970922160.png`
- smoke backoffice validado nuevamente:
  - `frontend-web/output/playwright/smoke-backoffice-1774970941033.json`
- captura de backoffice validada nuevamente:
  - `frontend-web/output/playwright/smoke-backoffice-1774970941033.png`
- suite integral validada en local con reporte:
  - `output/testing/smoke-suite-20260331-110741.json`
- contribucion backend validada con comentario reportado buscable por actividad asociada:
  - `output/testing/smoke-contributions-1774966071260.json`
- smoke backoffice validado con target enriquecido visible en comentario reportado:
  - `frontend-web/output/playwright/smoke-backoffice-1774966094003.json`
- captura de backoffice validada con target enriquecido:
  - `frontend-web/output/playwright/smoke-backoffice-1774966094003.png`
- suite integral validada en local con reporte:
  - `output/testing/smoke-suite-20260330-194411.json`
- catalogo publico backend validado con reporte:
  - `output/testing/smoke-public-catalog-1774814690347.json`
- importacion admin del seed validada con reporte:
  - `output/testing/smoke-admin-seed-1774814690765.json`
- editorial y moderacion backend validados con reporte:
  - `output/testing/smoke-editorial-1774825098062.json`
- contribucion backend validada con reporte:
  - `output/testing/smoke-contributions-1774821167825.json`
- contribucion backend no feliz validada con reporte:
  - `output/testing/smoke-contributions-negative-1774814698306.json`
- smoke UI validado con reporte:
  - `frontend-web/output/playwright/smoke-ui-1774814701519.json`
- smoke backoffice validado con reporte:
  - `frontend-web/output/playwright/smoke-backoffice-1774910684047.json`
- captura de backoffice validada:
  - `frontend-web/output/playwright/smoke-backoffice-1774910684047.png`
- Google OAuth real validado manualmente en local:
  - `GET /api/v1/auth/providers` con `google.enabled=true`
  - redirect correcto de `GET /api/v1/auth/google/start`
  - primer login real con onboarding social
  - retorno exitoso a `/me?locale=en`
  - persistencia de sesion confirmada en navegacion posterior

## Precondiciones
- backend disponible en `http://localhost:3001`
- frontend disponible en `http://localhost:3000`
- al menos una actividad publica aprobada en catalogo
- Chrome instalado localmente

## Variables Opcionales
- `FRONTEND_BASE_URL`
- `API_BASE_URL`
- `PLAYWRIGHT_CHROME_EXECUTABLE`

## Riesgos Abiertos
- el smoke UI depende de que exista al menos una actividad publica aprobada
- la suite todavia no cubre errores de moderacion de backoffice ni edge cases editoriales mas complejos
- la denuncia se valida por feedback de UI, no por lectura posterior de backoffice
- Google OAuth real ya fue validado manualmente, pero sigue fuera de la suite automatizada
- la suite no cubre todavia conflicto social de autenticacion ni callback OAuth real automatizado
- el reset real hoy usa un harness local porque aun no existe entrega de email en desarrollo
- la aprobacion editorial ya tiene smoke base, incluyendo guardrails y bulk actions desde UI, pero aun faltan escenarios mas ricos de cola, historial, ocultamiento de comentarios y cambios repetidos desde UI

## Siguiente Ola Recomendada
- ampliar smoke UI y backend smoke sobre escenarios de moderacion/editorial
- empezar a consolidar un checklist de regresion para handoff de QA
