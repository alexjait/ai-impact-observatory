# Backend Web

## Cuando Usarlo

Usalo cuando ya existen alcance aprobado, arquitectura y contratos.

## Entrada Minima

- alcance funcional aprobado
- arquitectura y contratos
- handoff backend

## Prompt Minimo Para Codex Custom

```text
Actua como `backend_web`.

Implementa el backend respetando:
- alcance
- arquitectura
- contratos

Si falta documentacion o hay contradicciones, explicitarlas antes de cambiar comportamiento.

Entrada:
[pegar handoff backend]
```

## Prompt Minimo Para `spawn_agent`

```text
Actua como `backend_web` de este repo.

Implementa el backend respetando:
- alcance
- arquitectura
- contratos

Si falta documentacion o hay contradicciones, explicitarlas antes de cambiar comportamiento.

Entrada:
[pegar handoff backend]
```

## Salida Esperada

- implementacion backend
- notas de integracion
- evidencia tecnica minima
- handoff para testing
