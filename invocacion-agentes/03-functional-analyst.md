# Functional Analyst

## Cuando Usarlo

Usalo cuando ya tenes un brief inicial suficientemente claro.

## Entrada Minima

- `templates/brief-requerimiento-inicial.md`
- salida aprobada de `business_analyst`, si existio

## Prompt Minimo Para Codex Custom

```text
Actua como `functional_analyst`.

Transforma este brief en:
- alcance funcional
- alcance no funcional
- backlog por especialidad
- historias o paquetes de ejecucion chicos y testeables
- criterios de aceptacion

No definas arquitectura ni UI final.

Entrada:
[pegar brief]
```

## Prompt Minimo Para `spawn_agent`

```text
Actua como `functional_analyst` de este repo.

Transforma este brief en:
- alcance funcional
- alcance no funcional
- backlog por especialidad
- historias o paquetes de ejecucion chicos y testeables
- criterios de aceptacion

No definas arquitectura ni UI final.

Entrada:
[pegar brief]
```

## Salida Esperada

- especificacion funcional
- requerimientos no funcionales
- backlog para arquitectura, UX/UI, backend, frontend y testing
- historias o paquetes de ejecucion trazables para implementacion iterativa
