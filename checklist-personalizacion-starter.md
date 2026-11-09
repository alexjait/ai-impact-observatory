# Checklist De Personalizacion Del Starter

## Objetivo

Usar esta checklist cada vez que copies este repo a un proyecto nuevo.

## 1. Confirmar El Contexto Del Proyecto

- Definir si el proyecto es web, mobile, backend o mixto.
- Confirmar objetivo de negocio.
- Confirmar usuarios o actores principales.
- Confirmar restricciones conocidas.
- Confirmar integraciones externas conocidas.

## 2. Completar El Brief Inicial

- Completar `templates/brief-requerimiento-inicial.md`.
- Registrar dudas abiertas.
- Registrar criterios de exito.
- Si la idea todavia esta muy verde, planear una primera corrida con `business_analyst`.

## 3. Revisar `AGENTS.md`

- Confirmar si las reglas generales del repo alcanzan.
- Agregar reglas especificas del proyecto si hacen falta.
- Agregar convenciones del equipo si aplican.

## 4. Revisar Los Subagentes

- Confirmar si `.codex/agents/*.toml` se pueden usar sin cambios.
- Ajustar instrucciones si el proyecto tiene restricciones especiales.
- Ajustar algun rol si una plataforma no aplica.

## 5. Revisar El Modo De Trabajo

- Decidir si se va a usar Codex custom con `.codex/agents/*.toml`.
- Decidir si se va a usar workflow con `spawn_agent`.
- Alinear al equipo sobre un solo modo principal.

## 6. Revisar El Alcance Del Equipo

- Confirmar si hacen falta todos los roles.
- Si el proyecto es chico, reducir el equipo a lo esencial.
- Si el proyecto no incluye una plataforma, no lanzar ese especialista.

## 7. Preparar El Estado Del Proyecto

- Inicializar `templates/project-state.md`.
- Dejar asentado el objetivo actual.
- Dejar asentados riesgos y bloqueos iniciales si ya existen.

## 8. Preparar Los Handoffs

- Usar `templates/paquete-handoff.md` como formato unico.
- Acordar que toda decision importante quede registrada.
- Evitar pasar contexto solo por chat sin dejarlo documentado.

## 9. Confirmar El Flujo

- Leer `process/quickstart.md`.
- Si hace falta mas detalle, leer `process/guia-de-uso-paso-a-paso.md`.
- Si se usa Codex custom, seguir `process/codex-subagent-runbook.md`.
- Si se usa `spawn_agent`, seguir `process/spawn-agent-playbook.md`.

## 10. Hacer Una Primera Corrida Pequena

- Empezar con un requerimiento acotado.
- Validar analisis funcional antes de abrir implementacion.
- Validar arquitectura y UX/UI antes de lanzar desarrollo.
- Validar testing y handoffs antes de escalar el uso del sistema.
