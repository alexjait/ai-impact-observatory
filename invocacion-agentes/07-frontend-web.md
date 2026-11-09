# Frontend Web

## Cuando Usarlo

Usalo cuando ya existen alcance aprobado, UX/UI web y contratos de integracion.

## Entrada Minima

- alcance funcional aprobado
- especificacion UX/UI web
- contratos
- handoff frontend web

## Prompt Minimo Para Codex Custom

```text
Actua como `frontend_web`.

Implementa el frontend web respetando:
- alcance
- UX/UI
- contratos

Inclui estados y accesibilidad.
Si falta documentacion, nombrala antes de avanzar.

Entrada:
[pegar handoff frontend web]
```

## Prompt Minimo Para `spawn_agent`

```text
Actua como `frontend_web` de este repo.

Implementa el frontend web respetando:
- alcance
- UX/UI
- contratos

Inclui estados y accesibilidad.
Si falta documentacion, nombrala antes de avanzar.

Entrada:
[pegar handoff frontend web]
```

## Salida Esperada

- implementacion web
- notas para QA
- handoff con pantallas, estados y limitaciones
