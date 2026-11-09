Actua como `functional_analyst` de este repo.

Necesito un delta funcional acotado, no una reescritura completa.

Incorpora este nuevo requerimiento al alcance vigente del MVP:
- el usuario puede registrarse con email y contrasena
- el usuario tambien puede registrarse e iniciar sesion via Google

Tu tarea es transformar este cambio en:
- delta de alcance funcional
- backlog impactado por especialidad
- criterios de aceptacion actualizados
- reglas de negocio necesarias para convivir con auth local y auth social

No redefinas arquitectura ni UI final.
No reabras modulos no afectados.

Entradas:
- [REQ funcional formal](req_funcional_formal_portal_impacto_ia.md)
- [Brief inicial](../templates/brief-requerimiento-inicial.md)
- [Especificacion funcional vigente](especificacion_funcional_mvp_portal_impacto_ia.md)
- [Arquitectura vigente](arquitectura_mvp_portal_impacto_ia.md)
- [Contratos vigentes](contratos_mvp_portal_impacto_ia.md)
- [UX/UI vigente](ux_ui_mvp_portal_impacto_ia.md)
- [Paquete delta auth Google](paquete_handoff_delta_auth_google.md)
- [Estado del proyecto](../templates/project-state.md)

Puntos que debes dejar explicitados si no pueden cerrarse con seguridad:
- politica de colision entre cuenta local y cuenta Google con mismo email
- si se permiten cuentas solo-sociales sin password local
- datos minimos del perfil provenientes de Google
- impacto sobre terminos, consentimiento y recuperacion de cuenta

Salida esperada:
- delta funcional ejecutable
- backlog impactado por arquitectura, UX/UI, backend, frontend web y testing
- criterios de aceptacion actualizados solo donde corresponda
- supuestos, riesgos, dependencias y decisiones humanas pendientes
- sugerencias de actualizacion para `templates/project-state.md`
