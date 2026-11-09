# Paquete De Handoff

## Objetivo Del Paquete
Pedir al agente `software_architect` que transforme el alcance funcional aprobado del portal en una arquitectura implementable, con decisiones tecnicas, contratos, estrategia de datos, permisos y lineamientos de integracion para el resto del equipo.

## Alcance Incluido
- Arquitectura objetivo para el MVP web responsive.
- Modelo de datos de alto nivel y decisiones de persistencia.
- Contratos funcionales para portal publico, autenticacion, actividades, evidencias, comentarios, moderacion y editorial.
- Estrategia para i18n, SEO, seed data, permisos, auditoria y despliegue.
- Handoff tecnico consumible por backend, frontend web, UX/UI y testing.

## Fuera De Alcance
- Redefinicion del alcance funcional aprobado.
- Diseno UX/UI detallado.
- Implementacion tecnica.
- Testing ejecutado.

## Entradas Utilizadas
- [REQ funcional formal](../docs/req_funcional_formal_portal_impacto_ia.md)
- [Brief inicial consolidado](brief-requerimiento-inicial.md)
- [Especificacion funcional ejecutable](../docs/especificacion_funcional_mvp_portal_impacto_ia.md)
- [CSV seed inicial](../docs/seed_portal_impacto_ia_bilingue_completo.csv)
- [Estado del proyecto](project-state.md)
- Reglas del flujo operativo en [software-delivery-workflow.md](../process/software-delivery-workflow.md)

## Decisiones Tomadas
- El producto objetivo es un portal web colaborativo y curado sobre impacto de IA en actividades humanas.
- El objeto central del dominio es la actividad.
- El sistema debe nacer preparado para `en` y `es`.
- El lanzamiento editorial recomendado prioriza ingles.
- El estado oficial de avance IA requiere intervencion editorial y trazabilidad.
- El MVP incluye frontend publico, autenticacion, propuestas, comentarios, moderacion, editorial, taxonomias e historial minimo.
- El MVP queda confirmado como web responsive sin app mobile dedicada.
- La politica inicial de comentarios sera publicacion inmediata con opcion de denuncia.
- El seed inicial oficial para la primera salida publica sera [seed_portal_impacto_ia_bilingue_completo.csv](../docs/seed_portal_impacto_ia_bilingue_completo.csv).
- El SEO multiidioma con rutas por locale queda como recomendacion inicial, no como requisito cerrado.
- Preferencia tecnica de negocio para la siguiente etapa: Next.js, NestJS, PostgreSQL, Prisma, auth propia, Resend, Hostinger Email y Docker Compose en VPS Hostinger.
- La implementacion del MVP se ejecutara en olas internas, con un unico lanzamiento a produccion cuando la app completa este lista.

## Supuestos
- El alcance funcional ya puede considerarse aprobado para pasar a solucion.
- El stack preferido puede ajustarse solo si `software_architect` documenta una razon clara.

## Riesgos
- El alcance del MVP puede ser demasiado amplio para una primera entrega sin recorte adicional.
- La calidad y consistencia del CSV de seed debe validarse antes de importarlo.
- La preferencia tecnica debe contrastarse con necesidades de SEO, auditoria, seguridad y operacion real.

## Entregables
- Paquete de entrada listo para `software_architect`.
- Estado del proyecto actualizado.
- Alcance funcional ya cerrado para la etapa de solucion.

## Pedido Al Siguiente Agente
Actuar como `software_architect` de este repo y transformar las entradas en:
- arquitectura objetivo
- decisiones tecnicas y tradeoffs
- contratos e integraciones
- estrategia de datos, permisos, auditoria, i18n, SEO y despliegue
- lineamientos de implementacion para backend, frontend web, UX/UI y testing

No redefinir el alcance funcional ni la UI final.

Preguntas que debe dejar explicitas si no puede cerrarlas con seguridad:
- si el stack preferido necesita ajustes para sostener SEO, auditoria o operacion
- como importar y validar el CSV de seed sin comprometer calidad de datos
- como secuenciar las olas tecnicas para reducir riesgo sin romper el objetivo de un unico lanzamiento final
