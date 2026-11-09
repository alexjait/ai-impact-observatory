# Delta De Negocio

## Tema
Seguimiento personal de actividades por parte de usuarios autenticados.

## Resumen Del Problema U Oportunidad
Hoy el portal permite explorar actividades, revisar evidencia, comentar y proponer contenido, pero no ofrece una forma simple de marcar actividades de interés para volver a ellas más tarde. Esto genera una fricción clara: cuando un usuario encuentra actividades relevantes para su trabajo, curiosidad o monitoreo personal, no tiene una herramienta nativa para construir una lista breve y volver a filtrarla después.

La oportunidad es incorporar una función ligera de seguimiento personal que aumente recurrencia, facilite exploración profunda y genere una capa de utilidad cotidiana sin alterar el carácter editorial del producto.

## Objetivo De Negocio
Dar a los usuarios autenticados una forma simple y privada de marcar actividades para seguirlas, revisarlas más tarde y filtrarlas dentro del catálogo, mejorando retención, utilidad práctica y profundidad de uso del portal.

## Usuarios O Actores
- Visitante: no puede seguir actividades, pero puede descubrir que la función existe.
- Usuario registrado: puede marcar y desmarcar actividades, y filtrar el catálogo por las que sigue.
- Moderador, editor y administrador: no tienen una responsabilidad especial sobre esta función, salvo usarla como cualquier usuario autenticado si corresponde.

## Valor Esperado
- Reduce fricción para volver a actividades relevantes.
- Mejora la utilidad del catálogo para seguimiento recurrente.
- Da una razón concreta para autenticarse más allá de comentar o proponer contenido.
- Prepara una base futura para alertas, listas personales o recomendaciones, sin comprometer ahora ese alcance.

## Propuesta De Alcance Para Este Delta
La función debería entrar como una capacidad simple de `seguir / dejar de seguir` actividades públicas aprobadas.

Alcance recomendado:
- solo para usuarios autenticados
- seguimiento privado, visible solo para el propio usuario
- acción disponible en detalle público de actividad
- filtro específico en `Explorar actividades` para ver solo actividades seguidas
- estado visible básico `Following / Follow` o equivalente

Alcance no recomendado en esta etapa:
- notificaciones
- emails o alertas automáticas
- conteos públicos de seguidores
- listas compartidas
- priorización algorítmica o recomendaciones
- seguimiento de evidencias o rubros además de actividades

## Decisiones De Negocio Recomendadas
- El seguimiento debe ser privado.
- La acción debe requerir autenticación.
- Si el usuario no está autenticado, el portal puede invitar a iniciar sesión, pero no debería simular que la acción ya está disponible.
- El seguimiento debe aplicarse solo a actividades públicas aprobadas.
- El filtro de “seguidas” debe aparecer solo cuando hay sesión activa.
- No conviene mezclar esta función con propuestas, evidencia o comentarios. Debe sentirse como una herramienta personal de seguimiento, no como una acción editorial.

## Supuestos Explícitos
- El usuario quiere marcar actividades para volver a ellas más tarde, no necesariamente recibir alertas.
- Una lista privada de seguimiento ya aporta valor sin necesidad de flujo social o colaborativo.
- La funcionalidad debe sentirse liviana y reversible, sin generar compromiso excesivo.
- La actividad sigue siendo la entidad central del producto y por eso conviene empezar por ahí, no por rubros o evidencias.

## Criterios De Exito De Negocio
- Un usuario autenticado puede marcar una actividad y verla reflejada como seguida.
- El mismo usuario puede filtrar el catálogo por sus actividades seguidas.
- El flujo resulta comprensible sin explicación adicional.
- La función agrega valor de uso recurrente sin introducir complejidad innecesaria.

## Restricciones Y Riesgos
- Si el seguimiento se vuelve visible para terceros, cambia de naturaleza y abre preguntas de privacidad que hoy no aportan valor.
- Si se mezcla con alertas o notificaciones en este delta, el alcance crece demasiado.
- Si el filtro “seguidas” aparece en anónimo, puede generar frustración o ruido.
- Si se soporta sobre actividades no públicas o archivadas, la experiencia puede volverse inconsistente.

## Dudas Abiertas Para La Siguiente Etapa
- ¿Conviene mostrar también una vista en perfil tipo “My followed activities” además del filtro en catálogo?
- ¿Qué pasa si una actividad seguida deja de estar pública o cambia de estado?
- ¿Conviene permitir seguir o des-seguir también desde las cards del catálogo, o solo desde el detalle?

## Consideraciones Transversales

### Registro O Autenticacion Social
- aplica: si
- alcance o contexto: la función requiere sesión activa para persistir el seguimiento.
- decisiones tomadas: seguimiento disponible solo para usuarios autenticados.
- dudas abiertas: ninguna crítica.

### Sincronizacion Entre Solapas O Sesiones Abiertas
- aplica: si
- alcance o contexto: si un usuario sigue o deja de seguir en una pestaña, otra vista del catálogo podría quedar desactualizada.
- decisiones tomadas: no bloquear este delta por esto; tratarlo como comportamiento esperable de sesión y refresco.
- dudas abiertas: definir si alcanza con refresco manual o si conviene revalidación simple al navegar.

### Otras Consideraciones Transversales
- item: privacidad del seguimiento
- aplica: si
- alcance o contexto: evitar que el seguimiento se interprete como señal pública o social.
- decisiones tomadas: lista privada por usuario.
- dudas abiertas: ninguna crítica.

## Version Mapeada A `brief-requerimiento-inicial.md`

### Problema U Oportunidad
El catálogo no permite que usuarios autenticados marquen actividades de interés para volver a ellas luego, lo que reduce utilidad recurrente y continuidad de uso.

### Objetivo De Negocio
Agregar seguimiento personal de actividades para mejorar retención, navegación recurrente y utilidad cotidiana del portal.

### Usuarios O Actores
- Usuario registrado: sigue y deja de seguir actividades; filtra sus actividades seguidas.
- Visitante: puede ver la existencia potencial de la función, pero no usarla.

### Plataformas Esperadas
- Portal web público responsive
- Área autenticada web

### Restricciones Conocidas
- La función debe ser privada.
- Solo aplica a usuarios autenticados.
- Solo aplica a actividades públicas aprobadas.
- No incluye alertas ni notificaciones.

### Integraciones Conocidas
- No requiere nuevas integraciones externas para el primer alcance.

### Fecha O Prioridad
- Prioridad media-alta como mejora de uso recurrente del catálogo.

### Criterios De Exito
- El usuario puede seguir actividades.
- Puede filtrarlas desde el catálogo.
- La función es clara y de bajo esfuerzo cognitivo.

### Dudas Abiertas
- Vista adicional en perfil.
- Comportamiento cuando una actividad seguida deja de ser pública.
- Disponibilidad del CTA en cards además de detalle.

## Handoff Para Functional Analyst
Queda claro el objetivo de negocio y el alcance recomendado: seguimiento simple, privado, solo para autenticados, aplicado a actividades públicas aprobadas, con filtro en el catálogo. Todavía falta bajar reglas operativas exactas: puntos de entrada UI, visibilidad del filtro, estados y comportamiento ante cambios de publicación de la actividad. No hace falta redescubrir el problema; sí hace falta convertirlo en comportamiento verificable.

## Sugerencias De Actualizacion Para `templates/project-state.md`
- registrar este delta como nuevo paquete de descubrimiento funcional
- cambiar el siguiente agente recomendado a `functional_analyst`
- dejar explicitado que no hay decisión humana crítica pendiente para empezar el análisis funcional
