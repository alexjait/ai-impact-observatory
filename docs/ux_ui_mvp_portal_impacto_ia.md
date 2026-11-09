# UX UI MVP

## Resumen
Esta especificacion define la experiencia del portal y del backoffice para el MVP web responsive. El objetivo es que frontend y testing puedan implementar y validar la experiencia sin adivinar comportamiento, estados ni jerarquia de informacion.

La UX debe transmitir tres ideas en cada recorrido:
- observatorio serio y trazable
- lectura clara de impacto IA por actividad
- separacion visible entre criterio editorial y aporte comunitario

## Direccion De Experiencia
- tono visual: observatorio editorial, confiable, escaneable y contemporaneo
- foco principal: actividad, no profesion
- jerarquia de lectura: estado oficial, resumen editorial, evidencia, comunidad
- lenguaje de interfaz: claro, neutral, sin dramatizacion
- responsive first: todo debe resolverse bien en mobile web y desktop, aunque no haya app nativa

## Principios UX
- una persona debe entender para que sirve el portal en menos de 10 segundos
- la escala 0 a 5 de impacto IA debe ser comprensible sin leer documentacion larga
- el sistema debe invitar a explorar, pero no ocultar la trazabilidad editorial
- las tareas de backoffice deben requerir pocas decisiones por pantalla y contexto suficiente
- los formularios deben minimizar friccion y prevenir duplicados antes de enviar

## Mapa De Flujos

## Flujo 1. Descubrimiento Publico
1. visitante entra a home
2. entiende propuesta de valor y opciones de navegacion
3. busca o explora por rubro, categoria o nivel de impacto
4. abre una actividad
5. revisa resumen editorial, estado oficial, evidencias y comentarios
6. decide explorar otra actividad, abrir evidencia o autenticarse para aportar

## Flujo 2. Registro Y Login
1. visitante intenta comentar o proponer
2. se le ofrece login o registro
3. completa email, password y terminos
4. vuelve al contexto previo despues de autenticarse

## Flujo 3. Propuesta De Actividad
1. usuario autenticado entra a nueva actividad
2. completa titulo, granularidad, taxonomias y descripciones bilingues
3. el sistema detecta posibles duplicados
4. el usuario corrige o confirma
5. envia propuesta
6. ve estado `pending` en su area privada

## Flujo 4. Propuesta De Evidencia
1. usuario autenticado entra a nueva evidencia
2. selecciona actividad o actividades
3. completa tipo, fuente, resumen, contexto y traducciones
4. envia propuesta
5. ve confirmacion y estado `pending`

## Flujo 5. Comentarios Y Denuncia
1. usuario autenticado comenta actividad o evidencia
2. el comentario se publica inmediatamente
3. otro usuario puede responder o denunciar
4. moderacion revisa contenido denunciado en backoffice

## Flujo 6. Moderacion
1. moderador entra al backoffice
2. revisa cola filtrada por tipo y estado
3. abre item en vista de detalle con contexto
4. aprueba, rechaza, pide correccion, oculta o archiva
5. el sistema registra actor, fecha y razon

## Flujo 7. Editorial
1. editor abre actividad aprobada
2. revisa estado actual, historial y evidencias asociadas
3. actualiza estado oficial y resumen editorial
4. registra fundamento obligatorio
5. la ficha publica refleja el cambio

## Arquitectura De Informacion

## Publico
- Home
- Explorar actividades
- Detalle de actividad
- Detalle de evidencia
- Metodologia
- Login
- Registro

## Usuario Autenticado
- Mi perfil
- Mis propuestas de actividades
- Mis propuestas de evidencias
- Nueva actividad
- Nueva evidencia

## Backoffice
- Dashboard
- Cola de moderacion
- Actividades
- Evidencias
- Comentarios
- Editorial
- Taxonomias
- Usuarios
- Historial

## Navegacion

## Header Publico
- logo y nombre del portal
- search global visible en desktop
- navegar por explorar
- enlace a metodologia
- selector de idioma
- login o avatar

## Navegacion Desktop
- header fijo liviano
- filtros laterales en exploracion
- backoffice con sidebar persistente

## Navegacion Mobile Web
- header compacto
- search accesible desde home y explore
- filtros en drawer inferior o lateral
- tabs o secciones plegables para actividad y evidencia
- backoffice usable desde mobile, pero optimizado prioritariamente para tablet y desktop

## Especificacion De Pantallas

## 1. Home
Objetivo:
- explicar el producto
- ofrecer acceso rapido a explorar y buscar
- mostrar que hay catalogo real y evidencia

Bloques:
- hero con propuesta de valor
- search principal
- acceso a rubros destacados
- explicacion simple de la escala IA
- actividades o sectores destacados
- CTA a metodologia
- CTA a registrarse para aportar

Estados:
- normal
- cargando destacados
- vacio si aun no hay destacados
- error de carga parcial

## 2. Explorar Actividades
Objetivo:
- permitir discovery y filtrado rapido

Layout desktop:
- columna lateral de filtros
- columna principal con resultados

Layout mobile:
- filtros en drawer
- chips activos visibles encima del listado

Comportamiento:
- search persistente
- filtros combinables
- paginacion o carga incremental
- resultados con resumen corto, badge de estado y taxonomias clave

Estados:
- sin resultados
- cargando listado
- error

## 3. Detalle De Actividad
Jerarquia:
1. titulo y granularidad
2. estado oficial de avance IA
3. resumen editorial
4. evidencias aprobadas
5. comentarios
6. relaciones

Bloques:
- encabezado con titulo, taxonomias y badge de estado
- panel corto con definicion textual del nivel 0 a 5 actual
- resumen editorial
- timeline breve o historial resumido si existe
- listado de evidencias
- composer de comentario para usuarios autenticados
- lista de comentarios

Reglas UX:
- el estado oficial nunca debe depender solo del color
- evidencia editorial y comunitaria deben diferenciarse
- si una actividad no tiene suficiente editorial, mostrar placeholder explicativo y no dejar huecos ambiguos

Estados:
- actividad aprobada completa
- actividad sin editorial suficiente
- actividad sin comentarios
- actividad con evidencias pero sin comentarios

## 4. Detalle De Evidencia
Bloques:
- titulo
- tipo de evidencia
- contexto y resumen
- fuente y URL
- fecha del hecho si existe
- actividades relacionadas
- comentarios

Reglas UX:
- la fuente debe ser visible y clickeable si hay URL
- si la evidencia esta marcada como baja confiabilidad o desactualizada, el aviso debe ser visible sin ocultar el contenido

## 5. Metodologia
Objetivo:
- explicar como leer el portal
- definir la escala 0 a 5
- aclarar diferencia entre editorial, evidencia y comunidad

Bloques:
- proposito del observatorio
- criterios para estados oficiales
- tipos de evidencia
- reglas de moderacion
- politica de idioma y trazabilidad

## 6. Login Y Registro
Reglas UX:
- formularios cortos
- copy directo
- foco inicial en email
- posibilidad de volver al contexto anterior luego del auth

Validaciones:
- email valido
- password con criterios minimos
- terminos obligatorios en registro

Estados:
- submit en progreso
- credenciales invalidas
- email ya registrado
- exito

## 7. Mi Perfil
Bloques:
- datos basicos
- idioma preferido de interfaz
- accesos rapidos a propuestas

Estados:
- sin propuestas
- con propuestas

## 8. Mis Propuestas
Separar:
- actividades
- evidencias

Cada item muestra:
- titulo
- tipo
- fecha
- estado
- accion disponible

Estados de item:
- pending
- approved
- rejected
- needs_correction
- archived

## 9. Nueva Actividad
Patron:
- formulario de una sola pagina con secciones

Secciones:
- identidad
- taxonomias
- contenido en espanol
- contenido en ingles

Comportamientos:
- autosave opcional si se implementa facil
- advertencia de duplicados antes del submit final
- resumen de validacion al inicio del formulario cuando hay errores

## 10. Nueva Evidencia
Secciones:
- tipo y fuente
- actividades vinculadas
- contenido en espanol
- contenido en ingles
- metadata opcional

Comportamientos:
- buscador de actividades vinculadas
- preview de fuente si hay URL valida puede quedar diferido

## 11. Comentarios
Patron:
- composer compacto
- lista jerarquica con un solo nivel de respuesta
- accion de denunciar visible pero secundaria

Estados:
- usuario no autenticado: CTA a login
- sin comentarios
- comentario enviado
- denuncia enviada

## 12. Dashboard Backoffice
Objetivo:
- mostrar volumen pendiente y accesos rapidos

Widgets:
- pendientes de moderacion
- actividades para revision editorial
- comentarios denunciados
- ultimas acciones

## 13. Cola De Moderacion
Layout desktop:
- tabla o lista rica con filtros arriba
- preview lateral o panel de detalle

Columnas sugeridas:
- tipo
- titulo o extracto
- autor
- fecha
- estado
- accion rapida

Acciones:
- aprobar
- rechazar
- pedir correccion
- ocultar
- archivar

## 14. Vista De Revision De Actividad
Debe mostrar:
- datos base
- traducciones
- taxonomias
- posibles duplicados
- historial
- acciones de moderacion

## 15. Vista De Revision De Evidencia
Debe mostrar:
- tipo
- fuente
- URL
- contexto
- actividades relacionadas
- flags de confiabilidad
- acciones de moderacion

## 16. Workspace Editorial De Actividad
Debe mostrar:
- estado oficial actual
- resumen editorial actual
- historial de cambios
- evidencias asociadas
- formulario de actualizacion con fundamento obligatorio

## 17. Taxonomias Y Usuarios
UX prioritaria:
- tablas simples
- formularios laterales o modales
- desactivar antes que borrar
- confirmaciones claras en acciones sensibles

## Componentes Clave
- badge de estado IA 0 a 5
- tarjeta de actividad
- tarjeta de evidencia
- banner editorial
- chip de taxonomia
- panel de trazabilidad
- tabla de moderacion
- composer de comentario
- selector de idioma
- mensajes inline de error y exito

## Sistema De Estados

## Loading
- skeletons para listados
- skeletons para detalle
- botones con spinner en submit

## Empty
- explorar sin resultados
- actividad sin comentarios
- usuario sin propuestas
- moderacion sin pendientes
- editorial sin evidencias asociadas

## Error
- error de red recuperable
- error de validacion inline
- error global con CTA a reintentar

## Success
- propuesta enviada
- comentario publicado
- denuncia enviada
- cambio editorial guardado
- moderacion aplicada

## Validaciones UX
- no permitir submit con campos obligatorios faltantes
- no ocultar errores arriba y abajo al mismo tiempo; usar resumen + inline
- explicar claramente porque una accion no esta disponible
- cuando exista posible duplicado, mostrarlo antes del envio final

## Notas Web Especificas
- search siempre visible en desktop publico
- detalle de actividad con sidebar contextual si el ancho lo permite
- backoffice optimizado primero para desktop
- tablas de moderacion con atajos y filtros persistentes
- locale path recomendado para vistas publicas

## Notas Mobile Web
- home y explore deben ser plenamente usables con una mano
- filtros en overlay, no en sidebar fija
- acciones principales siempre cerca del pulgar
- formularios largos con secciones plegables
- comentarios y evidencias deben colapsarse sin perder contexto
- backoffice mobile debe ser funcional, pero no tan denso como en desktop

## Notas Mobile Nativo
- fuera de alcance en esta etapa
- preservar semantica de componentes y contratos para futura app

## Accesibilidad
- objetivo minimo WCAG AA
- contraste suficiente en badges y banners
- estado IA expresado con texto, no solo color
- foco visible en toda accion navegable
- navegacion completa por teclado en web
- labels asociados a todos los campos
- mensajes de error conectados a inputs
- tablas con estructura accesible o alternativa mobile clara
- idioma de pagina correctamente declarado por locale

## Criterios UX Para Testing
- una persona nueva entiende la diferencia entre actividad, evidencia y metodologia desde la home
- una persona puede encontrar una actividad en menos de 3 pasos
- el estado oficial y el resumen editorial son visibles sin scroll excesivo en desktop
- el login devuelve al contexto original cuando corresponde
- el formulario de actividad bloquea envio con errores y muestra duplicados
- el formulario de evidencia permite asociar multiples actividades sin confusion
- el comentario se publica inmediatamente y la denuncia confirma recepcion
- un moderador resuelve un item desde la cola sin perder contexto
- un editor actualiza estado y resumen sin omitir fundamento
- la interfaz mantiene usabilidad basica en mobile web para recorridos publicos y de usuario
- el cambio de idioma no rompe navegacion ni deja pantallas vacias sin explicacion

## Handoff Para Frontend Web
- implementar layouts separados para publico, cuenta y backoffice
- respetar jerarquia de informacion: estado, editorial, evidencia, comunidad
- no simplificar la cola de moderacion a una sola lista sin filtros
- incorporar skeletons, empties, errores y confirmaciones desde el inicio

## Handoff Para Testing
- usar esta especificacion como fuente de comportamiento esperado
- probar desktop y mobile web
- cubrir estados vacios, errores y permisos
- cubrir cambio de idioma y retorno al contexto post-login

## Sugerencias Para `templates/project-state.md`
- marcar `UX/UI Definido` como `Si`
- mover la etapa a `Gate 2 listo para aprobacion`
- cambiar siguiente agente recomendado a `backend-web` una vez aprobada la solucion completa
