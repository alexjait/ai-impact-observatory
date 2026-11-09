# Delta De Negocio

## Tema
Footer institucional bilingue con enlaces legales y canal de contacto ligero.

## Resumen Del Problema U Oportunidad
Hoy el portal ya tiene un catalogo publico, detalle de actividades, evidencia, propuestas y backoffice, pero todavia no ofrece una capa institucional minima al pie de pagina. Eso deja varias senales incompletas:

- falta una referencia clara de propiedad y vigencia del sitio
- no hay acceso visible a Terminos y Condiciones
- no hay acceso visible a Politica de Privacidad
- no existe un canal sencillo para escribir al proyecto desde el sitio

La oportunidad es sumar un footer liviano, bilingue y consistente con la etapa actual del portal, que mejore confianza, cierre institucional basico y permita recibir mensajes de contacto sin convertir todavia al producto en una plataforma de soporte compleja.

## Objetivo De Negocio
Dar al portal una base institucional minima y visible para usuarios publicos y autenticados, incorporando:

- copyright bilingue en el pie
- enlaces legales visibles
- un canal de contacto simple
- una forma basica de revisar mensajes recibidos desde backoffice

## Usuarios O Actores
- Visitante: ve el footer, accede a paginas legales y puede usar contacto si se habilita para publico.
- Usuario registrado: accede al mismo footer y tambien puede enviar contacto.
- Administrador o backoffice: puede revisar mensajes de contacto recibidos.

## Valor Esperado
- aumenta la confianza percibida del sitio
- da cierre mas profesional al portal sin volverlo corporativo en exceso
- facilita que una persona externa escriba sin buscar un canal alternativo
- crea una primera bandeja interna de mensajes sin necesidad de email marketing o CRM

## Propuesta De Alcance Para Este Delta
Alcance recomendado:
- footer visible en todo el sitio publico y en superficies autenticadas donde corresponda
- texto de copyright bilingue:
  - ES: `© 2026 Observatorio de Impacto IA. Todos los derechos reservados.`
  - EN: `© 2026 AI Impact Observatory. All rights reserved.`
- links visibles a:
  - Terminos y Condiciones
  - Politica de Privacidad
  - Contacto
- pagina publica de contacto con formulario simple
- registro de mensajes para consulta desde backoffice

Alcance no recomendado en esta etapa:
- mesa de ayuda completa
- hilos de conversacion
- respuestas desde la plataforma
- adjuntos
- categorias complejas de soporte
- notificaciones avanzadas o automatizaciones

## Decisiones De Negocio Recomendadas
- El footer debe sentirse institucional pero sobrio, sin cargar demasiado la navegacion.
- Terminos y Politica pueden empezar como paginas simples, claras y honestas para esta etapa del portal.
- Contacto debe ser un canal liviano de entrada, no un sistema de tickets.
- Los mensajes de contacto deben quedar visibles en backoffice para consulta, aunque al principio no haya workflow complejo de estados.
- Conviene permitir contacto desde publico, no solo con sesion iniciada, para no frenar a personas interesadas.

## Supuestos Explícitos
- En esta etapa, un canal de contacto sencillo ya aporta valor.
- La revision de mensajes puede empezar con una vista simple en backoffice.
- El sitio no necesita todavia un centro de ayuda, FAQ extensa ni un modulo de soporte completo.
- El footer debe reforzar confianza y orientacion, no sumar ruido visual.

## Criterios De Exito De Negocio
- El usuario encuentra facilmente el footer y sus enlaces.
- Puede acceder a Terminos, Politica y Contacto desde cualquier recorrido relevante.
- El formulario de contacto resulta claro y corto.
- El equipo puede revisar mensajes recibidos desde backoffice sin depender de una casilla externa como unico canal operativo.

## Restricciones Y Riesgos
- Si Terminos y Politica quedan demasiado vacios o ambiguos, pueden bajar confianza en vez de subirla.
- Si Contacto se vuelve demasiado largo o burocratico, baja la conversion.
- Si el backoffice de mensajes nace con demasiadas funciones, el alcance crece sin necesidad.

## Dudas Abiertas Para La Siguiente Etapa
- Que campos minimos debe pedir el formulario de contacto.
- Si conviene aceptar contacto anonimo, identificado o ambos.
- Si los mensajes necesitan algun estado simple como `nuevo`, `leido` o `archivado`.
- Si ademas del footer conviene sumar un enlace a Metodologia o Acerca del proyecto.

## Consideraciones Transversales

### Legal Y Transparencia
- aplica: si
- alcance o contexto: el footer y las paginas legales ayudan a dar marco minimo al portal.
- decisiones tomadas: incluir Terminos y Politica visibles desde footer.
- dudas abiertas: nivel de detalle juridico inicial.

### Operacion Interna
- aplica: si
- alcance o contexto: los mensajes de contacto deben poder revisarse desde backoffice.
- decisiones tomadas: bandeja simple, sin convertirlo en helpdesk.
- dudas abiertas: definir si alcanza con vista simple o si hace falta estado basico.

### Identidad Del Producto
- aplica: si
- alcance o contexto: el footer debe sumar confianza sin sonar demasiado corporativo.
- decisiones tomadas: tono sobrio y directo.
- dudas abiertas: si sumar un enlace institucional extra como `Acerca de`.

## Version Mapeada A `brief-requerimiento-inicial.md`

### Problema U Oportunidad
El portal no tiene todavia una capa institucional minima visible ni un canal simple de contacto.

### Objetivo De Negocio
Agregar footer bilingue, enlaces legales y contacto simple con consulta interna desde backoffice.

### Usuarios O Actores
- Visitante y usuario registrado: consumen footer y pueden usar contacto.
- Administrador/backoffice: revisa mensajes recibidos.

### Plataformas Esperadas
- Portal web publico responsive
- Backoffice web para lectura de mensajes

### Restricciones Conocidas
- El contacto debe ser liviano.
- No se busca un sistema completo de soporte.
- Las paginas legales pueden ser simples en esta etapa.

### Integraciones Conocidas
- No requiere integraciones externas obligatorias en el primer alcance si los mensajes se guardan en la base.

### Fecha O Prioridad
- Prioridad media como mejora institucional y operativa.

### Criterios De Exito
- Footer visible y claro.
- Paginas legales accesibles.
- Contacto utilizable.
- Mensajes visibles en backoffice.

### Dudas Abiertas
- Campos del formulario.
- Contacto anonimo vs autenticado.
- Estado operativo de mensajes.
- Posibles enlaces institucionales extra.

## Handoff Para Functional Analyst
No hace falta redescubrir el problema. La siguiente etapa debe convertir este paquete en comportamiento verificable: estructura del footer, paginas publicas, campos del formulario, reglas de acceso, comportamiento en backoffice y alcance exacto de la bandeja de mensajes. Conviene mantenerlo como una capacidad institucional liviana, no como un modulo de soporte completo.

## Sugerencias De Actualizacion Para `templates/project-state.md`
- registrar este delta como nuevo paquete de descubrimiento institucional
- cambiar el siguiente agente recomendado a `functional_analyst`
- dejar explicitado que el footer simple es una parte obvia del paquete, pero que Contacto y la bandeja de mensajes requieren definicion funcional antes de implementar
