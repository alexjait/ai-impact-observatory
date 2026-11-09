# REQ funcional formal para desarrollo asistido por IA

## Producto: Portal de actividades impactadas, reemplazadas o transformadas por IA

\---

## 1\. Objetivo del documento

Este documento define en forma operativa y estructurada los requerimientos funcionales y lineamientos principales para construir un portal web orientado a registrar, analizar, discutir y evidenciar cómo la Inteligencia Artificial impacta, transforma o reemplaza actividades humanas concretas.

El objetivo es que este REQ pueda ser utilizado como base directa para desarrollo asistido por IA, desarrollo tradicional o una combinación de ambos.

Este documento está pensado especialmente para:

* traducir la visión de producto a módulos implementables
* delimitar el alcance del MVP
* dejar claras las reglas de negocio
* servir de base para AGENTS.md, prompts por etapas, modelo de datos y roadmap técnico

\---

## 2\. Visión del producto

El portal será una plataforma pública y colaborativa donde los usuarios podrán:

* buscar actividades, tareas, funciones y profesiones de distintos rubros
* visualizar el estado de avance de la IA sobre cada actividad
* consultar evidencias asociadas, como noticias, casos reales, herramientas, estudios o métricas
* aportar comentarios, experiencias, pruebas y nuevas evidencias
* debatir el grado de reemplazo, automatización o transformación que la IA está produciendo
* acceder a una base estructurada y trazable sobre el impacto real de la IA en el trabajo

La plataforma no debe ser solo un directorio. Debe evolucionar como un observatorio serio, colaborativo y curado, con trazabilidad, moderación y estructura de datos sólida.

\---

## 3\. Objetivo del producto

### 3.1 Objetivo principal

Construir una base de conocimiento navegable, escalable y confiable sobre actividades humanas que están siendo asistidas, aceleradas, parcialmente reemplazadas o fuertemente sustituidas por IA.

### 3.2 Objetivos secundarios

* ayudar a profesionales a comprender el riesgo y la oportunidad en su trabajo
* permitir a empresas monitorear áreas funcionales afectadas por IA
* ofrecer un repositorio de evidencias reales y trazables
* diferenciar claramente entre opinión, evidencia y estado editorial
* facilitar crecimiento SEO por actividades, tareas, profesiones, sectores y tipos de impacto
* dejar una base apta para monetización futura, informes, planes premium y API

\---

## 4\. Problema que resuelve

Hoy la información sobre el impacto laboral de la IA está dispersa en noticias, papers, redes sociales, videos, demos, publicaciones de empresas y testimonios aislados.

Eso genera varios problemas:

* no hay una fuente centralizada
* cuesta distinguir hype de evidencia real
* no existe una taxonomía homogénea por actividad
* las discusiones suelen ser generales y poco útiles
* no es fácil responder qué tareas concretas están cambiando primero

El portal busca resolver esto organizando información por actividad, rubro, evidencia, grado de impacto y trazabilidad editorial.

\---

## 5\. Alcance conceptual

El sistema debe poder representar el impacto de la IA en distintos niveles de granularidad.

### 5.1 Niveles de granularidad soportados

#### Tarea

Ejemplos:

* redactar emails comerciales
* transcribir audios
* clasificar facturas
* generar casos de prueba
* resumir contratos

#### Función

Ejemplos:

* atención al cliente
* testing de software
* reclutamiento
* soporte administrativo
* marketing de contenidos

#### Rol

Ejemplos:

* operador de call center
* analista contable
* diseñador gráfico
* abogado junior
* soporte técnico nivel 1

#### Profesión

Ejemplos:

* traductor
* programador junior
* redactor publicitario
* diseñador gráfico

### 5.2 Definición clave

La plataforma debe priorizar el análisis por actividad concreta y no solo por profesión, porque en muchos casos la IA reemplaza primero tareas específicas y no el rol completo.

\---

## 6\. Principios del producto

1. Basado en evidencia.
2. Colaborativo.
3. Curado.
4. Trazable.
5. Neutral en términos ideológicos.
6. Granular.
7. Escalable.
8. Preparado para evolución temporal.
9. Apto para SEO.
10. Preparado para multiidioma.

\---

## 7\. Estrategia de idiomas

### 7.1 Decisión tomada

El portal debe diseñarse para soportar múltiples idiomas desde el inicio.

### 7.2 Idiomas iniciales soportados por la plataforma

* inglés (`en`)
* español (`es`)

### 7.3 Recomendación de lanzamiento

El MVP debe lanzarse con prioridad editorial en inglés, dejando la arquitectura, la UI y el modelo de datos preparados para expandir contenido en español sin refactor estructural.

### 7.4 Regla de modelado

No se deben duplicar entidades de negocio por idioma. Debe existir una entidad base única y tablas de traducción asociadas.

\---

## 8\. Alcance del MVP

El MVP debe incluir únicamente lo necesario para validar la propuesta de valor, comenzar a poblar la base de conocimiento y probar la interacción entre contenido curado y colaboración de usuarios.

### 8.1 Incluido en MVP

* sitio público navegable
* home pública
* buscador global
* exploración por rubros y categorías
* listado de actividades
* página de detalle de actividad
* página de detalle de evidencia
* metodología pública
* registro e inicio de sesión
* perfil básico de usuario
* propuesta de nuevas actividades
* propuesta de nuevas evidencias
* comentarios sobre actividades y evidencias
* backoffice de moderación
* backoffice editorial
* gestión de taxonomías base
* historial editorial mínimo
* SEO básico por actividad
* interfaz internacionalizable
* arquitectura preparada para `en` y `es`

### 8.2 Excluido del MVP

* monetización activa
* API pública
* comparador avanzado
* sistema complejo de reputación
* gamificación
* alertas avanzadas
* ingesta automática de noticias
* dashboards premium avanzados
* publicación completa del catálogo en múltiples idiomas desde el día 1
* scoring predictivo sofisticado

\---

## 9\. Roles de usuario del MVP

### 9.1 Visitante

Puede navegar, buscar, filtrar y visualizar contenido público.

### 9.2 Usuario registrado

Puede comentar, proponer actividades y proponer evidencias.

### 9.3 Moderador

Puede revisar propuestas, comentarios y reportes.

### 9.4 Editor

Puede cambiar el estado oficial de avance IA y consolidar criterio editorial.

### 9.5 Administrador

Puede gestionar usuarios, roles, taxonomías y configuraciones generales.

\---

## 10\. Definición del estado de avance de IA

Cada actividad debe tener un único estado oficial vigente.

### 10.1 Escala

#### 0 - Sin impacto relevante detectado

No hay evidencia suficiente de impacto real.

#### 1 - Asistencia puntual

La IA ayuda en partes menores, sin alterar significativamente la actividad.

#### 2 - Aumento de productividad significativo

La IA acelera fuertemente la actividad, pero el humano sigue siendo claramente central.

#### 3 - Reemplazo parcial operativo

Una parte sustancial de la actividad ya puede realizarse con IA con intervención humana reducida.

#### 4 - Reemplazo mayoritario en escenarios concretos

En algunos contextos reales, la mayor parte de la actividad ya puede ejecutarse con IA.

#### 5 - Reemplazo casi total o total en casos reales

Existen casos verificables donde la actividad fue sustituida total o casi totalmente por IA.

### 10.2 Regla importante

El estado oficial visible no debe cambiar automáticamente solo por cantidad de aportes. Debe existir intervención editorial o reglas de validación explícitas.

\---

## 11\. Tipos de evidencia admitida

### 11.1 Tipologías

* noticia
* caso real empresarial
* herramienta o producto
* paper o estudio
* testimonio profesional
* evidencia multimedia
* métrica o dato cuantitativo

### 11.2 Regla básica

Toda evidencia debe contar con contexto mínimo verificable. No alcanza con una afirmación aislada sin descripción.

\---

## 12\. Módulos funcionales del MVP

## 12.1 Módulo público

Incluye toda la experiencia abierta al visitante.

### Funciones

* visualizar home
* usar buscador
* explorar por rubro, categoría y nivel de impacto
* abrir fichas de actividad
* abrir fichas de evidencia
* ver comentarios públicos
* acceder a metodología
* cambiar idioma de interfaz

## 12.2 Módulo de autenticación y cuenta

### Funciones

* registro por email y contraseña
* inicio de sesión
* recuperación de contraseña
* edición básica de perfil
* aceptación de términos

## 12.3 Módulo de actividades

### Funciones

* proponer nueva actividad
* visualizar actividades aprobadas
* editar propuesta pendiente por parte del autor si aún no fue revisada
* asociar actividad a rubros y categorías
* definir nivel de granularidad
* visualizar estado oficial de avance IA
* visualizar resumen editorial

## 12.4 Módulo de evidencias

### Funciones

* proponer nueva evidencia
* vincular evidencia a una o más actividades
* clasificar evidencia por tipo
* registrar fuente, resumen, contexto y fechas relevantes
* visualizar evidencias aprobadas públicamente
* marcar evidencia como desactualizada o de baja confiabilidad desde backoffice

## 12.5 Módulo de comentarios

### Funciones

* comentar una actividad
* comentar una evidencia
* responder comentarios
* reportar comentarios
* moderar comentarios

## 12.6 Módulo de moderación

### Funciones

* ver cola de revisión
* aprobar, rechazar o solicitar corrección
* revisar reportes
* archivar contenido
* gestionar comentarios reportados

## 12.7 Módulo editorial

### Funciones

* revisar evidencias de una actividad
* actualizar estado oficial de avance IA
* registrar fundamento editorial obligatorio
* editar resumen editorial
* gestionar contenido destacado

## 12.8 Módulo de taxonomías

### Funciones

* gestionar rubros
* gestionar categorías funcionales
* gestionar tipos de evidencia
* gestionar estados visibles o etiquetas auxiliares si aplica

## 12.9 Módulo de auditoría e historial

### Funciones

* registrar quién crea y modifica contenido
* registrar cambios de estado editorial
* registrar cambios del estado oficial de avance IA
* dejar trazabilidad temporal de decisiones editoriales

\---

## 13\. Taxonomía mínima del MVP

### 13.1 Niveles de granularidad

* tarea
* función
* rol
* profesión

### 13.2 Estados de avance IA

* 0 sin impacto relevante detectado
* 1 asistencia puntual
* 2 aumento de productividad significativo
* 3 reemplazo parcial operativo
* 4 reemplazo mayoritario en escenarios concretos
* 5 reemplazo casi total o total en casos reales

### 13.3 Tipos de evidencia

* noticia
* caso real empresarial
* herramienta o producto
* paper o estudio
* testimonio profesional
* evidencia multimedia
* métrica o dato cuantitativo

### 13.4 Estados de moderación

* pendiente
* aprobado
* rechazado
* requiere corrección
* archivado

### 13.5 Idiomas soportados por plataforma

* en
* es

### 13.6 Idioma de lanzamiento recomendado

* en

\---

## 14\. Flujos funcionales

## 14.1 Flujo de navegación pública

1. El visitante entra a la home.
2. Usa buscador o navegación por categorías.
3. Encuentra una actividad.
4. Ingresa al detalle.
5. Visualiza estado, resumen, evidencias y comentarios.
6. Si quiere aportar, se le solicita autenticación.

## 14.2 Flujo de propuesta de actividad

1. Usuario autenticado ingresa a la pantalla de propuesta.
2. Completa formulario.
3. El sistema valida campos obligatorios.
4. La propuesta queda pendiente.
5. Moderador o editor revisa.
6. Se aprueba, rechaza o solicita corrección.
7. Si se aprueba, la actividad pasa a pública.

## 14.3 Flujo de propuesta de evidencia

1. Usuario autenticado ingresa a la pantalla de nueva evidencia.
2. Selecciona actividad existente o indica contexto.
3. Completa datos requeridos.
4. El sistema valida mínimos obligatorios.
5. La propuesta queda pendiente.
6. Moderador o editor revisa.
7. Si se aprueba, la evidencia se publica y se vincula.

## 14.4 Flujo de actualización editorial

1. El editor ingresa al backoffice.
2. Abre una actividad aprobada.
3. Revisa evidencias asociadas.
4. Cambia el estado oficial si corresponde.
5. Escribe un fundamento editorial obligatorio.
6. El sistema registra historial.
7. La ficha pública refleja el nuevo estado.

## 14.5 Flujo de comentarios

1. Usuario autenticado comenta actividad o evidencia.
2. El comentario queda publicado o moderado según política.
3. Otros usuarios pueden responder o reportarlo.
4. Moderación puede ocultarlo, archivarlo o desactivarlo.

\---

## 15\. Pantallas mínimas del MVP

## 15.1 Públicas

* home
* explorar actividades
* detalle de actividad
* detalle de evidencia
* metodología
* iniciar sesión
* registro

## 15.2 Privadas para usuario

* mi perfil
* mis propuestas de actividades
* mis propuestas de evidencias
* nueva propuesta de actividad
* nueva propuesta de evidencia

## 15.3 Backoffice

* dashboard básico interno
* cola de moderación
* gestión de actividades
* gestión de evidencias
* gestión de comentarios
* gestión de taxonomías
* gestión de usuarios
* historial editorial

\---

## 16\. Reglas funcionales y de negocio

## 16.1 Sobre actividades

* una actividad debe tener identidad propia y única dentro de su contexto lógico
* debe existir control de duplicados aproximados
* una actividad puede pertenecer a múltiples rubros
* una actividad puede pertenecer a múltiples categorías
* una actividad debe tener un único estado oficial vigente
* toda actividad pública debe tener resumen editorial visible
* una actividad conceptual no debe duplicarse por idioma

## 16.2 Sobre evidencias

* toda evidencia debe tener tipo, título, resumen y contexto mínimo verificable
* la URL es opcional, pero si se informa debe almacenarse completa
* una evidencia puede asociarse a múltiples actividades
* una evidencia aprobada no cambia automáticamente el estado oficial de la actividad
* una evidencia puede marcarse como desactualizada, archivada o de baja confiabilidad

## 16.3 Sobre comentarios

* solo usuarios autenticados pueden comentar
* los comentarios pueden ser moderados
* los comentarios eliminados no deben borrarse físicamente en MVP
* debe existir al menos un estado lógico para ocultación o archivo

## 16.4 Sobre moderación y editorial

* todo cambio editorial debe quedar auditado
* todo cambio del estado oficial de avance IA requiere fundamento obligatorio
* solo editor o administrador pueden cambiar el estado oficial
* moderador puede aprobar o rechazar propuestas, pero no necesariamente redefinir el estado oficial si ese permiso queda reservado al editor

## 16.5 Sobre visibilidad

* solo actividades aprobadas son públicas
* solo evidencias aprobadas son públicas
* solo comentarios visibles y no moderados se muestran en frontend

## 16.6 Sobre idiomas

* la interfaz no debe tener textos hardcodeados
* debe existir un idioma por defecto
* debe existir fallback cuando una traducción no esté disponible
* la ausencia de traducción no debe romper navegación ni administración

\---

## 17\. Campos mínimos obligatorios por entidad

## 17.1 Actividad

* título
* slug
* descripción breve
* descripción extendida
* nivel de granularidad
* estado oficial de avance IA
* resumen editorial
* estado editorial
* fecha de creación
* usuario creador

## 17.2 Evidencia

* tipo de evidencia
* título
* resumen
* descripción o contexto
* fuente textual
* URL opcional
* fecha del hecho opcional
* estado de moderación
* usuario creador
* fecha de creación

## 17.3 Comentario

* texto
* usuario autor
* entidad objetivo
* estado
* fecha de creación

## 17.4 Usuario

* nombre visible
* email
* hash de password o proveedor de autenticación
* rol
* estado de cuenta
* fecha de alta

\---

## 18\. Modelo conceptual de datos

## 18.1 Entidades principales

* users
* roles
* activities
* activity\_translations
* industries
* industry\_translations
* functional\_categories
* functional\_category\_translations
* evidence
* evidence\_activities
* comments
* moderation\_actions
* editorial\_activity\_status\_history
* reports

## 18.2 Relaciones principales

* un usuario crea muchas propuestas de actividad
* un usuario crea muchas evidencias
* una actividad puede tener muchas evidencias
* una evidencia puede aplicar a muchas actividades
* una actividad puede pertenecer a muchos rubros
* una actividad puede pertenecer a muchas categorías
* una actividad puede tener muchas traducciones
* una categoría puede tener muchas traducciones
* una actividad puede tener muchos comentarios
* una evidencia puede tener muchos comentarios
* una actividad puede tener muchos cambios históricos de estado

\---

## 19\. Lineamientos de modelado de datos

* evitar estructuras críticas enteras en JSON cuando corresponda una entidad relacional
* usar tablas intermedias para relaciones many-to-many
* permitir soft delete donde tenga sentido editorial o de auditoría
* incluir created\_at, updated\_at y created\_by donde corresponda
* mantener slugs únicos para contenido público
* separar claramente estado editorial de estado de avance IA
* separar entidad base de contenido traducible
* no duplicar lógica de negocio por idioma

### 19.1 Estrategia recomendada de traducciones

Patrón sugerido:

* entidad base única
* tabla de traducciones por entidad

Ejemplo:

* activities
* activity\_translations

La entidad base debe contener:

* identificador
* relaciones
* estados
* fechas
* metadatos internos

La tabla de traducciones debe contener:

* locale
* title
* short\_description
* full\_description
* editorial\_summary
* seo\_title
* seo\_description
* slug por idioma si se adopta ese enfoque

\---

## 20\. Lineamientos UX/UI

* la home debe explicar muy rápido el propósito del portal
* la escala de avance IA debe entenderse sin ambigüedad
* la actividad debe ser el objeto central de navegación
* la evidencia debe ser visible, clara y escaneable
* debe quedar claro qué es contenido editorial y qué es contenido aportado por la comunidad
* el sitio debe transmitir confianza, trazabilidad y neutralidad
* debe existir selector de idioma visible y consistente
* los textos de interfaz deben salir de archivos o sistema de traducción
* la experiencia debe ser clara tanto para visitante como para colaborador

### 20.1 Recomendación de lanzamiento

* interfaz soportando `en` y `es`
* contenido editorial inicial prioritariamente en inglés
* expansión gradual de español sobre contenido priorizado

\---

## 21\. SEO y descubrimiento

Cada actividad pública debe tener:

* URL amigable
* título SEO
* meta descripción
* encabezados semánticos
* contenido suficiente para indexación
* enlaces o relaciones hacia actividades similares

La arquitectura debe facilitar long tail SEO sobre:

* actividades por industria
* tareas por profesión
* impacto de IA por rubro
* reemplazo de tareas específicas

### 21.1 SEO multiidioma recomendado

* rutas por idioma, por ejemplo `/en/...` y `/es/...`
* metadatos SEO por idioma
* canonical y hreflang
* política de fallback cuando aún no exista traducción
* el contenido faltante en un idioma no debe romper indexación ni navegación

\---

## 22\. Requerimientos no funcionales

## 22.1 Seguridad

* autenticación segura
* control de permisos por rol
* protección anti spam en formularios
* sanitización de entradas
* protección básica ante abuso

## 22.2 Performance

* carga rápida de páginas públicas
* paginación o lazy loading donde corresponda
* índices adecuados para búsqueda y filtros

## 22.3 Escalabilidad

* arquitectura preparada para crecimiento fuerte de contenido
* separación clara entre frontend, backend y persistencia
* posibilidad de sumar automatizaciones futuras

## 22.4 Mantenibilidad

* código modular
* convenciones consistentes
* tipado fuerte si la tecnología lo permite
* separación clara de responsabilidades

## 22.5 Observabilidad

* logs de errores
* logs de acciones críticas del backoffice
* registro de eventos relevantes de negocio

\---

## 23\. Criterios de aceptación globales del MVP

## 23.1 Navegación

* un visitante puede encontrar actividades por texto libre
* un visitante puede navegar por categorías
* un visitante puede abrir una ficha y comprender el estado de avance IA

## 23.2 Contribución

* un usuario autenticado puede proponer una actividad
* un usuario autenticado puede proponer una evidencia
* un usuario autenticado puede comentar

## 23.3 Moderación

* un moderador puede ver una cola de pendientes
* un moderador puede aprobar, rechazar o solicitar corrección

## 23.4 Editorial

* un editor puede cambiar el estado oficial
* todo cambio editorial queda auditado

## 23.5 Administración

* un administrador puede gestionar taxonomías
* un administrador puede gestionar usuarios y roles

## 23.6 Idiomas

* la UI puede mostrarse en `en` y `es`
* el sistema soporta fallback sin romper contenido
* la arquitectura permite ampliar traducciones sin duplicar entidades

\---

## 24\. Seed data mínima recomendada

Para evitar sensación de vacío, el lanzamiento debe contar con contenido precargado.

### 24.1 Recomendación mínima

* 100 a 300 actividades
* 10 a 20 rubros
* 10 a 20 categorías funcionales
* 300 a 1000 evidencias
* 20 a 50 actividades destacadas con curación fuerte

### 24.2 Rubros prioritarios sugeridos

* tecnología
* marketing
* atención al cliente
* diseño
* educación
* finanzas
* legal
* recursos humanos
* salud administrativa
* medios y contenidos

### 24.3 Estrategia de seed data por idioma

* cargar una sola base conceptual
* generar contenido editorial inicial en inglés para actividades prioritarias
* preparar español para taxonomías visibles, páginas institucionales y subconjunto de actividades importantes
* evitar intentar traducir todo el catálogo inicial si eso retrasa el lanzamiento

\---

## 25\. Roadmap funcional sugerido

## Etapa 1

* definir stack
* definir arquitectura
* definir modelo de datos
* implementar autenticación y autorización

## Etapa 2

* implementar portal público
* implementar actividades públicas
* implementar evidencias públicas
* implementar búsqueda y filtros base

## Etapa 3

* implementar propuestas de actividades y evidencias
* implementar comentarios
* implementar panel básico de usuario

## Etapa 4

* implementar backoffice
* implementar moderación
* implementar historial editorial

## Etapa 5

* cargar seed data
* optimizar SEO
* ajustar UX
* preparar despliegue inicial

\---

## 26\. Recomendaciones para desarrollo asistido por IA

* usar un stack moderno, simple y muy documentado
* documentar reglas de negocio en markdown consumible por IA
* trabajar por etapas, no pedir todo el sistema en un solo prompt
* definir criterios de aceptación por módulo
* crear seed data temprano
* evitar ambigüedades de naming, estados y taxonomías
* dejar bien definidos permisos y relaciones desde el inicio
* mantener separación entre contenido público, contenido comunitario y criterio editorial

\---

## 27\. Conclusión

Este REQ deja la idea en un formato implementable, con foco en MVP, claridad de módulos, reglas de negocio, estructura conceptual y decisiones estratégicas importantes como multiidioma, editorial, trazabilidad y escalabilidad.

La clave del producto no será solo listar actividades afectadas por IA, sino construir una plataforma seria, confiable, navegable y extensible, donde la evidencia y la curación editorial conviertan al portal en una referencia útil para usuarios, empresas y analistas.

