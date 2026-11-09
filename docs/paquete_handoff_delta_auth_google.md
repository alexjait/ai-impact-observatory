# Paquete De Handoff Delta Auth Google

## Objetivo Del Paquete
Pedir al agente `functional_analyst` que incorpore el nuevo requerimiento de autenticacion con Google al alcance vigente del MVP sin reabrir el resto del proyecto.

## Cambio Solicitado
- El usuario debe poder registrarse con email y contrasena.
- El usuario tambien debe poder registrarse e iniciar sesion mediante Google.

## Alcance Del Delta
- Ajustar el alcance funcional de autenticacion y cuenta.
- Ajustar backlog y criterios de aceptacion impactados.
- Dejar explicitadas reglas de negocio necesarias para convivir con auth por email y auth social.
- Identificar impacto minimo en arquitectura, UX/UI, backend, frontend web y testing.

## Fuera De Alcance
- Redefinir el MVP completo.
- Elegir librerias o framework concreto de OAuth.
- Implementar Google Sign-In.
- Redisenar backoffice, editorial, moderacion o catalogo.

## Entradas Utilizadas
- [REQ funcional formal](req_funcional_formal_portal_impacto_ia.md)
- [Brief inicial](../templates/brief-requerimiento-inicial.md)
- [Especificacion funcional vigente](especificacion_funcional_mvp_portal_impacto_ia.md)
- [Arquitectura vigente](arquitectura_mvp_portal_impacto_ia.md)
- [Contratos vigentes](contratos_mvp_portal_impacto_ia.md)
- [UX/UI vigente](ux_ui_mvp_portal_impacto_ia.md)
- [Estado del proyecto](../templates/project-state.md)

## Hallazgo Que Dispara El Delta
La documentacion aprobada y la implementacion inicial del backend contemplan autenticacion propia con email y contrasena, pero no contemplan registro o login mediante Google.

## Decisiones Ya Cerradas Que Deben Mantenerse
- El MVP sigue siendo web responsive.
- La auth por email y contrasena sigue existiendo.
- La implementacion sigue organizada en olas internas.
- No se reabre el alcance de comentarios, moderacion, editorial ni seed por este cambio.

## Preguntas Que El Siguiente Agente Debe Cerrar O Escalar
- Si Google aplica a `registro + login` o tambien a vinculacion posterior de cuenta existente.
- Que debe pasar si ya existe una cuenta por email y el usuario intenta entrar con Google usando el mismo email.
- Si el sistema debe permitir cuentas solo-sociales sin password local.
- Que datos minimos del perfil se aceptan desde Google y cuales siguen siendo editables localmente.
- Que terminos, consentimiento o textos adicionales deben mostrarse en registro/login social.

## Entregables Esperados
- Delta funcional de autenticacion y cuenta.
- Criterios de aceptacion actualizados.
- Backlog ajustado solo en los paquetes impactados.
- Lista de decisiones humanas pendientes, si queda alguna.
