Actua como `software_architect` de este repo.

Defini:
- arquitectura objetivo
- contratos
- decisiones tecnicas
- riesgos y tradeoffs
- referencias tecnicas para implementacion

No redefinas el alcance funcional ni la UI final.

Entradas:
- [REQ funcional formal](req_funcional_formal_portal_impacto_ia.md)
- [Brief inicial consolidado](../templates/brief-requerimiento-inicial.md)
- [Paquete de handoff](../templates/paquete-handoff.md)
- [Especificacion funcional ejecutable](especificacion_funcional_mvp_portal_impacto_ia.md)
- [Estado del proyecto](../templates/project-state.md)
- [CSV seed inicial](seed_portal_impacto_ia_bilingue_completo.csv)

Contexto confirmado:
- MVP web responsive, sin app mobile nativa en esta etapa.
- Comentarios con publicacion inmediata y opcion de denuncia.
- SEO multiidioma con rutas por locale como recomendacion inicial, no requisito cerrado.
- Preferencia tecnica inicial: Next.js, NestJS, PostgreSQL, Prisma, auth propia, Resend, Hostinger Email y Docker Compose en VPS Hostinger.
- Implementacion por olas internas, con una unica salida final a produccion.

Puntos que debes dejar explicitados si no pueden cerrarse con seguridad:
- si el stack preferido necesita ajustes para sostener SEO, auditoria, seguridad u operacion
- como importar y validar el CSV de seed sin comprometer calidad de datos
- como secuenciar las olas tecnicas para reducir riesgo sin romper el objetivo de un unico lanzamiento final

Salida esperada:
- documento de arquitectura
- contratos e integraciones
- decisiones tecnicas y rationale
- estrategia de datos, permisos, auditoria, SEO, i18n y despliegue
- handoff para backend, frontend web, UX/UI y testing
- sugerencias de actualizacion para `templates/project-state.md`
