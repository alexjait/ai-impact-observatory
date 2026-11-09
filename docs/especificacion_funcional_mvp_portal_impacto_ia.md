# Especificacion Funcional Ejecutable

## Resumen Ejecutivo
Este documento consolida el requerimiento funcional formal, el brief inicial y las decisiones de negocio ya confirmadas para dejar cerrado el alcance operativo del MVP. El proyecto se define como un portal web publico responsive con backoffice web, orientado a registrar, visualizar, discutir y curar evidencia sobre como la IA impacta actividades humanas concretas.

La actividad es el objeto central del dominio. El sistema debe separar con claridad el contenido editorial, el contenido generado por la comunidad y el estado oficial visible. El MVP ya puede pasar a arquitectura sin dudas funcionales criticas abiertas.

## Objetivos De Negocio
- Centralizar informacion estructurada sobre actividades impactadas por IA.
- Hacer navegable y comparable el impacto por actividad, rubro, categoria y nivel de avance IA.
- Permitir contribuciones de usuarios sin perder trazabilidad ni control editorial.
- Sostener crecimiento SEO y catalogo multiidioma desde el inicio.
- Dejar una base preparada para evolucion futura en monetizacion, API y automatizaciones, sin incluirlas en este MVP.

## Actores Y Roles
- Visitante: explora contenido publico, busca actividades, consulta evidencias y metodologia.
- Usuario registrado: propone actividades, propone evidencias y comenta.
- Moderador: revisa propuestas, comentarios y reportes.
- Editor: define o actualiza el estado oficial de avance IA y el resumen editorial.
- Administrador: gestiona usuarios, roles y taxonomias.

## Alcance Funcional

## 1. Experiencia Publica Y Descubrimiento
- Home publica con propuesta de valor, acceso a busqueda, exploracion y metodologia.
- Buscador global con resultados sobre actividades y capacidad de filtrar por rubro, categoria, granularidad, estado de avance IA e idioma disponible.
- Exploracion por taxonomias visibles: rubros, categorias funcionales y nivel de impacto.
- Listado de actividades aprobadas, paginado o equivalente funcional.
- Detalle publico de actividad con estado oficial vigente, resumen editorial, taxonomias asociadas, evidencias aprobadas, comentarios visibles y enlaces a actividades relacionadas si existen.
- Detalle publico de evidencia con tipo, resumen, contexto, fuente, fecha relevante si existe, actividades asociadas y estado de confiabilidad visible cuando aplique.
- Pagina publica de metodologia y definiciones de la escala de impacto IA.
- Selector visible de idioma de interfaz con soporte para `en` y `es`.

## 2. Autenticacion Y Cuenta
- Registro por email y contrasena.
- Inicio de sesion y recuperacion de contrasena.
- Aceptacion de terminos al registrarse.
- Perfil basico editable con nombre visible y datos no sensibles permitidos.
- Vista de historial basico del usuario sobre sus propuestas de actividades y evidencias.

## 3. Actividades
- Alta de propuesta de nueva actividad por usuario autenticado.
- Edicion por autor mientras la propuesta siga pendiente y no haya sido tomada en revision.
- Asociacion de actividad a uno o mas rubros y una o mas categorias funcionales.
- Seleccion obligatoria de nivel de granularidad: tarea, funcion, rol o profesion.
- Identidad unica de actividad dentro de su contexto logico.
- Deteccion o advertencia de posibles duplicados aproximados antes de guardar o aprobar.
- Publicacion solo para actividades con estado editorial aprobado.
- Visualizacion publica del estado oficial vigente y del resumen editorial.

## 4. Evidencias
- Alta de propuesta de nueva evidencia por usuario autenticado.
- Vinculacion de una evidencia a una o mas actividades.
- Clasificacion obligatoria por tipo de evidencia.
- Carga obligatoria de titulo, resumen, contexto verificable y fuente textual.
- URL opcional, almacenada completa si se provee.
- Fecha del hecho opcional y fecha de alta obligatoria.
- Marcado editorial o de moderacion para evidencia desactualizada, archivada o de baja confiabilidad.
- Publicacion solo para evidencias aprobadas.

## 5. Comentarios
- Comentarios de usuarios autenticados sobre actividades y evidencias.
- Respuesta a comentarios en un hilo simple.
- Reporte de comentarios por otros usuarios autenticados.
- Publicacion inmediata por defecto con opcion de denuncia.
- Estado logico de comentario para visible, oculto, archivado o equivalente funcional.
- Los comentarios eliminados no se borran fisicamente en el MVP.

## 6. Moderacion
- Cola de revision para actividades propuestas, evidencias propuestas y comentarios reportados.
- Acciones disponibles: aprobar, rechazar, solicitar correccion, archivar u ocultar segun el tipo de contenido.
- Registro de quien tomo la accion, cuando y con que motivo basico.
- Vista de pendientes por tipo, estado y fecha.

## 7. Editorial
- Revision de evidencias asociadas a una actividad aprobada.
- Cambio de estado oficial de avance IA solo por editor o administrador.
- Fundamento editorial obligatorio en cada cambio de estado oficial.
- Edicion de resumen editorial visible.
- Gestion de contenido destacado si se considera necesario en el MVP.

## 8. Taxonomias Y Administracion
- Gestion de rubros.
- Gestion de categorias funcionales.
- Gestion de tipos de evidencia.
- Gestion de usuarios y roles.
- Gestion basica de estados auxiliares si se mantienen visibles en backoffice.

## 9. Auditoria E Historial
- Registro de creacion y modificacion de contenido relevante.
- Registro del historial de cambios de estado editorial.
- Registro del historial del estado oficial de avance IA con actor, fecha y fundamento.
- Trazabilidad suficiente para reconstruir decisiones editoriales del MVP.

## 10. Internacionalizacion
- UI sin textos hardcodeados.
- Idioma por defecto definido.
- Fallback funcional cuando no exista traduccion de contenido o interfaz.
- Entidades base unicas con tablas de traduccion para contenido traducible.
- El contenido faltante en un idioma no debe romper navegacion, administracion ni indexacion.

## 11. SEO Operativo Del MVP
- Rutas amigables para actividades publicas.
- Titulo SEO y meta descripcion por actividad.
- Encabezados semanticos y contenido indexable suficiente por ficha.
- Estructura apta para metadatos por locale y compatible con rutas por idioma si la arquitectura las adopta.
- Enlaces a actividades relacionadas o equivalentes funcionales cuando existan datos.

## 12. Seed Inicial
- El seed inicial oficial para la primera salida publica queda definido por [seed_portal_impacto_ia_bilingue_completo.csv](seed_portal_impacto_ia_bilingue_completo.csv).
- El archivo aporta 550 filas de datos y debe tratarse como insumo oficial del lanzamiento inicial.
- La arquitectura y el backend deben contemplar validacion, limpieza e importacion controlada de este seed.

## Fuera De Alcance
- App mobile nativa en el MVP.
- Monetizacion activa.
- API publica.
- Comparador avanzado.
- Sistema complejo de reputacion.
- Gamificacion.
- Alertas avanzadas.
- Ingesta automatica de noticias.
- Dashboards premium avanzados.
- Publicacion completa del catalogo en ambos idiomas desde el dia 1.
- Scoring predictivo sofisticado.

## Requerimientos No Funcionales

## Seguridad
- Autenticacion segura y control de permisos por rol.
- Sanitizacion de entradas en formularios de actividad, evidencia y comentarios.
- Proteccion basica anti spam y anti abuso en flujos abiertos a usuarios.
- Acciones editoriales y administrativas auditables.

## Performance
- Carga rapida en paginas publicas de alto trafico.
- Soporte funcional para paginacion, carga incremental o equivalente en listados extensos.
- Busqueda y filtros con tiempos de respuesta aceptables para catalogo inicial.

## Escalabilidad
- Separacion clara entre capas de frontend, backend y persistencia.
- Modelo apto para crecimiento fuerte de contenido, idiomas y relaciones many-to-many.
- Posibilidad de agregar automatizaciones futuras sin rehacer el modelo funcional.

## Mantenibilidad
- Modulos con responsabilidades funcionales claras.
- Convenciones consistentes de estados, roles, nomenclatura y taxonomias.
- Documentacion suficiente para continuar con arquitectura e implementacion.

## Observabilidad
- Logs de errores tecnicos.
- Logs de acciones criticas de moderacion, editorial y administracion.
- Registro de eventos relevantes del negocio, al menos para altas, aprobaciones y cambios editoriales.

## SEO E Internacionalizacion
- Contenido y metadatos aptos para indexacion por idioma.
- Politica de fallback que no genere paginas rotas ni loops de navegacion.
- El uso de rutas separadas por locale es una recomendacion inicial y no una obligacion funcional cerrada.

## Contexto Tecnico Confirmado
- No hay restricciones duras de plazo, presupuesto o equipo informadas en esta etapa.
- Stack preferido para la solucion tecnica: Next.js, NestJS, PostgreSQL, Prisma, autenticacion propia con JWT o sesion externalizable a futuro, Resend para emails de aplicacion, Hostinger Email para correo humano u operativo, y Docker Compose sobre VPS Hostinger.
- Estas preferencias deben ser tomadas por `software_architect` como punto de partida, no como decision tecnica irrevocable.

## Reglas De Negocio
- La actividad es la entidad central del producto y no debe duplicarse por idioma.
- Cada actividad publica tiene un unico estado oficial vigente.
- El estado oficial no cambia automaticamente por cantidad de evidencias o aportes.
- Toda actividad publica debe mostrar resumen editorial visible.
- Toda evidencia requiere tipo, titulo, resumen y contexto verificable.
- Una evidencia aprobada puede vincularse a multiples actividades.
- Solo actividades y evidencias aprobadas son publicas.
- Solo editor o administrador pueden cambiar el estado oficial de avance IA.
- Los comentarios requieren autenticacion y no se eliminan fisicamente en el MVP.
- La ausencia de traduccion no puede romper la operacion.

## Supuestos
- El MVP queda confirmado como web-only responsive, con preparacion funcional para una posible experiencia mobile futura.
- La experiencia mobile futura reutilizara reglas de negocio, taxonomias, permisos y contratos, sin requerir cambios de alcance funcional del MVP actual.
- La politica inicial de comentarios confirmada es publicacion inmediata con opcion clasica de denuncia.
- El seed inicial oficial queda definido por el CSV incluido en `docs/`.
- La recomendacion de SEO multiidioma con rutas separadas por locale se mantiene como recomendacion inicial y no como requisito cerrado.
- La implementacion del MVP se ejecutara en olas internas, con construccion, testing y validacion por etapas antes del lanzamiento a produccion.

## Riesgos, Restricciones Y Dependencias
- El alcance del MVP sigue siendo amplio y requiere secuenciacion interna aun si no se recorta funcionalmente.
- La definicion exacta del comportamiento de duplicados aproximados depende de arquitectura y datos.
- La carga, consistencia y completitud del CSV de seed debe validarse tecnicamente antes de importacion.
- La preferencia tecnica declarada debe contrastarse con requerimientos de SEO, backoffice y trazabilidad antes de cerrarla como arquitectura objetivo.
- La arquitectura debera resolver busqueda, locales, SEO y auditoria sin contradecir estas reglas funcionales.

## Decisiones Humanas Pendientes
No hay decisiones humanas criticas pendientes sobre el alcance funcional en esta etapa.

## Recomendacion De Secuenciacion Del MVP
- Ola 1: autenticacion, taxonomias base, actividades publicas, evidencias publicas, home, metodologia, i18n base y SEO basico.
- Ola 2: propuestas de actividades y evidencias, perfil basico de usuario y comentarios.
- Ola 3: moderacion, editorial, auditoria e historial completo, gestion de usuarios y taxonomias desde backoffice.

## Backlog Por Especialidad

## Arquitectura
- ARQ-01: Definir limites funcionales entre portal publico, area autenticada y backoffice.
- ARQ-02: Disenar modelo conceptual y relacional alineado con actividades, traducciones, evidencias, comentarios, moderacion e historial editorial.
- ARQ-03: Formalizar estados y transiciones para actividad, evidencia, comentario y acciones de moderacion.
- ARQ-04: Definir estrategia de permisos por rol y trazabilidad auditable.
- ARQ-05: Definir contratos funcionales para busqueda, filtros, detalle de actividad, detalle de evidencia y acciones de backoffice.
- ARQ-06: Definir estrategia funcional para i18n de interfaz y contenido, incluyendo fallback.
- ARQ-07: Definir estrategia para SEO multiidioma, slugs y metadatos por actividad.
- ARQ-08: Disenar soporte para seed data editorial e importacion controlada del CSV inicial.
- ARQ-09: Evaluar la adecuacion del stack preferido y documentar ajustes solo si fueran necesarios.

## UX/UI
- UX-01: Definir arquitectura de informacion del sitio publico y backoffice.
- UX-02: Disenar patrones de navegacion para home, exploracion, detalle de actividad, detalle de evidencia y metodologia.
- UX-03: Disenar formularios de propuesta de actividad, propuesta de evidencia y autenticacion.
- UX-04: Disenar representacion clara de la escala 0 a 5 de avance IA.
- UX-05: Definir diferenciacion visual entre contenido editorial y contenido comunitario.
- UX-06: Disenar flujos de moderacion y editorial en backoffice.
- UX-07: Definir comportamiento funcional del selector de idioma y estados de fallback.
- UX-08: Definir vacios, errores, contenido faltante y mensajes clave del MVP.

## Backend
- BE-01: Implementar dominio de usuarios, roles y permisos.
- BE-02: Implementar dominio de actividades, sus estados editoriales y su estado oficial vigente.
- BE-03: Implementar dominio de evidencias y relacion many-to-many con actividades.
- BE-04: Implementar comentarios, respuestas, reportes y estados logicos sin borrado fisico.
- BE-05: Implementar cola de moderacion y acciones asociadas.
- BE-06: Implementar historial editorial y auditoria de acciones criticas.
- BE-07: Implementar taxonomias visibles y administrativas.
- BE-08: Implementar soporte a traducciones, slugs y metadatos por locale.
- BE-09: Exponer capacidades de busqueda y filtros requeridas por el frontend web.
- BE-10: Soportar carga, validacion y mantenimiento del seed inicial.

## Frontend Web
- FEW-01: Implementar home publica y pagina de metodologia.
- FEW-02: Implementar buscador global, filtros y listado de actividades.
- FEW-03: Implementar detalle publico de actividad.
- FEW-04: Implementar detalle publico de evidencia.
- FEW-05: Implementar autenticacion, recuperacion de contrasena y perfil basico.
- FEW-06: Implementar formularios de propuesta de actividad y evidencia.
- FEW-07: Implementar comentarios y reportes visibles para usuarios autenticados.
- FEW-08: Implementar area privada del usuario para ver sus propuestas.
- FEW-09: Implementar backoffice de moderacion, editorial, taxonomias y usuarios.
- FEW-10: Implementar selector de idioma, fallback y metadatos SEO funcionales.

## Frontend Mobile
- FEM-01: Sin implementacion en el MVP.
- FEM-02: Revisar la especificacion funcional para asegurar que reglas, permisos y contratos no bloqueen una app mobile futura.
- FEM-03: Preparar listado de dependencias funcionales que deberan preservarse si se abre una etapa mobile posterior.

## Testing
- QA-01: Derivar casos de prueba funcionales por modulo y por rol.
- QA-02: Validar criterios de aceptacion del portal publico, autenticacion, propuestas, comentarios y backoffice.
- QA-03: Validar permisos por rol y restricciones editoriales.
- QA-04: Validar flujos de idioma, fallback y visibilidad publica.
- QA-05: Validar trazabilidad de acciones de moderacion y editorial.
- QA-06: Validar reglas de publicacion y no publicacion por estado.
- QA-07: Preparar matriz de pruebas para seed data inicial, validacion de CSV y vacios de catalogo.

## Criterios De Aceptacion Verificables

## Portal Publico
- AC-PUB-01: Un visitante puede abrir la home y entender el proposito del portal sin autenticarse.
- AC-PUB-02: Un visitante puede buscar actividades por texto libre y recibir resultados relevantes dentro del catalogo aprobado.
- AC-PUB-03: Un visitante puede filtrar por rubro, categoria y nivel de impacto IA.
- AC-PUB-04: Un visitante puede abrir una actividad aprobada y ver estado oficial, resumen editorial y evidencias aprobadas.
- AC-PUB-05: Un visitante puede abrir una evidencia aprobada y ver tipo, contexto, fuente y actividades asociadas.
- AC-PUB-06: Un visitante puede acceder a metodologia y definiciones de la escala 0 a 5.

## Autenticacion Y Cuenta
- AC-AUT-01: Un usuario puede registrarse con email, contrasena y aceptacion de terminos.
- AC-AUT-02: Un usuario puede iniciar sesion y cerrar sesion.
- AC-AUT-03: Un usuario puede solicitar recuperacion de contrasena.
- AC-AUT-04: Un usuario autenticado puede editar su perfil basico.

## Actividades
- AC-ACT-01: Un usuario autenticado puede enviar una propuesta de actividad con todos los campos obligatorios.
- AC-ACT-02: El sistema no publica automaticamente una actividad propuesta.
- AC-ACT-03: El autor puede editar una propuesta pendiente mientras no haya sido revisada.
- AC-ACT-04: Una actividad aprobada puede pertenecer a multiples rubros y categorias.
- AC-ACT-05: Una actividad publica muestra un unico estado oficial vigente.

## Evidencias
- AC-EVI-01: Un usuario autenticado puede proponer una evidencia vinculada a una o mas actividades.
- AC-EVI-02: El sistema exige tipo, titulo, resumen y contexto verificable para guardar una evidencia.
- AC-EVI-03: Una evidencia aprobada no modifica automaticamente el estado oficial de la actividad.
- AC-EVI-04: Una evidencia puede marcarse desde backoffice como desactualizada o de baja confiabilidad.

## Comentarios
- AC-COM-01: Solo usuarios autenticados pueden comentar actividades o evidencias.
- AC-COM-02: Los comentarios admiten respuesta en hilo simple.
- AC-COM-03: Un comentario puede reportarse y pasar a revision.
- AC-COM-04: Un comentario oculto o archivado deja de mostrarse publicamente sin borrarse fisicamente.
- AC-COM-05: Un comentario nuevo se publica de inmediato y puede denunciarse desde la interfaz.

## Moderacion
- AC-MOD-01: Un moderador puede ver una cola con pendientes por tipo y estado.
- AC-MOD-02: Un moderador puede aprobar, rechazar o solicitar correccion sobre propuestas.
- AC-MOD-03: Las acciones de moderacion quedan registradas con actor y fecha.
- AC-MOD-04: Solo contenido aprobado se vuelve visible en frontend publico.

## Editorial
- AC-EDI-01: Solo editor o administrador pueden cambiar el estado oficial de avance IA.
- AC-EDI-02: Todo cambio de estado oficial exige fundamento editorial obligatorio.
- AC-EDI-03: El sistema registra historial del cambio y lo conserva para auditoria.
- AC-EDI-04: El resumen editorial visible puede actualizarse desde backoffice.

## Administracion Y Taxonomias
- AC-ADM-01: Un administrador puede crear, editar y desactivar taxonomias base.
- AC-ADM-02: Un administrador puede gestionar usuarios y roles.
- AC-ADM-03: Las taxonomias visibles se reflejan en formularios y filtros del portal.

## Internacionalizacion Y SEO
- AC-I18N-01: La UI puede mostrarse en `en` y `es`.
- AC-I18N-02: Cuando falta una traduccion, el sistema aplica fallback sin romper la vista.
- AC-I18N-03: Una actividad publica dispone de ruta amigable y metadatos SEO por locale cuando exista traduccion.
- AC-I18N-04: La ausencia de traduccion de un contenido no impide administrar la entidad base.
- AC-I18N-05: El sistema no depende obligatoriamente de rutas separadas por locale para cumplir este MVP.

## Seed Inicial
- AC-SEED-01: El sistema puede importar el CSV oficial de seed sin perder columnas clave ni relaciones basicas.
- AC-SEED-02: La importacion detecta filas invalidas o incompletas y las reporta.
- AC-SEED-03: El seed cargado permite poblar la primera salida publica sin sensacion de catalogo vacio.

## Paquete De Handoff Listo Para Siguientes Agentes

## Entrada Para Software Architect
- Este documento como fuente principal de alcance operativo.
- Requerimiento funcional formal y brief inicial como respaldo.
- El CSV oficial de seed y las preferencias tecnicas confirmadas por negocio.
- Necesidad de cerrar contratos, modelo de datos, permisos, trazabilidad, i18n, SEO funcional y estrategia de importacion del seed.

## Entrada Para UX/UI
- Este documento como fuente principal de flujos, modulos, roles y prioridades.
- Necesidad de producir experiencia clara para portal publico, formularios y backoffice.
- Necesidad de representar escala IA y separacion entre contenido editorial y comunitario.

## Entrada Para Backend
- Este documento y la arquitectura aprobada.
- Necesidad de implementar reglas de negocio, roles, moderacion, editorial, auditoria, i18n, SEO de contenido e importacion del seed.

## Entrada Para Frontend Web
- Este documento, arquitectura aprobada y especificacion UX/UI accionable.
- Necesidad de cubrir publico, autenticacion, contribucion, comentarios y backoffice.

## Entrada Para Testing
- Este documento, arquitectura aprobada, UX/UI aprobada y backlog de implementacion.
- Necesidad de derivar casos por rol, modulo, estado, locale y calidad del seed.

## Sugerencias De Actualizacion Para `templates/project-state.md`
- Marcar Gate 1 como aprobado.
- Cambiar siguiente agente recomendado a `software_architect`.
- Registrar las decisiones ya cerradas sobre web-only, comentarios, seed y SEO multiidioma.
- Registrar que la implementacion sera por olas internas con una unica salida final a produccion.
