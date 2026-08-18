# HANDOFF — CC: Agente de Scheduling Inteligente (programador.mjs)
> Cowork → Claude Code | 2026-08-17
> Objetivo: Agente que lee engagement de El Analítico y asigna fechas/horas óptimas a posts en "Visual Listo"

---

## Contexto — por qué existe este handoff

El pipeline social actual tiene un gap crítico:

```
Idea → Oráculo OK → Visual Listo → [GAP AQUÍ] → Publicado
```

El publisher (`social_media.mjs`) publica posts de "Visual Listo" a horas **fijas**:
- FB: 10:00 UTC diario
- IG: 11:00 UTC diario

No hay inteligencia de cuándo publicar. El Analítico lleva recopilando datos de engagement desde 2026-08-16, pero nadie los usa para decidir horarios.

**El nuevo agente `programador.mjs` cierra ese gap.**

---

## Lo que debe hacer `programador.mjs`

### Responsabilidad
1. Leer posts en `Airtable Geo_Posts` con `Status = "Visual Listo"` y `Oraculo_Score >= 7`
2. Analizar datos históricos de engagement por día/hora de `Social_Insights` (tabla de El Analítico)
3. Calcular el slot óptimo para cada post basado en: plataforma, segmento, datos históricos
4. Escribir `Scheduled_Time` y cambiar `Status = "Programado"` en Airtable
5. Respetar capacidad: máximo 1 post por plataforma por día

### Cuándo corre
- **Cron: diario a las 05:00 UTC** (una hora antes de El Analítico para que los datos estén frescos)
- Solo procesa posts sin `Scheduled_Time` asignado

---

## Lógica de scheduling

### Paso 1 — Leer slots disponibles
```javascript
// Ventana de scheduling: próximos 14 días
// Slots candidatos por plataforma:
const FB_SLOTS = ['09:00', '12:00', '17:00', '19:00']; // UTC
const IG_SLOTS = ['10:00', '13:00', '18:00', '20:00']; // UTC

// Un día puede tener máximo 1 post por plataforma
// Revisar en Airtable cuáles fechas ya están ocupadas (Status=Programado o Publicado)
```

### Paso 2 — Leer datos de El Analítico
El Analítico escribe a la tabla `Social_Insights` en Airtable con estos campos:
- `Date` — YYYY-MM-DD
- `Impressions` — page_impressions
- `Reach` — page_reach
- `EngagedUsers` — page_engaged_users
- `PostEngagements` — page_post_engagements

**Limitación actual:** El Analítico guarda métricas de PÁGINA, no de post individual.
Como primera versión, usar el día de la semana con más `EngagedUsers` histórico.

```javascript
// Calcular promedio de EngagedUsers por día de semana (0=Dom, 1=Lun, ... 6=Sáb)
// Ordenar de mayor a menor → ese es el orden de preferencia de días
const dayScores = await getDayOfWeekEngagement(); // retorna array [dayOfWeek, avgEngagement]
```

### Paso 3 — Asignar slot
```javascript
// Para cada post en Visual Listo (ordenado por Oraculo_Score DESC):
//   1. Determinar plataforma: FB, IG, o "both" (requiere 2 slots)
//   2. Buscar próximo día disponible con score alto
//   3. Asignar el slot de hora más performante para esa plataforma
//   4. Marcar ese día/plataforma como ocupado
//   5. PATCH a Airtable: Status="Programado" + Scheduled_Time="YYYY-MM-DDTHH:MM:00Z"
```

### Paso 4 — Actualizar publisher
Actualmente `social_media.mjs` filtra `{Status}='Visual Listo'`. **Debe cambiar** para leer `{Status}='Programado'` y respetar `Scheduled_Time`:

```javascript
// En social_media.mjs — cambio requerido:
// ANTES: AND({Status}='Visual Listo',{Oraculo_Score}>=7)
// DESPUÉS: AND({Status}='Programado',IS_BEFORE({Scheduled_Time}, NOW()))

// Solo publicar si el Scheduled_Time ya pasó (o es la hora actual ± 30 min)
```

---

## Archivos involucrados

| Archivo | Acción |
|---|---|
| `/opt/alex-bot/agents/programador/programador.mjs` | **CREAR** — nuevo agente |
| `/opt/alex-bot/agents/social_media/social_media.mjs` | **MODIFICAR** — cambiar filtro de Airtable |
| `crontab` del VPS | **AGREGAR** — `0 5 * * * node /opt/alex-bot/agents/programador/programador.mjs` |

---

## Airtable — referencias técnicas

```
Base: appAQpveuAec077jF
Tabla posts: tblBbSbpzzANl74y0 (Geo_Posts)
Tabla insights: Social_Insights (nombre exacto — verificar con CC en vivo)

Campos en Geo_Posts relevantes:
  Status         — single select: Visual Listo → Programado
  Oraculo_Score  — number
  Scheduled_Time — date/time (formato: YYYY-MM-DDTHH:MM:00.000Z)
  Target_Platform — single select: "FB" | "IG" | "both"
  Segment_Anchor — single select: Deck-Build | Bathroom-Remodel | Kitchen-Remodel | General

Campos en Social_Insights relevantes:
  Date           — YYYY-MM-DD
  EngagedUsers   — number
  PostEngagements — number
  Reach          — number
```

---

## Patrón de agente existente a seguir

Seguir el mismo patrón que `analitico.mjs`:
- Leer tenant config desde `agents/tenants/geo-carpentry.json`
- Usar `AIRTABLE_TOKEN_GEO` (no `AIRTABLE_TOKEN`)
- Loggear todo a stdout (cron captura a `/var/log/alex-bot/programador.log`)
- **No usar `tenant_loader.mjs`** — leer JSON directo con `readFile` (el loader no existe en el VPS real)

```javascript
// Estructura básica del agente:
import { readFile } from 'fs/promises';

const tenantSlug = process.env.TENANT_SLUG || 'geo-carpentry';
const tenantConfig = JSON.parse(
  await readFile(`/opt/alex-bot/agents/tenants/${tenantSlug}.json`, 'utf8')
);
const airtableToken = tenantConfig.airtable.token; // AIRTABLE_TOKEN_GEO
const baseId = tenantConfig.airtable.baseId;       // appAQpveuAec077jF
const postsTable = 'tblBbSbpzzANl74y0';
```

---

## Verificación antes de activar

```bash
ssh root@187.77.215.146

# 1. Verificar tabla Social_Insights existe y tiene datos
curl -s "https://api.airtable.com/v0/appAQpveuAec077jF/Social_Insights?pageSize=5" \
  -H "Authorization: Bearer $AIRTABLE_TOKEN_GEO" | jq '.records[].fields'

# 2. Dry run del agente (loggear qué asignaría sin escribir a Airtable)
DRY_RUN=true node /opt/alex-bot/agents/programador/programador.mjs

# 3. Verificar que ningún post en Visual Listo queda sin Scheduled_Time después de correr
curl -s "https://api.airtable.com/v0/appAQpveuAec077jF/tblBbSbpzzANl74y0?\
filterByFormula=AND(%7BStatus%7D%3D'Visual+Listo',%7BOraculo_Score%7D%3E%3D7)&fields%5B%5D=Scheduled_Time" \
  -H "Authorization: Bearer $AIRTABLE_TOKEN_GEO" | jq '.records | length'
# Debe retornar 0 si el agente asignó todo
```

---

## Fase 2 (futuro — cuando haya datos de post individual)

Una vez que El Analítico empiece a guardar métricas POR POST (no solo por página), mejorar el algoritmo:

1. Agrupar posts publicados por hora del día → calcular `avg(EngagementRate)` por slot
2. Ponderar por plataforma (FB y IG tienen picos distintos)
3. Ponderar por segmento (Deck posts pueden funcionar mejor sábados que martes)
4. Usar esa tabla como lookup para asignar el slot de mayor probabilidad de engagement

El campo `Audit_Tier` de Geo_Posts (llenado por El Analítico) ya clasifica posts en tiers — usar eso para ajustar la prioridad de scheduling (posts Tier A van al mejor slot).

---

## Resumen ejecutivo para CC

> Construir `/opt/alex-bot/agents/programador/programador.mjs`.
> Lee posts "Visual Listo" con score ≥7, analiza qué días de semana tienen más engagement según `Social_Insights`, asigna `Scheduled_Time` al mejor slot disponible en los próximos 14 días, cambia status a "Programado".
> Modificar `social_media.mjs` para que filtre por `Programado` + `Scheduled_Time <= NOW()` en vez de `Visual Listo`.
> Agregar cron a las 05:00 UTC.
> Primero hacer DRY_RUN antes de escribir a Airtable.
