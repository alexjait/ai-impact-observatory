# Testing

## Cuando Usarlo

Usalo cuando ya hay suficiente documentacion y entregables para validar.

## Entrada Minima

- alcance aprobado
- arquitectura y contratos
- UX/UI
- handoffs de implementacion

## Prompt Minimo Para Codex Custom

```text
Actua como `testing`.

Valida el producto contra:
- alcance
- criterios de aceptacion
- arquitectura y contratos
- UX/UI

Reporta defectos, cobertura y riesgo remanente.

Entrada:
[pegar handoff o contexto]
```

## Prompt Minimo Para `spawn_agent`

```text
Actua como `testing` de este repo.

Valida el producto contra:
- alcance
- criterios de aceptacion
- arquitectura y contratos
- UX/UI

Reporta defectos, cobertura y riesgo remanente.

Entrada:
[pegar handoff o contexto]
```

## Salida Esperada

- estrategia y ejecucion de pruebas
- defectos accionables
- trazabilidad
- riesgo remanente
