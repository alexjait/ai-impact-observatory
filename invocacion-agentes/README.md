# Instructivo De Invocacion De Agentes

## Objetivo

Esta carpeta explica como invocar cada agente del starter con prompts minimos.

Cada instructivo incluye:

- cuando usar ese agente
- que entrada minima necesita
- prompt minimo para Codex custom
- prompt minimo para `spawn_agent`
- que salida deberias esperar

Convencion:

- `orchestrator` mantiene el estado consolidado del proyecto
- los demas agentes devuelven actualizaciones sugeridas a `templates/project-state.md`

## Orden Recomendado

1. `orchestrator`
2. `business_analyst` si la idea esta verde
3. `functional_analyst`
4. `software_architect`
5. `ux_ui_web_mobile`
6. `backend_web`
7. `frontend_web`
8. `frontend_mobile`
9. `testing`

## Regla General

En modo Codex custom:

- invocas al agente por su rol definido en `.codex/agents/*.toml`
- usas el prompt minimo de cada archivo

En modo `spawn_agent`:

- creas un agente generico
- le indicas que actue como ese rol
- usas el prompt minimo de cada archivo

## Archivos

- `01-orchestrator.md`
- `02-business-analyst.md`
- `03-functional-analyst.md`
- `04-software-architect.md`
- `05-ux-ui-web-mobile.md`
- `06-backend-web.md`
- `07-frontend-web.md`
- `08-frontend-mobile.md`
- `09-testing.md`
