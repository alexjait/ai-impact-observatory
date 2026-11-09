# Frontend Mobile

## Cuando Usarlo

Usalo cuando ya existen alcance aprobado, UX/UI mobile y contratos de integracion.

## Entrada Minima

- alcance funcional aprobado
- especificacion UX/UI mobile
- contratos
- handoff frontend mobile

## Prompt Minimo Para Codex Custom

```text
Actua como `frontend_mobile`.

Implementa el frontend mobile respetando:
- alcance
- UX/UI
- contratos

Contempla navegacion, permisos, conectividad y comportamiento de dispositivo.
Si falta documentacion, nombrala antes de avanzar.

Entrada:
[pegar handoff frontend mobile]
```

## Prompt Minimo Para `spawn_agent`

```text
Actua como `frontend_mobile` de este repo.

Implementa el frontend mobile respetando:
- alcance
- UX/UI
- contratos

Contempla navegacion, permisos, conectividad y comportamiento de dispositivo.
Si falta documentacion, nombrala antes de avanzar.

Entrada:
[pegar handoff frontend mobile]
```

## Salida Esperada

- implementacion mobile
- notas para QA
- handoff con flujos, comportamiento de dispositivo y limitaciones
