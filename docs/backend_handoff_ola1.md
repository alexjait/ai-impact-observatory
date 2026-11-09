# Handoff Backend Olas 1 y 2

## Cambios implementados
- Bootstrap de backend NestJS en `backend/`.
- Schema Prisma para usuarios, identidades de auth, estados temporales OAuth, roles, sesiones, taxonomias, actividades, evidencias, propuestas, comentarios, reportes, historial editorial, acciones de moderacion y seed imports.
- Endpoints de salud, auth, perfil, auth Google, catalogo publico, metodologia, taxonomias, propuestas, comentarios, reportes, moderacion y editorial.
- Endpoint admin para importar el CSV oficial de seed y consultar la corrida.
- Prisma Client generado.
- Migraciones creadas en `backend/prisma/migrations/`.

## Alcance cubierto en esta ola
- Auth web basada en sesion.
- Soporte de identidad local + Google bajo una misma sesion de portal.
- Taxonomias base para discovery.
- Actividades publicas.
- Evidencias publicas.
- Propuestas de actividades.
- Propuestas de evidencias.
- Comentarios publicos con respuesta simple.
- Denuncia de comentarios.
- Metodologia publica.
- Base de importacion controlada del seed.
- Cola inicial de moderacion por API.
- Surface editorial real por API para revisar actividades importadas, editar resumen editorial, cambiar estado oficial y publicar contenido del seed con trazabilidad.
- Filtros editoriales operativos por `q`, `hasEditorialSummary`, `hasEvidence`, `officialAiStatus`, `industry` y `category`.
- Navegacion de revision editorial por lane (`previousId` / `nextId`) dentro del detalle de actividad.
- Actualizacion masiva de estado editorial por `ids[]` con trazabilidad por item.
- Detalle moderador por `id` para propuestas de actividad y evidencia.
- Busqueda operativa en colas de moderacion para propuestas, comentarios y actividades seed.
- Busqueda de comentarios moderables por actividad o evidencia asociada, con contexto enriquecido del target para consumo de backoffice.

## Fuera de esta implementacion inicial
- CRUD administrativo de taxonomias y usuarios.
- Integracion real con Resend.

## Setup tecnico
- Backend ubicado en `backend/`.
- Variables base en `backend/.env.example`.
- Dependencias ya instaladas en esta sesion.
- Build validado con `npm run build`.

## Limitaciones conocidas
- `forgot password` genera token en DB pero no envia email aun.
- El seed importa actividades a estado editorial `pending`.
- La busqueda usa Prisma sobre Postgres y no incorpora motor dedicado.
- La aprobacion de propuestas cambia su estado de moderacion, pero aun no materializa automaticamente una entidad publica final derivada de la propuesta.
- La cola de moderacion ya soporta busqueda, incluido contexto de actividad/evidencia para comentarios reportados, pero la UI de backoffice todavia puede aprovechar mejor ese dato enriquecido.
- La accion masiva editorial ya tiene UI en backoffice y smoke de regresion, pero aun puede ganar ergonomia adicional para throughput alto del seed.

## Verificacion realizada
- Verificacion estructural de archivos creados.
- Revision manual del schema Prisma y del cableado de modulos principales.
- Generacion de Prisma Client exitosa.
- Compilacion TypeScript y Nest exitosa.
- Migraciones aplicadas localmente en PostgreSQL.
- `npm run smoke:auth:local` exitoso.
- `npm run smoke:editorial` exitoso.
- `npm run smoke:contributions` exitoso.
- `npm run smoke:contributions` exitoso validando tambien busqueda de comentario reportado por actividad asociada.
- `powershell -ExecutionPolicy Bypass -File .\scripts\run-smoke-suite.ps1` exitoso.

## Recomendacion para QA y siguientes agentes
- `frontend-web` ya consume seleccion multiple y bulk actions sobre la API editorial.
- `testing` ya puede ampliar regresion sobre bulk actions editoriales desde UI.
- Backend puede continuar luego con materializacion de propuestas aprobadas, CRUD admin y auditoria mas fina.
