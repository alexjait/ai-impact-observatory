# Brief Inicial

## Problema U Oportunidad
La informacion sobre como la IA impacta tareas, funciones, roles y profesiones esta dispersa, es heterogenea y mezcla evidencia real con opinion o hype. No existe una fuente centralizada, navegable y trazable que permita entender que actividades concretas ya estan siendo asistidas, transformadas o reemplazadas por IA y con que evidencia.

## Objetivo De Negocio
Construir un portal web publico y colaborativo que funcione como observatorio estructurado del impacto de la IA en actividades humanas, con foco en evidencia, curaduria editorial, trazabilidad y crecimiento escalable del catalogo.

## Usuarios O Actores
- Visitante: navega, busca, filtra y consulta actividades y evidencias publicas.
- Usuario registrado: propone actividades y evidencias, comenta y participa.
- Moderador: revisa propuestas, comentarios y reportes.
- Editor: consolida criterio editorial y actualiza el estado oficial de avance IA.
- Administrador: gestiona usuarios, roles y taxonomias.

## Plataformas Esperadas
- Portal web publico responsive.
- Backoffice web para moderacion, editorial y administracion.
- Arquitectura preparada para multiidioma desde el inicio.
- No habra app mobile nativa en el MVP.

## Restricciones Conocidas
- El MVP debe ser navegable, colaborativo y curado.
- La entidad principal del dominio es la actividad, no solo la profesion.
- Debe soportar `en` y `es` desde el inicio sin duplicar entidades por idioma.
- El estado oficial de avance IA no puede actualizarse automaticamente por volumen de aportes.
- Debe existir trazabilidad editorial y separacion clara entre contenido publico, comunitario y editorial.
- El MVP excluye monetizacion activa, API publica, gamificacion, dashboards premium e ingesta automatica de noticias.
- No hay restricciones duras de plazo, presupuesto o equipo definidas en esta etapa.
- Preferencia tecnica para la siguiente etapa: Next.js, NestJS, PostgreSQL, Prisma, autenticacion propia con JWT o sesion externalizable luego, Resend para emails de aplicacion, Hostinger Email para emails humanos y Docker Compose sobre VPS Hostinger.

## Integraciones Conocidas
- Resend para emails transaccionales de la aplicacion.
- Hostinger Email para casillas humanas u operativas.
- La autenticacion segura y la gestion de roles son requisitos y pueden resolverse inicialmente con auth propia.

## Fecha O Prioridad
- Prioridad: avanzar a definicion de arquitectura y contratos.
- Recomendacion de lanzamiento del contenido editorial: prioridad en ingles (`en`) con expansion posterior en espanol (`es`).
- El SEO multiidioma con rutas separadas por locale queda como recomendacion inicial, no como requisito cerrado.

## Criterios De Exito
- Un visitante puede encontrar actividades por busqueda y navegacion tematica.
- Un visitante puede entender el estado de avance IA de una actividad y revisar su evidencia asociada.
- Un usuario autenticado puede proponer actividades, evidencias y comentarios.
- Un moderador puede operar una cola de revision.
- Un editor puede cambiar el estado oficial con fundamento obligatorio y auditoria.
- La UI soporta `en` y `es` con fallback sin romper navegacion ni administracion.
- La primera salida publica toma como base el archivo [seed_portal_impacto_ia_bilingue_completo.csv](../docs/seed_portal_impacto_ia_bilingue_completo.csv).

## Dudas Abiertas
No hay dudas abiertas criticas de alcance en esta etapa. La implementacion del MVP se realizara en olas internas, con construccion, testing y validacion por etapas hasta completar la app antes de la salida a produccion.
