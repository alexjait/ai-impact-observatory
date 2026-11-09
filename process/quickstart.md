# Quickstart

## Objetivo

Usar este repo para correr un equipo de agentes de desarrollo de software con el menor contexto posible.

## Que Leer Primero

1. `README.md`
2. `AGENTS.md`
3. `templates/brief-requerimiento-inicial.md`

Si despues necesitas mas detalle:

- `process/guia-de-uso-paso-a-paso.md`
- `process/codex-subagent-runbook.md`
- `process/spawn-agent-playbook.md`

## Elegi Un Modo

### Modo A: Subagentes Custom De Codex

Usalo si vas a trabajar con los roles definidos en `.codex/agents/*.toml`.

### Modo B: Workflow Con `spawn_agent`

Usalo si tu entorno delega con `spawn_agent`, `send_input` y `wait_agent`.

## Paso 1: Completa El Brief

Abri `templates/brief-requerimiento-inicial.md` y completa al menos:

- problema u oportunidad
- objetivo de negocio
- usuarios o actores
- plataformas esperadas
- restricciones conocidas
- criterios de exito

Si todavia solo tenes una idea muy cruda, primero usa `business_analyst` para que investigue y complete mejor ese brief.

Si ya sabes que aplican temas como borrado logico, alta rapida desde selectores, exportacion asincronica, upload grande o sincronizacion entre solapas, registralos tambien en `templates/consideraciones-transversales.md`.

## Paso 2: Inicia La Coordinacion

### Si Usas Codex Custom

1. Lanza `orchestrator`.
2. Pidele que te diga:
   - etapa actual
   - siguiente especialista
   - entradas necesarias
   - riesgos o bloqueos

### Si Usas `spawn_agent`

1. Crea un agente `default`.
2. Indicale que actue como `orchestrator`.
3. Pidele el mismo output:
   - etapa actual
   - siguiente especialista
   - entradas necesarias
   - riesgos o bloqueos

## Paso 3: Corre El Flujo Base

El orden recomendado es:

1. `business_analyst` si la idea esta verde
2. `functional_analyst`
3. aprobar alcance
4. `software_architect` y `ux_ui_web_mobile`
5. consolidar handoffs
6. `backend_web`, `frontend_web` y/o `frontend_mobile`
7. `testing`
8. correcciones
9. cierre

## Que Actualizar En Cada Etapa

Siempre que cierres una etapa:

1. actualiza `templates/project-state.md`
2. crea o completa `templates/paquete-handoff.md`
3. registra decisiones, riesgos y supuestos

Convencion recomendada:

- `orchestrator` mantiene el estado consolidado
- cada especialista devuelve cambios sugeridos al estado

## Reglas Rapidas

- No lances implementadores sin alcance aprobado.
- No lances frontend o backend sin contratos y UX/UI suficiente.
- No lances dos implementadores sobre los mismos archivos.
- Usa `testing` como validador primero; usalo como `worker` solo si tambien va a editar tests o fixtures.

## Archivos Que Vas A Usar Mas

- `templates/brief-requerimiento-inicial.md`
- `templates/project-state.md`
- `templates/paquete-handoff.md`
- `process/codex-subagent-runbook.md`
- `process/spawn-agent-playbook.md`

## Si Elegiste Codex Custom

Segui esta referencia:

- `process/codex-subagent-runbook.md`

Resumen corto:

1. `orchestrator` recomienda
2. la sesion principal lanza al especialista
3. se aprueba alcance
4. se implementa
5. se testea

## Si Elegiste `spawn_agent`

Segui esta referencia:

- `process/spawn-agent-playbook.md`

Resumen corto:

1. `default` para coordinacion y analisis
2. `explorer` para investigacion puntual
3. `worker` para implementacion
4. `send_input` para correcciones
5. `wait_agent` solo cuando el siguiente paso dependa del resultado

## Errores Mas Comunes

- empezar a implementar demasiado pronto
- no registrar decisiones
- mezclar ownership
- usar todos los agentes aunque el proyecto sea chico

## Camino Mas Recomendado Para La Primera Prueba

Si queres validar el sistema sin complicarte:

1. completa `templates/brief-requerimiento-inicial.md`
2. usa un caso mediano
3. corre:
   - `orchestrator`
   - `business_analyst` si la idea esta verde
   - `functional_analyst`
   - `software_architect`
   - un implementador
   - `testing`

## Cuando Leer La Guia Larga

Anda a `process/guia-de-uso-paso-a-paso.md` si necesitas:

- entender todos los gates
- ver las diferencias completas entre ambos modos
- decidir como usar handoffs y project state con mas rigor
