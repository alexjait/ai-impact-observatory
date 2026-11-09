# Delta Funcional CRUD De Actividades Y Evidencias En Backoffice

## Resumen
Este delta funcional agrega dos módulos explícitos al backoffice:

- `Actividades`
- `Evidencias`

El objetivo es que el equipo editorial-operativo pueda crear, editar, publicar, despublicar, archivar y relacionar contenido estructural del catálogo sin depender exclusivamente del seed ni de los flujos de propuestas.

La primera versión debe priorizar operación clara y segura antes que flexibilidad máxima. Por eso se recomienda privilegiar `archivar` o `despublicar` sobre `borrado duro`.

## Cambio Funcional Incorporado

### Módulo De Actividades
Se agrega una superficie de backoffice para gestionar actividades materializadas del catálogo.

Debe permitir:
- listar actividades existentes
- buscar y filtrar actividades
- crear actividad nueva
- editar actividad existente
- despublicar o archivar actividad
- re-publicar actividad archivada o no pública
- revisar relaciones con evidencias asociadas

### Módulo De Evidencias
Se agrega una superficie de backoffice para gestionar evidencias materializadas del catálogo.

Debe permitir:
- listar evidencias existentes
- buscar y filtrar evidencias
- crear evidencia nueva
- editar evidencia existente
- despublicar o archivar evidencia
- re-publicar evidencia archivada o no pública
- vincular evidencia con una o más actividades
- desvincular evidencia de actividades

### Relación Con Flujos Ya Existentes
Estos módulos deben convivir con:
- seed importado
- propuestas materializadas
- moderación
- curación editorial

No reemplazan la cola de propuestas ni el workspace editorial actual, pero agregan una capa de gestión estructural que hoy falta.

## Reglas De Negocio Del Delta

### 1. El CRUD es exclusivo de backoffice
- Solo usuarios con acceso de backoffice pueden usar estos módulos.
- En esta etapa no se definen subroles finos; se asume el mismo nivel de acceso administrativo/editorial que ya opera en backoffice.

### 2. Las actividades y evidencias pueden existir aunque no estén públicas
- Una actividad o evidencia archivada o despublicada debe seguir visible en backoffice.
- El catálogo público solo debe exponer las que cumplan condiciones de visibilidad pública.

### 3. Crear desde backoffice es un flujo válido
- El equipo puede crear una actividad o una evidencia directamente, aunque no provenga de una propuesta ni del seed.
- El contenido creado manualmente debe quedar listo para publicación controlada.

### 4. La edición estructural no reemplaza la curación editorial
- Actividad y evidencia conservan distinción entre:
  - contenido base
  - estado editorial/publicación
  - resumen editorial o capa curada cuando exista
- El CRUD debe editar el contenido estructural del dominio, no confundirlo con la moderación de propuestas.

### 5. La primera versión debe evitar borrado duro como acción principal
- El comportamiento por defecto para “eliminar” debe ser `archivar` o `despublicar`.
- Si más adelante existiera borrado real, debe ser un caso excepcional y explícito, no la acción operativa principal.

### 6. La relación actividad-evidencia es editable
- Una evidencia puede estar vinculada a una o varias actividades.
- El backoffice debe permitir:
  - agregar vínculos
  - quitar vínculos
- Quitar un vínculo no implica borrar la evidencia.

### 7. El contenido bilingüe es obligatorio
- Actividades y evidencias deben seguir soportando `es` y `en`.
- En esta primera versión, la edición debe contemplar ambos idiomas.
- Si el producto ya dispone de traducción automática en algunos flujos, eso puede reutilizarse en implementación, pero funcionalmente el resultado esperado sigue siendo contenido bilingüe editable.

### 8. Los slugs deben seguir siendo controlados
- La edición de slugs debe ser posible cuando corresponda.
- El sistema debe evitar colisiones que rompan navegación pública.
- Si cambia un slug, el contenido debe seguir siendo consistente en backoffice y en público según la estrategia vigente.

### 9. La edición debe contemplar taxonomías
- Actividad:
  - industrias
  - categorías funcionales
- Evidencia:
  - actividades relacionadas
  - tipo de evidencia
  - fecha del evento
  - confiabilidad

### 10. Propuestas materializadas deben seguir siendo trazables
- Si una actividad o evidencia se creó originalmente desde una propuesta aprobada, esa relación no debe romperse por una edición posterior.
- El CRUD debe trabajar sobre la entidad materializada, no desconectarla sin criterio del historial previo.

## Alcance Funcional

### Incluido En Actividades
- listado de actividades
- búsqueda por texto
- filtros básicos por estado, industria, categoría y visibilidad si aplica
- alta manual
- edición de:
  - título EN/ES
  - descripción corta EN/ES
  - descripción completa EN/ES
  - resumen editorial EN/ES si se decide incluirlo en la primera versión
  - slug EN/ES
  - estado IA oficial
  - industrias
  - categorías funcionales
  - estado de publicación o archivo
- acceso a evidencias relacionadas

### Incluido En Evidencias
- listado de evidencias
- búsqueda por texto
- filtros básicos por estado, tipo, actividad relacionada y visibilidad si aplica
- alta manual
- edición de:
  - título EN/ES
  - summary EN/ES
  - context EN/ES
  - source text
  - source URL
  - event date
  - evidence type
  - reliability flag
  - actividades relacionadas
  - estado de publicación o archivo

### No Incluido En Esta Primera Versión
- workflow multiaprobador
- versionado completo con diff
- restauración histórica por versión
- edición masiva compleja de registros estructurales
- borrado duro como acción operativa estándar
- permisos por subrol fino

## Impacto En Alcance Funcional Vigente

### Se Actualiza
- backoffice incorpora módulos de gestión estructural de catálogo
- la operación deja de depender solo de moderación, editorial y seed
- actividades y evidencias pasan a tener administración directa

### No Se Modifica
- flujo básico de propuestas públicas
- catálogo público como producto orientado a actividades
- comentarios y denuncias
- autenticación
- lógica general de locales `es/en`

## Flujos Funcionales Esperados

### Flujo 1. Crear actividad manualmente
1. Usuario de backoffice entra al módulo `Actividades`.
2. Elige `Nueva actividad`.
3. Completa contenido bilingüe, taxonomías, estado IA y slugs.
4. Guarda.
5. La actividad queda visible en backoffice.
6. Si se publica, queda disponible en catálogo público.

### Flujo 2. Editar actividad existente
1. Usuario de backoffice busca una actividad existente.
2. Abre su ficha o workspace de edición.
3. Ajusta contenido base, taxonomías o estado.
4. Guarda cambios.
5. El detalle público y el catálogo reflejan el contenido actualizado cuando corresponda.

### Flujo 3. Archivar o despublicar actividad
1. Usuario de backoffice abre una actividad existente.
2. Cambia su estado a no pública o archivada.
3. Guarda.
4. La actividad deja de verse en catálogo público.
5. Sigue visible en backoffice para trazabilidad y posible reactivación.

### Flujo 4. Crear evidencia manualmente
1. Usuario de backoffice entra al módulo `Evidencias`.
2. Elige `Nueva evidencia`.
3. Completa contenido bilingüe, metadatos de fuente y relación con actividades.
4. Guarda.
5. Si queda pública, aparece en el detalle de las actividades vinculadas.

### Flujo 5. Editar evidencia existente
1. Usuario de backoffice busca una evidencia.
2. Abre la edición.
3. Ajusta título, summary, context, fuente, fecha o relaciones.
4. Guarda.
5. Las actividades relacionadas reflejan la evidencia actualizada.

### Flujo 6. Vincular evidencia con actividad
1. Usuario de backoffice abre una evidencia o una actividad.
2. Agrega o quita relaciones.
3. Guarda.
4. El vínculo queda reflejado en ambas superficies del backoffice y en el detalle público cuando corresponda.

## Requisitos No Funcionales
- Los módulos deben ser comprensibles y claramente distintos de moderación/editorial.
- La UI debe priorizar legibilidad y edición segura.
- Deben existir guardrails básicos para evitar colisiones obvias de slug o relaciones vacías incoherentes.
- Las pantallas deben funcionar bien en desktop y ancho intermedio de backoffice.

## Riesgos, Restricciones Y Dependencias
- Si no se diferencia bien “editar contenido base” de “editar resumen editorial”, puede haber confusión operativa.
- Si no se resuelve bien la coexistencia con propuestas materializadas, puede quedar inconsistencia de trazabilidad.
- Si no se define bien qué significa archivar vs despublicar, la operación diaria puede volverse ambigua.
- La implementación dependerá de contratos backend claros para relaciones y guardrails de publicación.

## Backlog Impactado Por Especialidad

### Backend
- BE-CRUD-ACT-01: exponer listado y detalle administrativo de actividades
- BE-CRUD-ACT-02: crear actividad manual desde backoffice
- BE-CRUD-ACT-03: editar actividad materializada
- BE-CRUD-ACT-04: archivar/despublicar/reactivar actividad
- BE-CRUD-EVI-01: exponer listado y detalle administrativo de evidencias
- BE-CRUD-EVI-02: crear evidencia manual desde backoffice
- BE-CRUD-EVI-03: editar evidencia materializada
- BE-CRUD-EVI-04: archivar/despublicar/reactivar evidencia
- BE-CRUD-REL-01: vincular y desvincular evidencia con actividades
- BE-CRUD-GUARD-01: guardrails básicos para slugs, relaciones y visibilidad

### Frontend Web
- FEW-CRUD-ACT-01: agregar módulo de listado de actividades en backoffice
- FEW-CRUD-ACT-02: agregar formulario de alta/edición de actividad
- FEW-CRUD-ACT-03: agregar acciones de archivo/publicación de actividad
- FEW-CRUD-EVI-01: agregar módulo de listado de evidencias en backoffice
- FEW-CRUD-EVI-02: agregar formulario de alta/edición de evidencia
- FEW-CRUD-EVI-03: agregar acciones de archivo/publicación de evidencia
- FEW-CRUD-REL-01: exponer gestión de relaciones actividad-evidencia

### UX/UI
- UX-CRUD-01: definir navegación del backoffice para módulos `Actividades` y `Evidencias`
- UX-CRUD-02: definir patrón de formulario bilingüe editable
- UX-CRUD-03: separar visualmente contenido base, estado editorial y publicación
- UX-CRUD-04: definir patrón claro para archivar/despublicar/reactivar

### Testing
- QA-CRUD-01: validar alta de actividad desde backoffice
- QA-CRUD-02: validar edición y persistencia de actividad
- QA-CRUD-03: validar archivado/despublicación de actividad
- QA-CRUD-04: validar alta de evidencia desde backoffice
- QA-CRUD-05: validar edición y persistencia de evidencia
- QA-CRUD-06: validar relaciones actividad-evidencia
- QA-CRUD-07: validar impacto en catálogo público y detalle público

## Paquetes De Implementación Sugeridos

### Slice 1
- listados administrativos de Actividades y Evidencias
- detalle administrativo
- navegación propia en backoffice

### Slice 2
- formularios de alta y edición de Actividades
- guardrails básicos
- archivado/despublicación/reactivación de Actividades

### Slice 3
- formularios de alta y edición de Evidencias
- gestión de relaciones con Actividades
- archivado/despublicación/reactivación de Evidencias

### Slice 4
- regresión end to end de catálogo y backoffice

## Criterios De Aceptación
- AC-CRUD-ACT-01: un usuario de backoffice puede crear una actividad nueva sin tocar seed.
- AC-CRUD-ACT-02: un usuario de backoffice puede editar contenido base bilingüe de una actividad existente.
- AC-CRUD-ACT-03: un usuario de backoffice puede archivar o despublicar una actividad sin borrarla del backoffice.
- AC-CRUD-ACT-04: una actividad re-publicada vuelve a estar disponible en el catálogo público.
- AC-CRUD-EVI-01: un usuario de backoffice puede crear una evidencia nueva y vincularla a una o más actividades.
- AC-CRUD-EVI-02: un usuario de backoffice puede editar título, summary, context y metadatos de una evidencia.
- AC-CRUD-EVI-03: un usuario de backoffice puede archivar o despublicar una evidencia sin perderla del backoffice.
- AC-CRUD-REL-01: un usuario de backoffice puede agregar y quitar vínculos entre evidencias y actividades.
- AC-CRUD-PUB-01: el catálogo público refleja los cambios solo cuando la entidad queda pública.
- AC-CRUD-TRACE-01: las entidades materializadas desde propuestas siguen siendo editables sin perder su trazabilidad operativa básica.

## Handoff Para Implementación
No quedan dudas funcionales bloqueantes para abrir implementación. La secuencia recomendada es `backend-web -> frontend-web -> testing`, empezando por contratos y reglas de estado/relaciones antes de diseñar la UX final del backoffice.

## Sugerencias De Actualización Para `templates/project-state.md`
- registrar este documento como delta funcional en preparación
- cambiar el siguiente agente recomendado a `backend-web`
- dejar explícito que el CRUD ya tiene alcance funcional suficiente para abrir implementación
