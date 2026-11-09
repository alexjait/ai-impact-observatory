# Delta De Negocio

## Tema
CRUD de Actividades y Evidencias desde backoffice.

## Resumen Del Problema U Oportunidad
Hoy el backoffice ya permite moderar propuestas, revisar evidencias, curar resúmenes editoriales y ajustar parte del contenido visible, pero no ofrece todavía una gestión estructural completa del dominio. Eso deja una brecha operativa importante:

- si hace falta crear manualmente una actividad, no existe un flujo claro para hacerlo
- si hace falta corregir contenido base, taxonomías o relaciones de una actividad, la edición disponible queda corta
- si hace falta crear o corregir una evidencia aprobada fuera del flujo de propuesta, no hay una superficie de administración equivalente
- muchos ajustes finos siguen empujando al equipo a tocar seed, reimportar datos o depender de propuestas solo para materializar cambios

La oportunidad es convertir el backoffice en una consola editorial-operativa real para el dominio principal del producto, no solo para moderar y curar contribuciones.

## Objetivo De Negocio
Permitir que el equipo administrador gestione Actividades y Evidencias directamente desde backoffice, con capacidad de crear, editar, publicar, despublicar, archivar y relacionar contenido sin depender exclusivamente del seed o del flujo de propuestas.

## Usuarios O Actores
- Administrador: gestiona el catálogo vivo de actividades y evidencias.
- Editor u operador de backoffice: corrige contenido, completa datos faltantes y mantiene calidad editorial.
- Usuario final: se beneficia de un catálogo más actualizable, coherente y mantenible.

## Valor Esperado
- reduce la dependencia del CSV y de recargas completas de seed para cambios cotidianos
- acelera la corrección de errores y la actualización de contenido vivo
- mejora la capacidad operativa del equipo para mantener el catálogo al día
- evita forzar al equipo a usar propuestas como workaround para crear o ajustar contenido estructural
- acerca el producto a una operación editorial continua y sostenible

## Propuesta De Alcance Para Este Delta
Alcance recomendado:
- CRUD de Actividades desde backoffice
- CRUD de Evidencias desde backoffice
- edición de contenido bilingüe base
- edición de taxonomías y relaciones principales
- control de visibilidad o estado editorial/publicación
- gestión de relaciones entre actividad y evidencia

Alcance sugerido para una primera versión:
- crear actividad nueva
- editar actividad existente
- archivar o despublicar actividad
- crear evidencia nueva
- editar evidencia existente
- archivar o despublicar evidencia
- vincular y desvincular evidencia con actividades

Alcance no recomendado en esta etapa:
- versionado editorial complejo
- rollback histórico completo
- workflow multiaprobador
- permisos avanzados por subrol
- diff visual entre versiones
- edición masiva compleja estilo spreadsheet

## Decisiones De Negocio Recomendadas
- El backoffice debe distinguir claramente entre:
  - gestión estructural del dominio
  - moderación de propuestas
  - curación editorial de contenido público
- Para esta etapa conviene priorizar `archivar` o `despublicar` sobre `borrado duro`.
- Crear contenido manualmente desde backoffice debe ser una capacidad válida, no una excepción.
- El flujo de propuestas aprobadas debe convivir con el CRUD, no competir con él.
- Las actividades o evidencias que dejan de estar públicas no necesariamente deben desaparecer del backoffice ni del historial operativo.

## Supuestos Explícitos
- El catálogo va a seguir cambiando con frecuencia.
- No todo cambio razonable debe requerir edición del seed y recarga completa.
- El equipo de operación necesita más control directo sobre actividades y evidencias ya materializadas.
- La trazabilidad mínima importa, pero no hace falta todavía un sistema complejo de versionado.

## Criterios De Éxito De Negocio
- el equipo puede crear una actividad o evidencia sin tocar seed
- el equipo puede corregir contenido base sin workaround manual
- el catálogo público refleja cambios operativos sin necesidad de recarga completa
- la gestión editorial diaria se vuelve más simple y menos frágil
- el backoffice se entiende como centro de operación del catálogo, no solo como cola de revisión

## Restricciones Y Riesgos
- Si se habilita borrado duro sin reglas claras, puede romper relaciones con propuestas, comentarios, follows o SEO.
- Si no se separan bien edición estructural y moderación, la UX del backoffice puede volverse confusa.
- Si el CRUD nace sin guardrails, puede haber inconsistencias entre contenido base, resúmenes editoriales y estado público.
- Si se habilita edición completa sin una regla clara para slugs y traducciones, aumenta el riesgo de inconsistencias visibles.

## Dudas Abiertas Para La Siguiente Etapa
- Qué campos exactos de Actividad serán editables en la primera versión.
- Qué campos exactos de Evidencia serán editables en la primera versión.
- Si el “delete” debe ser solo archivado/despublicado o si habrá borrado real para administradores.
- Qué pasa con una actividad o evidencia creada originalmente desde una propuesta materializada.
- Cómo se resuelven conflictos entre contenido base, resumen editorial y traducciones automáticas.
- Si conviene una vista separada para `Actividades` y otra para `Evidencias` dentro del backoffice.
- Qué validaciones mínimas deben existir para evitar relaciones rotas o slugs inconsistentes.

## Consideraciones Transversales

### Operación Editorial
- aplica: si
- alcance o contexto: el CRUD cambia el backoffice de una herramienta de revisión a una herramienta de gestión real del catálogo
- decisiones tomadas: priorizar operación cotidiana sin depender del seed
- dudas abiertas: separación exacta entre edición estructural y edición editorial

### Dominio Y Datos
- aplica: si
- alcance o contexto: actividades y evidencias ya tienen relaciones, traducciones, slugs, estados y materialización desde propuestas
- decisiones tomadas: no asumir borrado duro como comportamiento por defecto
- dudas abiertas: tratamiento exacto de archivado, publicación y relaciones existentes

### UX De Backoffice
- aplica: si
- alcance o contexto: el backoffice deberá ofrecer entradas claras para Actividades y Evidencias como módulos propios
- decisiones tomadas: conviene un CRUD explícito, no oculto dentro de colas editoriales
- dudas abiertas: navegación exacta y nivel de complejidad inicial

## Versión Mapeada A `brief-requerimiento-inicial.md`

### Problema U Oportunidad
El backoffice actual no permite una gestión completa y directa de Actividades y Evidencias materializadas.

### Objetivo De Negocio
Habilitar CRUD operativo de Actividades y Evidencias desde backoffice para sostener un catálogo vivo.

### Usuarios O Actores
- Administrador
- Editor / operador de backoffice

### Plataformas Esperadas
- Backoffice web responsive

### Restricciones Conocidas
- Conviene evitar borrado duro por defecto.
- Debe convivir con seed, propuestas y publicación pública.
- Debe mantener claridad entre moderación, edición editorial y gestión estructural.

### Integraciones Conocidas
- No requiere integraciones externas nuevas para el núcleo del requerimiento.

### Fecha O Prioridad
- Prioridad media-alta, porque destraba operación cotidiana del catálogo.

### Criterios De Éxito
- creación, edición y archivado de actividades y evidencias desde backoffice
- menor dependencia del seed para cambios diarios
- catálogo público actualizado desde operación interna

### Dudas Abiertas
- delete vs archive
- alcance exacto de campos editables
- tratamiento de propuestas materializadas
- navegación del backoffice para estos módulos

## Handoff Para Functional Analyst
La siguiente etapa no necesita redescubrir el problema. Debe convertir este delta en reglas verificables para dos módulos claros de backoffice: `Actividades` y `Evidencias`. Conviene definir alcance inicial, campos editables, reglas de publicación/archivo, relación con propuestas materializadas, validaciones mínimas y comportamiento frente a slugs, taxonomías y relaciones cruzadas. La recomendación de negocio es priorizar una primera versión operativa y segura, con `archivado/despublicación` antes que borrado duro.

## Sugerencias De Actualización Para `templates/project-state.md`
- registrar este delta como nuevo paquete de negocio en preparación
- cambiar el siguiente agente recomendado a `functional_analyst`
- dejar explícito que el siguiente paso es bajar reglas de CRUD antes de implementar backend y frontend
