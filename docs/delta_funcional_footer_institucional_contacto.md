# Delta Funcional Footer Institucional, Paginas Legales Y Contacto

## Resumen
Este delta funcional agrega una capa institucional minima al portal mediante un footer bilingue, paginas legales simples y un canal de contacto liviano con lectura desde backoffice.

El objetivo es reforzar claridad, confianza y operacion basica sin transformar el producto en un sistema de soporte complejo.

## Cambio Funcional Incorporado

### Footer Institucional
Se incorpora un footer visible en las superficies publicas y autenticadas principales del portal.

El footer debe incluir:
- copyright bilingue
- link a `Terms and Conditions / Términos y Condiciones`
- link a `Privacy Policy / Política de Privacidad`
- link a `Contact / Contacto`

### Paginas Legales
Se agregan dos paginas publicas e informativas:
- `Terms and Conditions / Términos y Condiciones`
- `Privacy Policy / Política de Privacidad`

En esta etapa pueden ser paginas simples, claras y honestas respecto del alcance real del portal.

### Contacto
Se agrega una pagina publica `Contact / Contacto` con un formulario simple para enviar mensajes al proyecto.

### Backoffice De Contacto
Se agrega una vista en backoffice para consultar mensajes recibidos desde el formulario de contacto.

## Reglas De Negocio Del Delta

### 1. El footer debe ser bilingue y consistente con el locale actual
- El texto y los links deben respetar `en` y `es`.
- El copyright debe adaptarse al idioma visible.

### 2. Las paginas legales son publicas
- Cualquier visitante puede acceder a Terminos y Politica.
- No requieren autenticacion.

### 3. El canal de contacto es simple
- No es una mesa de ayuda.
- No requiere flujos de respuesta, asignacion ni hilos.
- La accion principal es recibir mensajes y permitir su lectura en backoffice.

### 4. El formulario de contacto puede ser usado por visitantes y usuarios autenticados
- Debe permitir envio sin requerir inicio de sesion.
- Si el usuario esta autenticado, el sistema puede asociar internamente el mensaje con su cuenta.
- En todos los casos, el formulario debe capturar al menos identidad basica de contacto.

### 5. Campos minimos del formulario
- nombre
- email
- mensaje

Campo recomendado adicional:
- asunto

### 6. Los mensajes deben quedar visibles en backoffice
- Los usuarios con acceso a backoffice deben poder consultar mensajes recibidos.
- La bandeja debe mostrar al menos:
  - nombre
  - email
  - asunto si existe
  - mensaje
  - fecha
  - estado simple del mensaje
  - cuenta asociada si el remitente estaba autenticado

### 7. Estado operativo minimo de mensajes
Cada mensaje puede estar en uno de estos estados:
- `new`
- `read`
- `archived`

No se requiere mas detalle en esta etapa.

## Alcance Funcional

### Incluido
- footer bilingue
- copyright bilingue
- links visibles a Terminos, Politica y Contacto
- pagina publica de Terminos
- pagina publica de Politica
- pagina publica de Contacto con formulario simple
- persistencia de mensajes de contacto
- bandeja de mensajes en backoffice
- cambio basico de estado `new / read / archived`

### No Incluido
- respuestas desde la plataforma
- adjuntos
- categorias complejas de consulta
- SLA
- panel de analytics de contacto
- notificaciones por email
- automatizaciones de follow-up

## Impacto En Alcance Funcional Vigente

### Se actualiza
- shell global del sitio
- navegacion institucional
- superficie publica de confianza
- backoffice con una bandeja operativa adicional

### No se modifica
- catalogo de actividades
- evidencia
- moderacion editorial
- comentarios
- propuestas
- seed

## Flujos Funcionales Esperados

### Flujo 1. Navegacion institucional desde footer
1. Usuario llega a cualquier pagina principal del portal.
2. Ve el footer con copyright y enlaces institucionales.
3. Puede abrir Terminos, Politica o Contacto sin perder coherencia de locale.

### Flujo 2. Envio de contacto por visitante
1. Visitante entra a `Contacto`.
2. Completa nombre, email y mensaje.
3. Envía el formulario.
4. El sistema registra el mensaje y devuelve confirmacion clara.

### Flujo 3. Envio de contacto por usuario autenticado
1. Usuario autenticado entra a `Contacto`.
2. Puede completar o confirmar sus datos.
3. Envía el mensaje.
4. El mensaje queda guardado y asociado a su cuenta cuando corresponda.

### Flujo 4. Consulta de mensajes en backoffice
1. Usuario con acceso a backoffice entra a la bandeja de contacto.
2. Ve mensajes ordenados por fecha descendente.
3. Puede identificar remitente, email, asunto, fecha y cuerpo.
4. Puede cambiar estado basico del mensaje.

## Requisitos No Funcionales
- El footer no debe sobrecargar ni romper la navegacion actual.
- Las paginas legales deben ser legibles en mobile y desktop.
- El formulario de contacto debe ser corto y claro.
- La bandeja de backoffice debe priorizar legibilidad sobre complejidad.

## Riesgos, Restricciones Y Dependencias
- Si el formulario pide demasiados campos, baja conversion.
- Si el footer suma demasiados links, pierde claridad.
- Si la bandeja nace demasiado compleja, se expande el alcance sin necesidad.

## Backlog Impactado Por Especialidad

### Backend
- BE-CONTACT-01: persistir mensajes de contacto
- BE-CONTACT-02: permitir alta publica de mensaje
- BE-CONTACT-03: listar mensajes en backoffice
- BE-CONTACT-04: actualizar estado simple de mensaje

### Frontend Web
- FEW-FOOTER-01: agregar footer institucional bilingue
- FEW-FOOTER-02: agregar paginas de Terminos y Politica
- FEW-FOOTER-03: agregar pagina de Contacto
- FEW-FOOTER-04: integrar formulario de contacto
- FEW-FOOTER-05: agregar bandeja de contacto en backoffice

### UX/UI
- UX-FOOTER-01: definir pie visual sobrio y consistente
- UX-FOOTER-02: definir patron de pagina legal simple
- UX-FOOTER-03: definir patron de formulario corto de contacto
- UX-FOOTER-04: definir bandeja de lectura simple en backoffice

### Testing
- QA-FOOTER-01: validar footer y links institucionales
- QA-FOOTER-02: validar carga de contacto
- QA-FOOTER-03: validar persistencia y visualizacion en backoffice
- QA-FOOTER-04: validar cambio de estado de mensajes

## Paquetes De Implementacion Sugeridos

### Slice 1
- footer bilingue
- paginas legales
- pagina de contacto

### Slice 2
- persistencia de contacto
- envio del formulario
- bandeja simple en backoffice

### Slice 3
- estados `new / read / archived`
- validacion y regresion end to end

## Criterios De Aceptacion
- AC-FOOTER-01: el sitio muestra un footer bilingue con copyright visible.
- AC-FOOTER-02: el footer expone links funcionales a Terminos, Politica y Contacto.
- AC-FOOTER-03: un visitante puede enviar un mensaje desde Contacto.
- AC-FOOTER-04: un usuario autenticado tambien puede enviar un mensaje desde Contacto.
- AC-FOOTER-05: el mensaje queda visible en una bandeja de backoffice.
- AC-FOOTER-06: la bandeja muestra remitente, email, fecha y contenido del mensaje.
- AC-FOOTER-07: un usuario de backoffice puede cambiar el estado del mensaje entre `new`, `read` y `archived`.

## Handoff Para Implementacion
No quedan dudas criticas para empezar. La implementacion sugerida es `backend-web -> frontend-web -> testing`, manteniendo el alcance deliberadamente simple.

## Sugerencias De Actualizacion Para `templates/project-state.md`
- registrar este documento como delta funcional en preparacion
- cambiar el siguiente agente recomendado a `backend-web`
- dejar explicitado que el paquete institucional ya no tiene una duda funcional bloqueante
