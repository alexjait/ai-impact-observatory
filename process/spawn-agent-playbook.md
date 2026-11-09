# Playbook De Orquestacion Con `spawn_agent`

## Objetivo

Mostrar como ejecutar este equipo de especialistas cuando la coordinacion se hace mediante `spawn_agent`, `send_input` y `wait_agent`.

Este documento aplica al tool `spawn_agent` de este entorno, donde la delegacion usa tipos genericos de agente y no invoca directamente a los subagentes custom por nombre.

## Distincion Importante

Hay dos conceptos relacionados pero no identicos:

- Los subagentes custom definidos en `.codex/agents/*.toml`, que son la forma oficial de modelar especialistas en Codex.
- El tool `spawn_agent` de este entorno, que permite delegar trabajo a agentes genericos como `default`, `explorer` y `worker`.

Por eso, este playbook propone un mapeo operativo:

- en Codex con soporte directo de subagentes custom, usa los agentes definidos en `.codex/agents/`
- en entornos donde solo exista `spawn_agent`, usa `default`, `explorer` y `worker`, pero pasando instrucciones que emulen el rol especialista

## Mapeo Recomendado

| Rol de negocio | Estrategia | agent_type | Modelo sugerido | Escritura |
|---|---|---|---|---|
| `orchestrator` | coordinacion | `default` | `gpt-5.4` | no |
| `business_analyst` | discovery | `default` | `gpt-5.4` | no |
| `functional_analyst` | analisis | `default` | `gpt-5.4` | no |
| `software_architect` | analisis tecnico | `default` | `gpt-5.4` | no |
| `ux_ui_web_mobile` | definicion UX/UI | `default` | `gpt-5.4` | no |
| `backend_web` | implementacion | `worker` | `gpt-5.4` | si |
| `frontend_web` | implementacion | `worker` | `gpt-5.4` | si |
| `frontend_mobile` | implementacion | `worker` | `gpt-5.4` | si |
| `testing` | validacion | `default` o `worker` | `gpt-5.4` | depende |

Regla para `testing`:

- usa `default` cuando QA solo analiza, disena estrategia, ejecuta validaciones y reporta defectos
- usa `worker` cuando QA tambien debe editar tests, fixtures o utilidades de validacion

## Regla De Orquestacion

No lances implementadores hasta que existan:

- alcance aprobado
- criterios de aceptacion
- arquitectura y contratos
- definicion UX/UI suficiente para las plataformas involucradas

Convencion de estado:

- el rol `orchestrator` consolida el estado del proyecto
- cada especialista debe devolver cambios sugeridos para `templates/project-state.md`
- la sesion principal aplica esos cambios o se los reenvia al orquestador

## Patron Recomendado

### Etapa 1: Kickoff

1. El agente principal recibe el requerimiento inicial.
2. El agente principal crea o completa `templates/brief-requerimiento-inicial.md`.
3. El agente principal lanza al orquestador.

Ejemplo:

```text
spawn_agent(
  agent_type="default",
  model="gpt-5.4",
  reasoning_effort="high",
  fork_context=true,
  message="""
Actua como el rol `orchestrator` definido en este repo.
Coordina el proyecto usando los agentes especialistas disponibles.
No implementes codigo. Decide la siguiente etapa, valida handoffs y expone bloqueos.

Brief inicial:
[pegar brief]
"""
)
```

### Etapa 2: Analisis Funcional

Cuando el orquestador indique que la idea todavia esta muy verde, lanzar primero al analista de negocio.

```text
spawn_agent(
  agent_type="default",
  model="gpt-5.4",
  reasoning_effort="high",
  fork_context=true,
  message="""
Actua como el rol `business_analyst` definido en este repo.
Toma esta idea cruda y transformala en un brief inicial mas claro para el analista funcional.
Explicita problema, usuarios, valor esperado, restricciones, supuestos y preguntas abiertas.
No hagas todavia alcance funcional completo.

Entrada:
[pegar idea o brief crudo]
"""
)
```

Despues, cuando ya haya claridad suficiente, lanzar al analista funcional.

```text
spawn_agent(
  agent_type="default",
  model="gpt-5.4",
  reasoning_effort="high",
  fork_context=true,
  message="""
Actua como el rol `functional_analyst` definido en `.codex/agents/functional-analyst.toml`.
Produce alcance funcional y no funcional completo, backlog por especialidad y criterios de aceptacion.
Ademas, divide el trabajo en historias o paquetes chicos, testeables y trazables a la especificacion global.
No elijas stack salvo necesidad explicita.

Entrada:
[pegar brief]
"""
)
```

### Etapa 3: Arquitectura Y UX/UI En Paralelo

Una vez aprobado el alcance, conviene lanzar arquitectura y UX/UI al mismo tiempo.

```text
architect_id = spawn_agent(
  agent_type="default",
  model="gpt-5.4",
  reasoning_effort="high",
  fork_context=true,
  message="""
Actua como `software_architect`.
Define arquitectura, contratos, lineamientos de integracion, riesgos y tradeoffs.

Entrada:
[pegar alcance aprobado]
"""
)
```

```text
ux_id = spawn_agent(
  agent_type="default",
  model="gpt-5.4",
  reasoning_effort="high",
  fork_context=true,
  message="""
Actua como `ux_ui_web_mobile`.
Define flujos, pantallas, estados y diferencias entre web y mobile.

Entrada:
[pegar alcance aprobado]
"""
)
```

Esperar resultados:

```text
wait_agent(ids=[architect_id, ux_id], timeout_ms=600000)
```

### Etapa 3.5: Exploracion Acotada

`explorer` conviene usarlo cuando necesitas evidencia puntual sin abrir una implementacion todavia.

Casos utiles:

- mapear rapidamente los archivos que tocaria backend o frontend
- verificar por donde entra un flujo antes de lanzar un `worker`
- revisar documentacion o contratos existentes sin tocar codigo

Ejemplo:

```text
explorer_id = spawn_agent(
  agent_type="explorer",
  model="gpt-5.4-mini",
  reasoning_effort="medium",
  fork_context=true,
  message="""
Explora el codebase y ubica los archivos responsables del flujo de autenticacion.
No hagas cambios. Cita entry points, integraciones y archivos candidatos para backend y frontend.
"""
)
```

### Etapa 4: Implementacion

Cuando ya existan contratos y definiciones de UX/UI, pedir primero al orquestador el siguiente paquete de ejecucion acotado y luego lanzar implementadores.

Backend:

```text
backend_id = spawn_agent(
  agent_type="worker",
  model="gpt-5.4",
  reasoning_effort="medium",
  fork_context=true,
  message="""
Actua como `backend_web`.
Sos dueno de la implementacion backend.
Respeta alcance, arquitectura y contratos.
Implementa solo el paquete acotado recibido en este turno.
No estas solo en el codebase: no reviertas cambios ajenos y adapta tu trabajo si aparecen ediciones de otros agentes.

Entradas:
[pegar handoff backend]
"""
)
```

Frontend web:

```text
frontend_web_id = spawn_agent(
  agent_type="worker",
  model="gpt-5.4",
  reasoning_effort="medium",
  fork_context=true,
  message="""
Actua como `frontend_web`.
Sos dueno de la implementacion web.
Respeta UX/UI, contratos y restricciones del proyecto.
Implementa solo el paquete acotado recibido en este turno.
No estas solo en el codebase: no reviertas cambios ajenos y adapta tu trabajo si aparecen ediciones de otros agentes.

Entradas:
[pegar handoff frontend web]
"""
)
```

Frontend mobile:

```text
frontend_mobile_id = spawn_agent(
  agent_type="worker",
  model="gpt-5.4",
  reasoning_effort="medium",
  fork_context=true,
  message="""
Actua como `frontend_mobile`.
Sos dueno de la implementacion mobile.
Respeta UX/UI, contratos y particularidades de dispositivos.
Implementa solo el paquete acotado recibido en este turno.
No estas solo en el codebase: no reviertas cambios ajenos y adapta tu trabajo si aparecen ediciones de otros agentes.

Entradas:
[pegar handoff frontend mobile]
"""
)
```

## Reglas De Paralelismo

Se puede paralelizar:

- `software_architect` con `ux_ui_web_mobile`
- `frontend_web` con `frontend_mobile`
- `testing` preparando casos mientras backend/frontend implementan

No conviene paralelizar:

- analisis funcional con implementacion
- arquitectura con implementacion cuando los contratos todavia no estan cerrados
- varios workers editando los mismos archivos

## Patron De Handoff

Antes de lanzar un agente, el mensaje debe incluir:

1. Rol que debe emular.
2. Objetivo puntual.
3. Material de entrada.
4. Restricciones.
5. Referencias exactas a funcional, arquitectura, contratos y UX/UI cuando apliquen.
6. Entregable esperado.
7. Limites de ownership.

## Uso De `send_input`

Usa `send_input` cuando:

- tenes aprobaciones o correcciones del usuario
- el agente ya esta trabajando y queres ajustar prioridad
- queres pasarle un hallazgo de testing o un cambio en los contratos

Ejemplo:

```text
send_input(
  id=backend_id,
  interrupt=false,
  message="""
Se aprobo el cambio en autenticacion.
Actualiza el backend para usar refresh tokens y mantene compatibilidad con los endpoints ya implementados.
No cambies contratos sin dejarlo explicitado.
"""
)
```

## Uso De `wait_agent`

Usa `wait_agent` solo cuando el siguiente paso depende del resultado.

Buena practica:

- esperar arquitectura y UX/UI antes de lanzar implementacion
- esperar backend solo si frontend depende de contratos aun no cerrados
- no bloquearse esperando side tasks que no afectan el proximo paso

## Ciclo De Testing

Testing puede usarse de dos maneras:

- como agente de diseno de estrategia y casos antes del desarrollo final
- como agente de validacion y reporte de defectos despues de implementar
- como `worker` si ademas tiene que ajustar tests automatizados o fixtures

Ejemplo de validacion:

```text
testing_id = spawn_agent(
  agent_type="default",
  model="gpt-5.4",
  reasoning_effort="high",
  fork_context=true,
  message="""
Actua como `testing`.
Valida el producto contra alcance, arquitectura, UX/UI y criterios de aceptacion.
Reporta defectos accionables y riesgo remanente.

Entradas:
[pegar alcance]
[pegar handoffs]
[pegar links a implementacion o cambios]
"""
)
```

## Workflow Minimo Recomendado

1. Principal completa brief.
2. Principal lanza `orchestrator`.
3. Si la idea esta verde, `orchestrator` recomienda `business_analyst`.
4. Principal lanza `business_analyst` si hace falta.
5. `orchestrator` recomienda `functional_analyst`.
6. Principal lanza `functional_analyst`.
7. Humano aprueba alcance.
8. Principal lanza en paralelo `software_architect` y `ux_ui_web_mobile`.
9. Principal consolida y crea handoffs.
10. Principal pide al `orchestrator` el siguiente paquete chico de ejecucion.
11. Principal lanza `backend_web`.
12. Principal lanza `frontend_web` y `frontend_mobile` cuando corresponda.
13. Principal lanza `testing`.
14. Principal reenvia defectos a los duenos correspondientes con `send_input`.
15. `orchestrator` decide si cerrar o iterar.

## Recomendacion Practica

Si el proyecto es chico, no lances todos los agentes.

Escala minima util:

- `business_analyst` si la idea esta verde
- `functional_analyst`
- `software_architect`
- un implementador
- `testing`

Escala completa:

- `orchestrator`
- `business_analyst`
- `functional_analyst`
- `software_architect`
- `ux_ui_web_mobile`
- `backend_web`
- `frontend_web`
- `frontend_mobile`
- `testing`
