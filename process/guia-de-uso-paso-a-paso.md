# Guia De Uso Paso A Paso

## Objetivo

Este documento explica, paso a paso, como usar este repositorio para operar un equipo de agentes de desarrollo de software de dos maneras:

1. Con subagentes custom de Codex.
2. Como workflow basado en `spawn_agent`.

La idea es que alguien pueda abrir este repo y entender:

- que archivo cumple cada funcion
- en que orden usar las piezas
- que decisiones tomar en cada etapa
- cuando conviene usar un modo u otro

## Que Hay En Este Repo

### Archivos De Configuracion

- `AGENTS.md`: reglas persistentes del repo.
- `.codex/config.toml`: limites globales para agentes.
- `.codex/agents/*.toml`: definicion de los roles especialistas.

### Archivos De Proceso

- `process/software-delivery-workflow.md`: flujo general y gates.
- `process/codex-subagent-runbook.md`: guia rapida para usar subagentes custom de Codex.
- `process/spawn-agent-playbook.md`: guia rapida para emular la orquestacion con `spawn_agent`.

### Plantillas

- `templates/brief-requerimiento-inicial.md`: punto de partida para un proyecto.
- `templates/consideraciones-transversales.md`: registro de preocupaciones transversales que pueden aplicar.
- `templates/paquete-handoff.md`: formato de handoff entre especialistas.
- `templates/paquete-ejecucion-item.md`: formato de historia o slice listo para implementar.
- `templates/project-state.md`: estado consolidado del proyecto.

## Antes De Empezar

Antes de lanzar ningun agente, hace esto:

1. Lee `README.md` para entender la intencion general del sistema.
2. Lee `AGENTS.md` para ver las reglas persistentes del repo.
3. Revisa `.codex/agents/` para conocer los especialistas disponibles.
4. Completa `templates/brief-requerimiento-inicial.md` con el problema real.
5. Si ya conoces temas transversales importantes, registralos en `templates/consideraciones-transversales.md`.
6. Decide si vas a trabajar con:
   - subagentes custom de Codex
   - workflow con `spawn_agent`

## Como Elegir El Modo

### Usa Subagentes Custom De Codex Si

- queres trabajar en el runtime de Codex con roles ya definidos en `.codex/agents/*.toml`
- queres que el repo sea la fuente de verdad de los especialistas
- preferis una experiencia mas cercana al modelo oficial de Codex

### Usa `spawn_agent` Si

- estas en un entorno donde la delegacion se hace con el tool `spawn_agent`
- queres emular los roles custom usando agentes genericos
- necesitas controlar manualmente mas detalle de cada delegacion

## Flujo Comun A Ambos Modos

Sin importar el modo, el proceso de trabajo recomendado es siempre parecido:

1. Idea o brief inicial.
2. Discovery de negocio si hace falta.
3. Analisis funcional.
4. Aprobacion de alcance.
5. Arquitectura y UX/UI.
6. Aprobacion de solucion.
7. Implementacion.
8. Testing.
9. Correcciones.
10. Cierre.

La diferencia entre ambos modos esta en como lanzas y coordinas a los agentes.

## Modo A: Usar Subagentes Custom De Codex

### Paso 1: Preparar El Brief

Completa `templates/brief-requerimiento-inicial.md` con:

- problema u oportunidad
- objetivo de negocio
- actores
- plataformas
- restricciones conocidas
- integraciones conocidas
- criterios de exito

No hace falta que este perfecto. El analista funcional va a completar huecos y explicitar supuestos.

Si lo unico que tenes es una idea breve y todavia no podes completar bien ese brief, conviene usar primero `business_analyst`.

### Paso 1.5: Ejecutar Discovery De Negocio Si La Idea Esta Verde

Usa `business_analyst` cuando:

- la idea todavia es vaga
- no estan claros los usuarios
- no esta clara la propuesta de valor
- no sabes bien que plataformas o restricciones aplicar

El objetivo de este agente no es hacer alcance funcional completo, sino dejar un brief inicial mejor definido para el analista funcional.

### Paso 2: Iniciar El Orquestador

El primer rol a usar es `orchestrator`.

Su responsabilidad en este repo no es implementar ni lanzar el resto por su cuenta, sino:

- recomendar el siguiente especialista
- validar si las entradas son suficientes
- exponer bloqueos y riesgos

En este modelo, la sesion principal sigue siendo la que ejecuta cada paso.

### Paso 3: Pedir Recomendacion De Siguiente Paso

Pasale al orquestador:

- el brief inicial
- el objetivo del proyecto
- cualquier restriccion extra que tengas

Espera de vuelta una salida con:

1. etapa actual
2. proximo agente recomendado
3. entradas necesarias
4. riesgos o bloqueos
5. decision humana requerida, si existe

### Paso 4: Ejecutar Al Analista Funcional

Una vez que el orquestador lo recomiende, ejecuta `functional_analyst`.

El objetivo del analista es producir:

- alcance funcional
- alcance no funcional
- backlog por especialidad
- historias o paquetes de ejecucion chicos y testeables
- criterios de aceptacion

Si antes corriste `business_analyst`, el analista funcional toma ese brief enriquecido como entrada.

Cuando termine, no saltes directo a implementacion. Primero revisa si el alcance:

- esta completo
- tiene exclusiones explicitas
- tiene criterios de aceptacion testeables

### Paso 5: Aprobar Alcance

Este es el primer gate importante.

No avances si todavia hay ambiguedades serias en:

- negocio
- usuarios
- flujos
- restricciones
- integraciones

Si hace falta, devuelve comentarios y hace iterar al analista.

### Paso 6: Ejecutar Arquitectura Y UX/UI

Con el alcance aprobado, lanza en paralelo:

- `software_architect`
- `ux_ui_web_mobile`

Esto funciona bien porque:

- arquitectura define contratos, componentes, decisiones tecnicas y restricciones
- UX/UI define flujos, pantallas, estados y diferencias entre web y mobile

Ambos dependen del alcance, pero no necesariamente uno del otro para arrancar.

### Paso 7: Consolidar Solucion

Cuando arquitectura y UX/UI terminan:

1. revisa consistencia entre los dos entregables
2. detecta contradicciones
3. crea handoffs usando `templates/paquete-handoff.md`
4. arma paquetes chicos de implementacion usando `templates/paquete-ejecucion-item.md`
5. actualiza `templates/project-state.md`

Convencion de trabajo:

- `orchestrator` es el owner del estado consolidado
- los demas agentes devuelven actualizaciones sugeridas al estado

Este es el segundo gate importante. Antes de implementar, deberian existir:

- contratos
- lineamientos de integracion
- especificacion UX/UI suficiente
- paquete de ejecucion acotado para el siguiente slice
- riesgos principales identificados

### Paso 8: Lanzar Implementadores

Segun el proyecto, lanza:

- `backend_web`
- `frontend_web`
- `frontend_mobile`

No siempre hacen falta los tres.

Ejemplos:

- si el proyecto es solo API, no lances frontend
- si el proyecto es solo web, no lances mobile
- si el proyecto es solo mobile y usa backend existente, quizas backend no haga falta

### Paso 9: Mantener Handoffs Claros

Cada implementador deberia recibir:

- objetivo del paquete
- alcance incluido
- fuera de alcance
- entradas utilizadas
- referencias funcionales
- referencias de arquitectura y contratos
- referencias UX/UI, cuando aplique
- decisiones tomadas
- supuestos
- riesgos
- criterios de aceptacion
- entregables esperados

Si un implementador detecta una contradiccion fuerte, no deberia inventar. Deberia devolver el problema para aclaracion.
El documento maestro de analisis sigue siendo contexto global, pero no deberia ser la unica orden de trabajo para implementacion.

### Paso 10: Ejecutar Testing

Cuando ya hay entregables implementados, lanza `testing`.

Su trabajo es:

- derivar estrategia de validacion
- comprobar alcance y criterios de aceptacion
- validar errores, bordes e integraciones
- reportar defectos accionables
- informar riesgo remanente

### Paso 11: Rebotar Hallazgos

Los defectos de QA vuelven al especialista correspondiente:

- al backend si el problema es de contratos, validaciones o servicios
- al frontend web si el problema es de la experiencia web
- al frontend mobile si el problema es de la experiencia mobile
- al arquitecto si el problema es de una decision tecnica base
- al analista funcional si el problema revela una ambiguedad de alcance

### Paso 12: Cerrar O Iterar

Vuelve a consultar al orquestador con:

- estado actual
- artefactos ya generados
- defectos abiertos
- riesgos remanentes

Con eso decide si:

- el proyecto esta listo para cerrar
- hay que iterar
- falta una decision humana

## Modo B: Usar Workflow Basado En `spawn_agent`

Este modo sirve cuando el entorno no invoca directamente a los subagentes custom, pero si te deja delegar trabajo con `spawn_agent`.

### Principio Base

En este modo:

- el agente principal conduce el flujo
- `spawn_agent` crea agentes genericos
- vos les pasas instrucciones para que actuen como los roles del repo

### Paso 1: Preparar El Brief

Igual que en el modo anterior, empieza por `templates/brief-requerimiento-inicial.md`.

### Paso 2: Lanzar Al Orquestador

Usa un `spawn_agent` con `agent_type="default"` y una instruccion que diga que debe actuar como `orchestrator`.

Ese agente no escribe codigo. Solo:

- ordena el proceso
- recomienda siguiente especialista
- valida si falta contexto

### Paso 3: Lanzar Al Analista Funcional

Si el orquestador indica que la idea todavia esta verde, primero crea un `spawn_agent` con `agent_type="default"` para que actue como `business_analyst`.

Usalo para:

- enriquecer el brief inicial
- explicitar supuestos
- identificar usuarios, objetivo, restricciones y dudas abiertas

Despues de eso, lanza al `functional_analyst`.

Si el orquestador indica que ya hay suficiente claridad, crea directamente otro `spawn_agent` con `agent_type="default"` para que actue como `functional_analyst`.

Cuando recibas la respuesta:

1. revisa alcance
2. aprueba o corrige
3. actualiza `templates/project-state.md`

### Paso 4: Lanzar En Paralelo Arquitectura Y UX/UI

Una vez aprobado el alcance:

- crea un agente para `software_architect`
- crea otro para `ux_ui_web_mobile`
- espera resultados con `wait_agent`

La version operativa ya esta documentada en `process/spawn-agent-playbook.md`.

### Paso 5: Usar `explorer` Si Hace Falta

No siempre hace falta.

Usalo cuando queres:

- ubicar rapido que archivos toca un flujo
- inspeccionar contratos o entry points
- conseguir evidencia antes de abrir un `worker`

No lo uses para implementar.

### Paso 6: Lanzar `worker` Para Implementacion

Para los roles que modifican codigo:

- `backend_web`
- `frontend_web`
- `frontend_mobile`

usa `agent_type="worker"`.

Cada worker deberia tener ownership claro.

Ejemplo:

- backend: servicios, rutas, persistencia, contratos
- frontend web: pantallas web, integracion web, estados web
- frontend mobile: pantallas mobile, integracion mobile, comportamiento de dispositivo

### Paso 7: Evitar Solapamientos

No lances dos workers si van a tocar exactamente los mismos archivos.

Si necesitas paralelismo, dividilo por ownership.

### Paso 8: Usar `send_input` Para Ajustes

Usa `send_input` cuando:

- cambian prioridades
- se aprueba una decision nueva
- testing encuentra un defecto
- hay que aclarar un contrato

No hace falta relanzar un agente desde cero para cada ajuste.

### Paso 9: Usar `testing` Como `default` O `worker`

Usa `testing` como `default` cuando QA:

- define estrategia
- ejecuta validaciones
- reporta defectos

Usa `testing` como `worker` cuando ademas:

- crea o modifica tests
- toca fixtures
- ajusta utilidades de validacion

### Paso 10: Esperar Solo Lo Necesario

`wait_agent` conviene usarlo cuando el siguiente paso depende de ese resultado.

Ejemplos:

- espera arquitectura y UX/UI antes de implementar
- no te bloquees esperando una exploracion que no afecta el proximo paso

### Paso 11: Cerrar El Ciclo

Cuando testing termina:

1. consolida defectos
2. reasignalos por ownership
3. envia feedback con `send_input`
4. vuelve a consultar al orquestador

En ese punto, el `orchestrator` tambien deberia proponer la actualizacion final de `templates/project-state.md`.
Tambien deberia indicar si queda otro paquete chico listo para implementarse o si hace falta volver a analisis, arquitectura o UX/UI.

## Que Documento Uso En Cada Momento

### Al Empezar

- `README.md`
- `AGENTS.md`
- `templates/brief-requerimiento-inicial.md`

### Durante La Coordinacion

- `templates/project-state.md`
- `process/software-delivery-workflow.md`
- `process/codex-subagent-runbook.md` o `process/spawn-agent-playbook.md`

### En Cada Handoff

- `templates/paquete-handoff.md`
- `templates/paquete-ejecucion-item.md` cuando el destinatario va a implementar

## Errores Comunes A Evitar

### 1. Lanzar Implementadores Demasiado Pronto

Si no hay alcance aprobado, contratos, UX/UI suficiente y un paquete de ejecucion acotado, despues vas a pagar retrabajo.

### 2. No Registrar Decisiones

Si una decision queda solo en el chat y no en `project-state` o en el handoff, el siguiente agente la puede perder.

### 3. Mezclar Ownership

Si backend y frontend tocan la misma parte sin limites claros, el sistema se vuelve fragil.

### 4. Usar Todos Los Agentes Siempre

No hace falta.

Para un proyecto chico, puede alcanzar con:

- analista funcional
- arquitecto
- un implementador
- testing

### 5. Saltarse Los Gates

Los gates existen para evitar que un mal insumo contamine todas las etapas siguientes.

## Recomendacion De Primera Prueba

Para la primera corrida, no uses un proyecto enorme.

Conviene probar con un caso mediano, por ejemplo:

- una aplicacion web con login, dashboard y CRUD simple
- una app mobile con onboarding y consumo de API existente
- una API con autenticacion, roles y panel web basico

Eso te deja validar:

- analisis funcional
- arquitectura
- UX/UI
- implementacion
- testing

sin que el experimento se vuelva inmanejable.

## Resumen Final

Si queres operar esto con la logica oficial de Codex, usa:

- `.codex/agents/*.toml`
- `AGENTS.md`
- `process/codex-subagent-runbook.md`

Si queres operarlo con delegacion manual usando herramientas de agente, usa:

- `process/spawn-agent-playbook.md`
- `templates/project-state.md`
- `templates/paquete-handoff.md`

En ambos casos, el orden sano es:

1. brief
2. analisis
3. aprobacion
4. arquitectura y UX/UI
5. paquete de ejecucion
6. implementacion
7. testing
8. iteracion o cierre
