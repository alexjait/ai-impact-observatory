# Estado Del Proyecto

## Proyecto
Portal de actividades impactadas, reemplazadas o transformadas por IA.

## Etapa Actual
Gate 3 en progreso. Backend, frontend web y una primera superficie real de backoffice ya estan implementados y validados localmente contra PostgreSQL, navegador real y smoke tests.

## Objetivo Actual
Seguir en validacion operativa con seed real mientras se cierran deltas chicos de producto sobre contribucion, catalogo publico y operacion editorial. El backoffice ya incorpora CRUD estructural para Actividades y Evidencias, por lo que la siguiente capa de trabajo puede concentrarse en ergonomia, guardrails y cobertura automatizada.

## Brief Inicial
Disponible en [brief-requerimiento-inicial.md](brief-requerimiento-inicial.md) y respaldado por [req_funcional_formal_portal_impacto_ia.md](../docs/req_funcional_formal_portal_impacto_ia.md).

## Alcance Aprobado
Aprobado para pasar a la etapa de solucion. Existe definicion de vision, modulos, reglas de negocio, NFR, backlog por especialidad y criterios de aceptacion en [especificacion_funcional_mvp_portal_impacto_ia.md](../docs/especificacion_funcional_mvp_portal_impacto_ia.md).

## Delta Funcional Reciente
Definido en [delta_funcional_auth_google_mvp.md](../docs/delta_funcional_auth_google_mvp.md).

## Delta Funcional En Preparacion
Definido en [delta_funcional_seguimiento_actividades.md](../docs/delta_funcional_seguimiento_actividades.md), [delta_funcional_footer_institucional_contacto.md](../docs/delta_funcional_footer_institucional_contacto.md) y [delta_funcional_crud_actividades_evidencias_backoffice.md](../docs/delta_funcional_crud_actividades_evidencias_backoffice.md).

## Delta De Negocio Reciente
Definido en [delta_negocio_seguimiento_actividades.md](../docs/delta_negocio_seguimiento_actividades.md).

## Delta De Negocio En Preparacion
Definido en [delta_negocio_footer_institucional_contacto.md](../docs/delta_negocio_footer_institucional_contacto.md) y [delta_negocio_crud_actividades_evidencias_backoffice.md](../docs/delta_negocio_crud_actividades_evidencias_backoffice.md).

## Delta Tecnico Reciente
Definido en [delta_tecnico_auth_google_mvp.md](../docs/delta_tecnico_auth_google_mvp.md) y [contratos_delta_auth_google_mvp.md](../docs/contratos_delta_auth_google_mvp.md).

## Paquete En Ejecucion
Validacion operativa del seed con lote real de actividades, apoyada por [validacion_operativa_seed.md](../docs/validacion_operativa_seed.md) y [validacion_seed_ronda_01.md](../docs/validacion_seed_ronda_01.md).

## Backlog Ejecutable

## Paquetes Listos Para Implementacion

## Paquete En Ejecucion

## Arquitectura Definida
Si. Disponible en [arquitectura_mvp_portal_impacto_ia.md](../docs/arquitectura_mvp_portal_impacto_ia.md) y [contratos_mvp_portal_impacto_ia.md](../docs/contratos_mvp_portal_impacto_ia.md).

## UX/UI Definido
Si. Disponible en [ux_ui_mvp_portal_impacto_ia.md](../docs/ux_ui_mvp_portal_impacto_ia.md).

## Backend En Curso
Si. Implementacion de auth, publico y contribucion validada en [backend/README.md](../backend/README.md) y handoff tecnico en [backend_handoff_ola1.md](../docs/backend_handoff_ola1.md). Ya expone tambien detalle privado de propuestas por `id`, detalle moderador por `id`, filtros editoriales por busqueda/completitud/taxonomias, navegacion de revision por lane, accion masiva de estado editorial con guardrails para acelerar operacion sobre el seed, busqueda de comentarios moderables por actividad/evidencia asociada con contexto enriquecido del target, configuracion publica para ocultar comentarios/reportes desde backoffice y traduccion automatica de propuestas de evidencia cargadas en un solo idioma.

## Frontend Web En Curso
Si. Primera ola ampliada e implementada con home, catalogo, detalle de actividad, detalle de evidencia, auth local, recovery local, perfil, area de propuestas, edicion de propuestas pendientes y ahora tambien backoffice real con dashboard, cola de moderacion, busqueda visible, detalle inline de propuestas, filtros/paginacion y workspace editorial con filtros operativos, navegacion `previous/next` por lane, seleccion multiple, bulk actions editoriales, tablero de readiness, diagnostico visible, acciones de guardar-seguir y panel de follow-through para throughput del seed. La experiencia publica tambien recibio una limpieza reciente de tono, home y layout de catalogo, mas una mejora de navegacion del catalogo con filtros activos, vistas rapidas, paginacion y tarjetas mas robustas. El detalle de actividad ahora usa copy mas claro para el resumen publico, elimina el panel lateral de comunidad, agrega CTA directo a `Proponer nueva evidencia` con preseleccion de actividad y respeta la configuracion publica de comentarios. `Mis propuestas` ya localiza estados, reabre correcciones para edicion y el formulario de evidencia ahora guia la carga en un solo idioma con traduccion automatica al segundo locale. La cola de moderacion ya muestra ademas contexto enriquecido de actividad/evidencia para comentarios reportados y el backoffice suma CRUD dedicados para crear, editar, publicar y archivar Actividades y Evidencias materializadas del catalogo en [frontend-web/README.md](../frontend-web/README.md) y [frontend_web_handoff_ola1.md](../docs/frontend_web_handoff_ola1.md).

## Frontend Mobile En Curso
No. El MVP fue confirmado como web responsive, sin app mobile nativa en esta etapa.

## Testing En Curso
Si, en modo smoke y validacion local. Ya hubo smoke HTTP de auth backend, smoke de catalogo publico backend, smoke admin de importacion oficial del seed, smoke editorial/moderacion backend, smoke de contribucion backend, smoke de contribucion no feliz, smoke de navegador real para auth y colaboracion frontend, smoke SSR de rutas privadas de propuestas, verificacion SSR de propuestas con cookie real, smoke UI reproducible en navegador real para colaboracion publica y ahora tambien smoke UI reproducible para backoffice con dashboard, cola de moderacion, workspace editorial, guard de acceso anonimo y guardrails visibles de bulk approval desde UI. El smoke de auth backend ya cubre tambien reset real con harness local, invalidacion de sesion y guard para cuentas solo-sociales. Google OAuth real ademas fue validado manualmente end to end en local con cuenta de prueba y persistencia de sesion. Existe ademas un runner integral de suite que genera reporte JSON.

## Evidencia Reciente
- suite integral validada nuevamente despues de estabilizar smoke UI y smoke backoffice con bootstrap de sesion en `output/testing/smoke-suite-20260401-101303.json`
- smoke UI validado con la nueva estrategia estable de sesion en `frontend-web/output/playwright/smoke-ui-1775049197925.json`
- captura de actividad validada en la ultima corrida integral en `frontend-web/output/playwright/smoke-ui-activity-1775049197925.png`
- captura de evidencia validada en la ultima corrida integral en `frontend-web/output/playwright/smoke-ui-evidence-1775049197925.png`
- smoke backoffice validado con la nueva estrategia estable de sesion en `frontend-web/output/playwright/smoke-backoffice-1775049219013.json`
- captura de backoffice validada en la ultima corrida integral en `frontend-web/output/playwright/smoke-backoffice-1775049219013.png`
- smoke Playwright MCP validado con switch publico de comentarios en backoffice, detalle publico sin comentarios, link desde moderacion al detalle publico y correccion real de propuestas de actividad/evidencia con traduccion automatica validada manualmente
- smoke contribucion backend validado con correccion de propuestas y traduccion automatica de evidencia en `output/testing/smoke-contributions-1775047413424.json`
- smoke backoffice validado luego del nuevo paquete de configuracion publica en `frontend-web/output/playwright/smoke-backoffice-1775047414022.json`
- captura de backoffice validada luego del nuevo paquete de configuracion publica en `frontend-web/output/playwright/smoke-backoffice-1775047414022.png`
- smoke UI validado luego del nuevo paquete de contribucion e i18n en `frontend-web/output/playwright/smoke-ui-1775047413991.json`
- captura de actividad validada luego del nuevo paquete de contribucion e i18n en `frontend-web/output/playwright/smoke-ui-activity-1775047413991.png`
- captura de evidencia validada luego del nuevo paquete de contribucion e i18n en `frontend-web/output/playwright/smoke-ui-evidence-1775047413991.png`
- smoke UI validado con CTA desde detalle de actividad a nueva evidencia con actividad preseleccionada en `frontend-web/output/playwright/smoke-ui-1775003796997.json`
- captura de actividad validada despues del ajuste de copy y CTA en `frontend-web/output/playwright/smoke-ui-activity-1775003796997.png`
- captura de evidencia validada despues del ajuste de flujo contextual en `frontend-web/output/playwright/smoke-ui-evidence-1775003796997.png`
- suite integral validada con chequeo geometrico del catalogo publico en `output/testing/smoke-suite-20260331-122827.json`
- smoke UI validado con no-superposicion entre filtros, controles y cards en `frontend-web/output/playwright/smoke-ui-1774972446232.json`
- captura de actividad validada despues del fix de contencion de controles en `frontend-web/output/playwright/smoke-ui-activity-1774972446232.png`
- captura de evidencia validada despues del fix de contencion de controles en `frontend-web/output/playwright/smoke-ui-evidence-1774972446232.png`
- smoke UI validado con no-superposicion entre filtros y cards en `frontend-web/output/playwright/smoke-ui-1774970922160.json`
- captura de actividad validada despues del fix de layout en `frontend-web/output/playwright/smoke-ui-activity-1774970922160.png`
- captura de evidencia validada despues del fix de layout en `frontend-web/output/playwright/smoke-ui-evidence-1774970922160.png`
- smoke backoffice validado nuevamente en `frontend-web/output/playwright/smoke-backoffice-1774970941033.json`
- captura de backoffice validada nuevamente en `frontend-web/output/playwright/smoke-backoffice-1774970941033.png`
- suite integral validada con cobertura de comentario reportado buscable por actividad asociada en `output/testing/smoke-suite-20260331-110741.json`
- smoke backoffice validado con target enriquecido visible para comentario reportado en `frontend-web/output/playwright/smoke-backoffice-1774966094003.json`
- captura de backoffice validada con target enriquecido de comentario en `frontend-web/output/playwright/smoke-backoffice-1774966094003.png`
- contribucion backend validada con comentario reportado buscable por actividad asociada en `output/testing/smoke-contributions-1774966071260.json`
- smoke backoffice validado con comentario reportado buscable por actividad asociada y target enriquecido visible en `frontend-web/output/playwright/smoke-backoffice-1774964813667.json`
- captura de backoffice validada con contexto enriquecido de comentario en `frontend-web/output/playwright/smoke-backoffice-1774964813667.png`
- contribucion backend validada con comentario reportado buscable por actividad asociada en `output/testing/smoke-contributions-1774964352961.json`
- smoke UI validado despues de la mejora de catalogo publico en `frontend-web/output/playwright/smoke-ui-1774963909069.json`
- captura de actividad validada despues de la mejora de catalogo en `frontend-web/output/playwright/smoke-ui-activity-1774963909069.png`
- captura de evidencia validada despues de la mejora de catalogo en `frontend-web/output/playwright/smoke-ui-evidence-1774963909069.png`
- smoke UI validado despues de limpieza publica y correccion de layout en `frontend-web/output/playwright/smoke-ui-1774960971255.json`
- captura de actividad validada despues de la limpieza publica en `frontend-web/output/playwright/smoke-ui-activity-1774960971255.png`
- captura de evidencia validada despues de la limpieza publica en `frontend-web/output/playwright/smoke-ui-evidence-1774960971255.png`
- suite integral validada en `output/testing/smoke-suite-20260330-194411.json`
- smoke backoffice validado sobre panel de follow-through, throughput editorial y retorno automatico a la cola en `frontend-web/output/playwright/smoke-backoffice-1774910684047.json`
- captura de backoffice validada en `frontend-web/output/playwright/smoke-backoffice-1774910684047.png`
- suite integral validada en `output/testing/smoke-suite-20260330-122114.json`
- smoke backoffice validado sobre throughput editorial, guardrail UI de bulk approval y retorno automatico a la cola en `frontend-web/output/playwright/smoke-backoffice-1774884106494.json`
- captura de backoffice validada en `frontend-web/output/playwright/smoke-backoffice-1774884106494.png`
- suite integral validada en `output/testing/smoke-suite-20260329-212720.json`
- smoke backoffice validado sobre ergonomia editorial, guardrail UI de bulk approval y accion masiva editorial exitosa en `frontend-web/output/playwright/smoke-backoffice-1774830471575.json`
- captura de backoffice validada en `frontend-web/output/playwright/smoke-backoffice-1774830471575.png`
- suite integral validada en `output/testing/smoke-suite-20260329-203434.json`
- smoke backoffice validado sobre guard de acceso anonimo, guardrail UI de bulk approval y accion masiva editorial exitosa en `frontend-web/output/playwright/smoke-backoffice-1774827307254.json`
- captura de backoffice validada en `frontend-web/output/playwright/smoke-backoffice-1774827307254.png`
- suite integral validada en `output/testing/smoke-suite-20260329-202016.json`
- smoke backoffice validado sobre filtro editorial y bulk action UI en `frontend-web/output/playwright/smoke-backoffice-1774826449213.json`
- captura de backoffice validada en `frontend-web/output/playwright/smoke-backoffice-1774826449213.png`
- suite integral validada en `output/testing/smoke-suite-20260329-195809.json`
- editorial backend validado con bulk actions y guardrails en `output/testing/smoke-editorial-1774825098062.json`
- suite integral validada en `output/testing/smoke-suite-20260329-194144.json`
- smoke backoffice validado con busqueda visible e inspeccion inline en `frontend-web/output/playwright/smoke-backoffice-1774824135251.json`
- suite integral validada en `output/testing/smoke-suite-20260329-193507.json`
- smoke backoffice validado sobre detalle inline y lane editorial en `frontend-web/output/playwright/smoke-backoffice-1774823740414.json`
- smoke backoffice validado sobre detalle inline y lane editorial en `frontend-web/output/playwright/smoke-backoffice-1774823654401.json`
- suite integral validada en `output/testing/smoke-suite-20260329-185238.json`
- editorial/moderacion backend validado con filtros y navegacion en `output/testing/smoke-editorial-1774821166598.json`
- contribucion backend validada con detalle moderador y busqueda en `output/testing/smoke-contributions-1774821167825.json`
- smoke backoffice validado consumiendo filtros de moderacion en `frontend-web/output/playwright/smoke-backoffice-1774821189104.json`
- suite integral validada en `output/testing/smoke-suite-20260329-170448.json`
- suite integral validada nuevamente en `output/testing/smoke-suite-20260329-180304.json`
- catalogo publico backend validado en `output/testing/smoke-public-catalog-1774814690347.json`
- importacion admin del seed validada en `output/testing/smoke-admin-seed-1774814690765.json`
- editorial/moderacion backend validado en `output/testing/smoke-editorial-1774814696410.json`
- contribucion backend validada en `output/testing/smoke-contributions-1774814697427.json`
- contribucion backend no feliz validada en `output/testing/smoke-contributions-negative-1774814698306.json`
- smoke UI validado en `frontend-web/output/playwright/smoke-ui-1774814701519.json`
- smoke UI validado nuevamente en `frontend-web/output/playwright/smoke-ui-1774818200166.json`
- smoke backoffice validado en `frontend-web/output/playwright/smoke-backoffice-1774818217301.json`
- smoke backoffice validado nuevamente en `frontend-web/output/playwright/smoke-backoffice-1774819570903.json`
- Google OAuth real validado manualmente en local con redireccion a `/auth/social/complete`, alta completada y retorno a `/me?locale=en`
- validacion Playwright real de `/backoffice`, `/backoffice/moderation` y `/backoffice/editorial/activities/:id` con guardado exitoso de resumen editorial bilingue desde UI

## Decisiones Cerradas
- Producto objetivo: portal web colaborativo y curado sobre impacto de IA en actividades humanas.
- El objeto central del dominio es la actividad, con prioridad sobre profesion.
- El MVP incluye sitio publico, autenticacion, propuestas, comentarios, backoffice, moderacion, editorial, taxonomias e historial minimo.
- La plataforma debe soportar `en` y `es` desde el inicio.
- Recomendacion de lanzamiento: prioridad editorial en ingles.
- No se deben duplicar entidades por idioma; se esperan tablas de traduccion.
- El estado oficial de avance IA requiere intervencion editorial y trazabilidad.
- Existe una especificacion funcional ejecutable para el MVP con backlog por especialidad y criterios de aceptacion.
- El MVP sera exclusivamente web responsive.
- La politica inicial de comentarios sera publicacion inmediata con opcion de denuncia.
- El seed inicial oficial es [seed_portal_impacto_ia_bilingue_completo.csv](../docs/seed_portal_impacto_ia_bilingue_completo.csv).
- El SEO multiidioma con rutas por locale queda como recomendacion inicial.
- Preferencia tecnica declarada: Next.js, NestJS, PostgreSQL, Prisma, auth propia, Resend, Hostinger Email y Docker Compose en VPS Hostinger.
- La implementacion del MVP se realizara en olas internas, con construccion, testing y validacion por etapas antes de una unica salida a produccion.

## Riesgos Abiertos
- El alcance del MVP es amplio para una primera entrega y requiere respetar la secuenciacion por olas internas.
- El CSV de seed debe validarse tecnicamente antes de importarlo en entorno real.
- La estrategia de auth propia y el stack preferido deben implementarse con disciplina de seguridad y auditoria.
- Falta validacion runtime del backend contra PostgreSQL real y smoke tests HTTP.
- El nuevo requerimiento de Google Sign-In impacta reglas de identidad, colision de cuentas, UX de acceso y contratos de autenticacion.
- La resolucion tecnica de identidades multiples por usuario debe evitar takeover por coincidencia de email.
- La experiencia publica todavia depende de aprobar e importar contenido seed para salir del estado vacio.
- Las bulk actions editoriales ya estan disponibles en backend y frontend, pero aun pueden requerir mas ergonomia y guardrails operativos si se va a procesar mucho volumen del seed desde la UI.
- El reset password en testing usa harness local porque el entorno dev todavia no entrega emails reales.
- Google OAuth ya esta validado manualmente en local, pero sigue fuera de la regresion automatizada.

## Bloqueos
- No hay bloqueos criticos tecnicos abiertos para auth social en local.

## Siguiente Agente Recomendado
`testing` para ampliar la regresion automatizada del nuevo CRUD de Actividades y Evidencias en backoffice y capturar guardrails operativos antes de seguir con otra ola funcional.

## Entrada Que Debe Recibir
- [req_funcional_formal_portal_impacto_ia.md](../docs/req_funcional_formal_portal_impacto_ia.md)
- [brief-requerimiento-inicial.md](brief-requerimiento-inicial.md)
- [especificacion_funcional_mvp_portal_impacto_ia.md](../docs/especificacion_funcional_mvp_portal_impacto_ia.md)
- [arquitectura_mvp_portal_impacto_ia.md](../docs/arquitectura_mvp_portal_impacto_ia.md)
- [contratos_mvp_portal_impacto_ia.md](../docs/contratos_mvp_portal_impacto_ia.md)
- [ux_ui_mvp_portal_impacto_ia.md](../docs/ux_ui_mvp_portal_impacto_ia.md)
- [seed_portal_impacto_ia_bilingue_completo.csv](../docs/seed_portal_impacto_ia_bilingue_completo.csv)
- [backend_handoff_ola1.md](../docs/backend_handoff_ola1.md)
- [frontend_web_handoff_ola1.md](../docs/frontend_web_handoff_ola1.md)
- [testing_handoff_ola1.md](../docs/testing_handoff_ola1.md)
- [run-smoke-suite.ps1](../scripts/run-smoke-suite.ps1)
- [paquete_handoff_delta_auth_google.md](../docs/paquete_handoff_delta_auth_google.md)
- [delta_funcional_auth_google_mvp.md](../docs/delta_funcional_auth_google_mvp.md)
- [delta_tecnico_auth_google_mvp.md](../docs/delta_tecnico_auth_google_mvp.md)
- [contratos_delta_auth_google_mvp.md](../docs/contratos_delta_auth_google_mvp.md)
