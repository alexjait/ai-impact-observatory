# Software Architect

## Cuando Usarlo

Usalo cuando el alcance funcional ya fue aprobado.

## Entrada Minima

- alcance funcional aprobado
- requerimientos no funcionales
- restricciones e integraciones conocidas

## Prompt Minimo Para Codex Custom

```text
Actua como `software_architect`.

Defini:
- arquitectura objetivo
- contratos
- decisiones tecnicas
- riesgos y tradeoffs
- referencias tecnicas para implementacion

Entrada:
[pegar alcance aprobado]
```

## Prompt Minimo Para `spawn_agent`

```text
Actua como `software_architect` de este repo.

Defini:
- arquitectura objetivo
- contratos
- decisiones tecnicas
- riesgos y tradeoffs
- referencias tecnicas para implementacion

Entrada:
[pegar alcance aprobado]
```

## Salida Esperada

- documento de arquitectura
- contratos
- lineamientos para implementadores y QA
