# Runbook De Subagentes En Codex

## Objetivo

Definir una manera practica y repetible de ejecutar el equipo de subagentes en Codex para un proyecto real.

Este documento aplica al runtime de Codex cuando puede trabajar con los subagentes custom definidos en `.codex/agents/*.toml`.

## Fuente De Verdad

- Roles ejecutables: `.codex/agents/*.toml`
- Reglas persistentes del repo: `AGENTS.md`
- Flujo general: `process/software-delivery-workflow.md`
- Artefactos de entrada y handoff: `templates/*.md`

Modelo operativo recomendado en este repo:

- `orchestrator` recomienda el siguiente especialista y valida handoffs
- la sesion principal es la que efectivamente lanza a cada especialista
- `orchestrator` es el owner del estado consolidado en `templates/project-state.md`
- los especialistas devuelven cambios sugeridos para ese estado

## Secuencia Recomendada

1. Crear el brief inicial con `templates/brief-requerimiento-inicial.md`.
2. Lanzar `orchestrator` con el brief y el objetivo del proyecto.
3. Hacer que `orchestrator` recomiende el siguiente especialista y las entradas requeridas.
4. Si la idea todavia esta verde, lanzar `business_analyst` para enriquecer el brief inicial.
5. Lanzar `functional_analyst`.
6. Revisar y aprobar alcance.
7. Lanzar `software_architect` y `ux_ui_web_mobile` en paralelo si el alcance ya esta estable.
8. Revisar consistencia entre funcional, arquitectura y UX/UI.
9. Pedir al `orchestrator` el siguiente paquete de ejecucion acotado.
10. Lanzar `backend_web`.
11. Lanzar `frontend_web` y `frontend_mobile` segun aplique y solo cuando contratos, UX/UI y el paquete de ejecucion esten listos.
12. Lanzar `testing`.
13. Rebotar defectos a los especialistas que correspondan.

## Regla De Oro

No conviene lanzar agentes de implementacion si el orquestador todavia reporta brechas en:

- alcance aprobado
- contratos
- lineamientos UX/UI
- dependencias externas
- criterios de aceptacion

## Prompts De Arranque Recomendados

### Orquestador

Usar un mensaje de este estilo:

```text
Quiero que coordines este proyecto usando el equipo de subagentes del repo.
Tu trabajo es decidir el siguiente especialista, validar handoffs y exponer bloqueos.
Parti de este brief inicial:

[pegar brief]
```

### Analista Funcional

```text
Toma este requerimiento de alto nivel y convertelo en alcance funcional y no funcional completo.
Despues dividilo en backlog accionable para arquitectura, UX/UI, backend, frontend web, frontend mobile y testing.
Ademas, propone historias o paquetes de ejecucion chicos, testeables y trazables a la especificacion global.
Usa criterios de aceptacion testeables.

[pegar brief]
```

### Business Analyst

```text
Toma esta idea breve o requerimiento temprano y transformalo en un brief inicial mas claro.
Explicita problema, objetivo, usuarios, restricciones, supuestos, dudas abiertas y criterios de exito.
No hagas aun alcance funcional completo.

[pegar idea o brief crudo]
```

### Arquitecto

```text
Parti del alcance aprobado y defini arquitectura, contratos, lineamientos de integracion y decisiones tecnicas con tradeoffs.
No fijes stack por defecto si el proyecto no lo exige.

[pegar alcance aprobado]
```

### UX/UI

```text
Parti del alcance aprobado y defini flujos, pantallas, estados y notas diferenciales para web y mobile.
La salida debe ser implementable por frontend sin adivinar comportamiento.

[pegar alcance aprobado]
```

### Backend

```text
Implementa un paquete backend acotado respetando alcance, arquitectura y contratos.
Si detectas inconsistencias, exponelas antes de cambiar el comportamiento acordado.

[pegar handoff]
```

### Frontend Web

```text
Implementa el backlog web respetando UX/UI, contratos de integracion y restricciones del proyecto.
Inclui estados de loading, empty, error y success.

[pegar handoff]
```

### Frontend Mobile

```text
Implementa el backlog mobile respetando UX/UI, contratos y patrones reales de uso en dispositivos.
No copies decisiones de web si perjudican la experiencia mobile.

[pegar handoff]
```

### Testing

```text
Valida el producto contra alcance, arquitectura, UX/UI y criterios de aceptacion.
Cubri happy paths, errores, casos borde e integraciones. Reporta defectos accionables y riesgo remanente.

[pegar handoff]
```

## Paralelismo Seguro

Se puede trabajar en paralelo en estos casos:

- `software_architect` y `ux_ui_web_mobile`
- `frontend_web` y `frontend_mobile`
- `testing` preparando casos mientras desarrollo implementa

No conviene paralelizar:

- `functional_analyst` con implementacion
- arquitectura con cambios de desarrollo ya en curso sobre piezas acopladas
- testing final cuando todavia no hay criterios cerrados

## Entregables Minimos Por Etapa

### Analisis

- alcance funcional
- alcance no funcional
- backlog por especialidad
- historias o paquetes de ejecucion iterables
- criterios de aceptacion

### Solucion

- arquitectura y contratos
- especificacion UX/UI
- riesgos y dependencias

### Implementacion

- codigo
- notas de integracion
- limitaciones conocidas

### Calidad

- estrategia y evidencia de pruebas
- defectos
- riesgo remanente

## Como Decidir Si Lanzar Otro Agente

Antes de lanzar el siguiente agente, el orquestador deberia responder:

1. Que entregable ya existe.
2. Que decision ya esta cerrada.
3. Que riesgo sigue abierto.
4. Que agente es el siguiente y por que.
5. Que paquete exacto y que referencias necesita ese agente.

## Criterio Para Mantener El Repo Ordenado

- Si un archivo existe solo para describir un agente y ese contenido ya esta consolidado en `.codex/agents/*.toml`, no hace falta conservarlo.
- Si un archivo ayuda a operar el sistema de agentes, si conviene conservarlo.
