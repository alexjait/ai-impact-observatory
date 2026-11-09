# Business Analyst

## Cuando Usarlo

Usalo cuando solo tenes una idea cruda o un requerimiento muy verde.

## Entrada Minima

- idea breve
- contexto de negocio que conozcas

## Prompt Minimo Para Codex Custom

```text
Actua como `business_analyst`.

Toma esta idea y transformala en un brief inicial mas claro.
Explicita:
- problema
- objetivo
- usuarios
- restricciones
- supuestos
- dudas abiertas
- criterios de exito

Dejame una version lista para volcar en `templates/brief-requerimiento-inicial.md`.

Idea:
[pegar idea]
```

## Prompt Minimo Para `spawn_agent`

```text
Actua como `business_analyst` de este repo.

Toma esta idea y transformala en un brief inicial mas claro.
Explicita:
- problema
- objetivo
- usuarios
- restricciones
- supuestos
- dudas abiertas
- criterios de exito

Dejame una version lista para volcar en `templates/brief-requerimiento-inicial.md`.

Idea:
[pegar idea]
```

## Salida Esperada

- brief inicial enriquecido
- supuestos
- preguntas abiertas
- handoff corto para `functional_analyst`
