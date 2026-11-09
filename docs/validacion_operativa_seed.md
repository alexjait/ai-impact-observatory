# Validacion Operativa Del Seed

## Objetivo
Usar el producto ya implementado con volumen real para detectar fricciones de operacion, catalogo publico y curacion antes de abrir nuevas olas funcionales.

## Alcance De Esta Fase
- curacion real de actividades importadas
- revision del catalogo publico con datos reales
- deteccion de fricciones de UX, navegacion, copy y throughput
- registro de hallazgos pequeños y accionables

## Precheck Tecnico
1. validar backend local levantado
2. validar frontend web levantado
3. correr la suite integral antes de empezar:
   - `powershell -ExecutionPolicy Bypass -File scripts/run-smoke-suite.ps1`
4. verificar acceso al backoffice con un usuario que tenga `ADMIN`, `EDITOR` y `MODERATOR`

## Ronda Recomendada
Trabajar en lotes chicos y reales:
- seleccionar `20 a 40` actividades pendientes
- intentar dejar `5 a 10` aprobadas y visibles
- usar mezcla de casos:
  - actividades con evidencia
  - actividades sin evidencia
  - actividades con resumen incompleto
  - actividades faciles de aprobar
  - actividades que deban quedar en `needs_correction`

## Flujo De Validacion

### 1. Backoffice Editorial
- entrar a `backoffice/editorial`
- usar filtros y busqueda reales sobre el seed
- revisar si el operador entiende rapido:
  - que esta listo para aprobar
  - que esta bloqueado
  - que conviene corregir despues
- registrar toda friccion que haga perder tiempo

### 2. Moderacion
- entrar a `backoffice/moderation`
- verificar si comentarios, propuestas y reportes son faciles de encontrar
- verificar si el contexto del item moderable es suficiente para decidir

### 3. Catalogo Publico
- abrir `Explorar`
- abrir `Mayor disrupcion`
- revisar detalle de actividades aprobadas
- validar si con volumen real:
  - el catalogo se entiende
  - los filtros sirven
  - las cards se leen bien
  - la home dirige bien hacia contenido util

## Como Registrar Hallazgos
Usar [validacion_seed_ronda_01.md](validacion_seed_ronda_01.md).

Cada hallazgo deberia caer en una de estas categorias:
- `frontend-web`: layout, jerarquia visual, copy, navegacion, claridad operativa
- `backend-web`: falta de filtros, datos, contexto, performance de consulta, acciones ausentes
- `testing`: agregar regresion para algo ya corregido
- `orchestrator`: redefinir prioridad o secuencia

## Regla De Corte
No abrir una ola funcional nueva mientras haya fricciones repetidas en:
- aprobacion editorial
- descubrimiento del catalogo publico
- comprension del estado de una actividad

## Salida Esperada De Cada Ronda
- lista de hallazgos priorizados
- subagente recomendado por hallazgo
- decision de seguir validando o abrir un delta concreto de implementacion
