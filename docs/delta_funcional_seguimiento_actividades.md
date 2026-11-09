# Delta Funcional Seguimiento De Actividades

## Resumen
Este delta funcional incorpora una capacidad de seguimiento personal de actividades para usuarios autenticados. La función permite marcar actividades públicas aprobadas como seguidas, consultarlas luego desde una vista dedicada y filtrarlas dentro del catálogo público.

El objetivo es mejorar continuidad de uso, utilidad práctica y navegación recurrente sin transformar esta capacidad en una función social, pública o basada en alertas.

## Cambio Funcional Incorporado

### Actividades
Se amplía el módulo de actividades con una capacidad de seguimiento personal:
- un usuario autenticado puede seguir una actividad pública aprobada
- un usuario autenticado puede dejar de seguir una actividad que ya sigue
- el estado de seguimiento debe ser visible para el propio usuario
- el catálogo debe permitir filtrar solo actividades seguidas
- el área autenticada debe incluir una vista de `My followed activities` / `Actividades seguidas`

## Reglas De Negocio Del Delta

### 1. El seguimiento es privado
- El seguimiento solo es visible para el propio usuario autenticado.
- No se exponen conteos públicos de seguidores.
- No se expone qué usuarios siguen una actividad.

### 2. Solo aplica a actividades públicas aprobadas
- Solo se puede seguir una actividad que sea pública y aprobada en el momento de la acción.
- No se puede seguir directamente una actividad archivada, rechazada o no pública.

### 3. La acción requiere autenticación
- Un visitante no puede seguir actividades.
- Si intenta hacerlo desde una superficie pública, el sistema debe invitar a iniciar sesión o registrarse.

### 4. El usuario puede seguir o dejar de seguir desde múltiples superficies
- La acción debe estar disponible en el detalle público de actividad.
- También debe estar disponible desde las cards del catálogo para mejorar usabilidad.

### 5. Debe existir una vista dedicada además del filtro en catálogo
- Además del filtro dentro de `Explorar actividades`, el usuario debe poder entrar a una vista específica de `My followed activities` / `Actividades seguidas`.
- La vista dedicada puede implementarse como:
  - una ruta propia dentro del área autenticada
  - o una entrada en perfil que lleve a una vista filtrada dedicada
- Lo importante es que exista una entrada clara y persistente desde el área autenticada.

### 6. Si una actividad seguida deja de estar pública o cambia de estado, el usuario la sigue viendo en su espacio de seguimiento
- Si una actividad seguida deja de ser pública o cambia de estado, no desaparece automáticamente de la lista de seguidas del usuario.
- Debe seguir visible en:
  - el filtro de seguidas
  - la vista `My followed activities`
- Debe mostrarse con una diferencia visual clara que indique que ya no está pública o que cambió de estado.
- Si el usuario deja de seguirla, desaparece de sus vistas de seguimiento y no podrá volver a verla desde el catálogo público mientras siga no pública.

### 7. El seguimiento es reversible y liviano
- Seguir o dejar de seguir debe ser una acción simple, sin confirmaciones pesadas salvo error.
- No se requieren notas, etiquetas ni agrupaciones manuales en esta etapa.

## Alcance Funcional

### Incluido
- persistencia de seguimiento usuario-actividad
- lectura del estado `isFollowing` para el usuario autenticado
- acción `follow / unfollow`
- CTA de seguimiento en detalle de actividad
- CTA de seguimiento también en cards del catálogo
- filtro `Only followed` / `Solo seguidas` en `Explorar actividades`
- vista dedicada `My followed activities` / `Actividades seguidas`
- visibilidad de actividades seguidas que dejaron de estar públicas, con indicador de estado

### No Incluido
- alertas o notificaciones
- emails automáticos
- seguimiento de evidencias
- seguimiento de rubros o categorías
- listas compartidas
- indicadores públicos de popularidad
- ordenamiento por “más seguidas”

## Impacto En Alcance Funcional Vigente

### Se actualiza
- módulo de actividades públicas
- área autenticada del usuario
- criterios de navegación y retorno al catálogo

### No se modifica
- moderación
- editorial
- comentarios
- propuestas
- evidencia
- seed
- taxonomías base

## Flujos Funcionales Esperados

### Flujo 1. Seguir una actividad desde detalle
1. Usuario autenticado abre una actividad pública aprobada.
2. Ve un CTA visible de `Follow` / `Seguir`.
3. Activa la acción.
4. La interfaz refleja el nuevo estado `Following` / `Siguiendo`.
5. La actividad pasa a formar parte de su lista de seguidas.

### Flujo 2. Dejar de seguir desde detalle
1. Usuario autenticado abre una actividad que ya sigue.
2. Ve el estado `Following` / `Siguiendo`.
3. Ejecuta la acción inversa.
4. La actividad deja de figurar en sus vistas de seguimiento.

### Flujo 3. Seguir o dejar de seguir desde catálogo
1. Usuario autenticado explora actividades.
2. Cada card puede mostrar el estado de seguimiento o una acción rápida.
3. El usuario sigue o deja de seguir sin salir necesariamente del listado.
4. La UI debe actualizar el estado local de manera coherente.

### Flujo 4. Filtrar solo actividades seguidas
1. Usuario autenticado entra a `Explorar actividades`.
2. Activa el filtro `Only followed` / `Solo seguidas`.
3. El catálogo muestra solo las actividades seguidas por ese usuario.
4. Si no sigue ninguna, el sistema muestra un vacío claro y útil.

### Flujo 5. Consultar `My followed activities`
1. Usuario autenticado entra a perfil o área autenticada.
2. Accede a `My followed activities` / `Actividades seguidas`.
3. Ve una lista de actividades seguidas, incluyendo aquellas que ya no están públicas.
4. Las no públicas o cambiadas de estado deben verse diferenciadas.

## Requisitos No Funcionales
- La acción de seguir/dejar de seguir debe responder de forma rápida y clara.
- El catálogo no debe romper experiencia anónima por la presencia de esta función.
- La solución debe mantener privacidad: no exponer el seguimiento de un usuario a otros.
- La UI debe diferenciar con claridad una actividad seguida no pública o fuera del catálogo abierto.

## Riesgos, Restricciones Y Dependencias
- Si la solución no contempla correctamente el caso “seguida pero no pública”, el usuario puede pensar que perdió información.
- Si la acción desde cards se implementa de forma poco visible o demasiado cargada, puede competir con la navegación principal del catálogo.
- El catálogo autenticado y el espacio de perfil deben compartir una misma lógica de visibilidad para evitar inconsistencias.

## Backlog Impactado Por Especialidad

### Backend
- BE-FOLLOW-01: persistir relación usuario-actividad seguida
- BE-FOLLOW-02: exponer acción para seguir actividad
- BE-FOLLOW-03: exponer acción para dejar de seguir actividad
- BE-FOLLOW-04: devolver `isFollowing` para el usuario autenticado en actividades visibles
- BE-FOLLOW-05: soportar filtro de actividades seguidas
- BE-FOLLOW-06: exponer listado dedicado de actividades seguidas, incluyendo no públicas seguidas por el usuario

### Frontend Web
- FEW-FOLLOW-01: agregar CTA de `Follow / Following` en detalle público
- FEW-FOLLOW-02: agregar acción rápida de seguimiento en cards del catálogo
- FEW-FOLLOW-03: agregar filtro `Only followed / Solo seguidas` en explorar actividades para usuarios autenticados
- FEW-FOLLOW-04: agregar vista `My followed activities / Actividades seguidas`
- FEW-FOLLOW-05: diferenciar visualmente actividades seguidas no públicas o con estado cambiado
- FEW-FOLLOW-06: definir vacíos y mensajes de login/invitación cuando corresponda

### UX/UI
- UX-FOLLOW-01: definir patrón visual del CTA en detalle
- UX-FOLLOW-02: definir patrón visual del CTA en card sin competir con la navegación principal
- UX-FOLLOW-03: definir señal visual para actividades seguidas no públicas
- UX-FOLLOW-04: definir vacío funcional para usuarios sin actividades seguidas

### Testing
- QA-FOLLOW-01: validar seguir y dejar de seguir desde detalle
- QA-FOLLOW-02: validar seguir y dejar de seguir desde catálogo
- QA-FOLLOW-03: validar filtro `Only followed / Solo seguidas`
- QA-FOLLOW-04: validar vista `My followed activities`
- QA-FOLLOW-05: validar comportamiento cuando una actividad seguida deja de estar pública
- QA-FOLLOW-06: validar experiencia anónima y mensajes de acceso

## Paquetes De Implementacion Sugeridos

### Slice 1
- persistencia de seguimiento
- API de follow / unfollow
- lectura básica de `isFollowing`

### Slice 2
- CTA en detalle de actividad
- filtro en catálogo para autenticados

### Slice 3
- CTA en cards del catálogo
- vista `My followed activities`
- diferenciación de actividades no públicas seguidas

### Slice 4
- regresión completa y vacíos UX

## Criterios De Aceptacion
- AC-FOLLOW-01: un usuario autenticado puede seguir una actividad pública aprobada desde el detalle.
- AC-FOLLOW-02: un usuario autenticado puede dejar de seguir una actividad que ya sigue.
- AC-FOLLOW-03: el detalle público refleja correctamente si la actividad está seguida por el usuario actual.
- AC-FOLLOW-04: el catálogo permite seguir o dejar de seguir actividades desde la card.
- AC-FOLLOW-05: el catálogo autenticado permite filtrar solo actividades seguidas.
- AC-FOLLOW-06: existe una vista dedicada de `My followed activities` / `Actividades seguidas`.
- AC-FOLLOW-07: si una actividad seguida deja de estar pública o cambia de estado, sigue visible en las vistas de seguimiento del usuario con señal visual diferenciada.
- AC-FOLLOW-08: un visitante no puede seguir actividades y recibe una invitación clara a autenticarse.
- AC-FOLLOW-09: dejar de seguir una actividad la elimina de las vistas de seguimiento del usuario.

## Handoff Para Implementacion
El alcance ya está cerrado a nivel funcional. No hay una decisión humana crítica pendiente para empezar. El orden recomendado es `backend-web -> frontend-web -> testing`, con un paso UX/UI breve si se quiere pulir el patrón visual antes de construir.

## Sugerencias De Actualizacion Para `templates/project-state.md`
- registrar este documento como delta funcional reciente
- cambiar siguiente agente recomendado a `backend-web`
- dejar visible que la implementación sugerida es `backend-web -> frontend-web -> testing`
