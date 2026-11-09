# Flujo Operativo Del Equipo

## Resumen

La mejor forma de operar este equipo es por etapas con gates claros, no con todos los agentes actuando al mismo tiempo.

## Secuencia Recomendada

1. Requerimiento de alto nivel o idea inicial.
2. Analista de negocio o discovery enriquece el brief inicial cuando la idea esta verde.
3. Analista funcional produce alcance completo, backlog por especialidad y slices implementables.
4. Revision humana o gate de aprobacion de alcance.
5. Arquitecto de software disena arquitectura y contratos.
6. UX/UI define experiencia web/mobile.
7. Revision de consistencia entre funcional, arquitectura y UX/UI.
8. Orquestador arma el siguiente paquete de ejecucion usando funcional, arquitectura y UX/UI.
9. Desarrollo backend.
10. Desarrollo frontend web y frontend mobile, segun aplique.
11. Testing funcional, tecnico e integracion.
12. Correcciones y cierre.

## Paralelismo Recomendado

Se puede paralelizar:

- arquitectura y UX/UI una vez aprobado el alcance
- frontend web y frontend mobile cuando contratos y UX/UI esten suficientemente maduros
- testing de preparacion de casos mientras desarrollo implementa

No conviene paralelizar:

- discovery de negocio con implementacion
- analisis funcional con implementacion
- cambios de arquitectura mientras desarrollo ya construye piezas acopladas
- testing final sin criterios de aceptacion cerrados

## Gates Minimos

### Gate 1: Alcance Aprobado

Debe existir:

- brief inicial suficientemente claro
- objetivo de negocio claro
- alcance funcional
- alcance no funcional
- backlog por especialidad
- historias o slices implementables con criterios testeables
- criterios de aceptacion

### Gate 2: Solucion Definida

Debe existir:

- arquitectura objetivo
- contratos
- lineamientos de integracion
- especificacion UX/UI accionable
- paquete de ejecucion listo para el siguiente slice cuando ya se abre implementacion

### Gate 3: Desarrollo Integrable

Debe existir:

- implementacion alineada con contratos
- notas de integracion
- cobertura tecnica minima de cada capa

### Gate 4: Calidad Aceptable

Debe existir:

- evidencia de pruebas
- defectos priorizados
- decision explicita sobre riesgos remanentes

## Reglas De Handoff

Cada handoff debe incluir:

- contexto recibido
- decisiones ya tomadas
- entregables cerrados
- pendientes abiertos
- supuestos
- riesgos
- referencias funcionales, de arquitectura/contratos y de UX/UI cuando apliquen
- pedido explicito al proximo agente

## Plantilla De Handoff

Usar este formato:

1. Objetivo del paquete.
2. Alcance incluido.
3. Fuera de alcance.
4. Entradas usadas.
5. Decisiones asumidas.
6. Riesgos.
7. Entregables adjuntos.
8. Trabajo esperado del siguiente agente.

## Criterios De Calidad Del Sistema De Agentes

Tu sistema va a funcionar mejor si:

- cada agente tiene una sola responsabilidad dominante
- cada salida es consumible por otro agente
- ningun agente decide en silencio algo que afecte a otro
- toda decision importante queda registrada
- existe aprobacion humana en puntos de alto impacto
- implementacion recibe un paquete acotado con referencias, no el documento maestro como unica orden de trabajo
