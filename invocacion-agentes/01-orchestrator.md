# Orchestrator

## Cuando Usarlo

Usalo al inicio del proyecto y cada vez que quieras decidir el siguiente paso.

## Entrada Minima

- brief inicial o idea
- estado actual del proyecto si ya avanzaste

## Prompt Minimo Para Codex Custom

```text
Actua como `orchestrator`.

Coordina este proyecto.
Decime:
- etapa actual
- siguiente agente recomendado
- entradas necesarias y paquete exacto si ya toca implementar
- riesgos o bloqueos
- decision humana requerida, si existe

Contexto:
[pegar brief o estado actual]
```

## Prompt Minimo Para `spawn_agent`

```text
Actua como `orchestrator` de este repo.

Coordina este proyecto.
Decime:
- etapa actual
- siguiente agente recomendado
- entradas necesarias y paquete exacto si ya toca implementar
- riesgos o bloqueos
- decision humana requerida, si existe

Contexto:
[pegar brief o estado actual]
```

## Salida Esperada

- recomendacion del siguiente especialista
- recomendacion del siguiente paquete de ejecucion cuando aplique
- lista de documentos faltantes o disponibles
- riesgos y bloqueos
- actualizaciones sugeridas para `templates/project-state.md`
