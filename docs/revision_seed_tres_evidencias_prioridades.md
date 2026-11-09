# Revisión priorizada del seed con tres evidencias

Archivo revisado:
- `docs/seed_portal_impacto_ia_bilingue_tres_evidencias_recientes.csv`

Objetivo de esta lista:
- concentrar la siguiente pasada editorial en las actividades con peor combinación de:
  - descripción demasiado genérica
  - summary demasiado genérico
  - evidencia demasiado macro o transversal
  - taxonomía poco precisa

## Prioridad 1

Casos donde la descripción quedó demasiado plantilla y la evidencia todavía es demasiado genérica para la actividad concreta.

- `transparencia-y-reporting`
- `analisis-de-datos-de-impacto`
- `traduccion-de-contenidos`
- `atencion-al-cliente-por-chat`
- `screening-de-postulantes`
- `revision-inicial-de-contratos`
- `soporte-postventa`
- `resolucion-de-tickets-simples`
- `derivacion-de-tickets`
- `onboarding-de-clientes`

Criterio de corrección:
- reemplazar fórmulas como `Actividad de...` o `Comprende tareas vinculadas con...`
- describir qué hace realmente la actividad
- mantener `editorial_summary` corto y específico
- reemplazar al menos 1 o 2 evidencias macro por fuentes más cercanas a la actividad

## Prioridad 2

Casos con buena base, pero todavía demasiado apoyados en evidencia transversal del rubro.

- `tour-virtual-asistido`
- `tasacion-preliminar`
- `atencion-inicial-a-interesados`
- `soporte-de-concierge-digital`
- `soporte-al-pasajero`
- `segmentacion-de-audiencias`
- `copywriting-para-anuncios`
- `benchmark-competitivo`
- `calificacion-de-leads`
- `seo-tecnico`

Criterio de corrección:
- mantener la estructura de actividad si ya es razonable
- buscar evidencias más específicas del caso de uso
- evitar tríadas repetidas de fuentes macro del mismo dominio

## Prioridad 3

Casos que están bastante mejor y pueden tomarse como referencia de tono para la reescritura.

- `desarrollo-de-software-backend`
- `code-review`
- `refactoring-de-codigo`
- `generacion-de-documentacion-funcional`

Criterio de uso:
- sirven como benchmark de descripción neutral y concreta
- todavía pueden mejorar en especificidad de evidencia, pero la redacción base ya es utilizable

## Patrones a corregir

Descripción de actividad:
- evitar `Actividad de...`
- evitar `Comprende tareas vinculadas con...`
- evitar textos genéricos intercambiables entre actividades

Summary de actividad:
- evitar `Actividad de ...`
- preferir una frase corta que nombre la función real

Evidencia:
- evitar tríadas demasiado macro como:
  - `Deloitte + McKinsey + White House`
  - `Adobe + Forrester + Gartner`
  - `Averi + HubSpot + Adobe`
- dejar como máximo una fuente macro si aporta contexto
- completar con fuentes más cercanas a la actividad concreta

Taxonomía:
- revisar especialmente casos donde categoría y rubro prácticamente se pisan
- priorizar categorías funcionales más concretas cuando existan

## Regla práctica para la siguiente pasada

Para cada actividad prioritaria:
1. reescribir `short_description_*`
2. reescribir `full_description_*`
3. reescribir `editorial_summary_*`
4. revisar si las 3 evidencias siguen siendo demasiado generales
5. conservar `official_ai_status` solo si la evidencia realmente lo sostiene
