# HANDOFF — Optimizar consumo de Airtable API (sin subir de plan)
> Generado por: Cowork · Fecha: 2026-07-30
> Para: Claude Code (CC)
> Prioridad: ALTA — bloquea leads, pausa del bot, y citas hasta resolverse
> Decisión de Jorge 2026-07-30: NO subir de plan Airtable, optimizar consumo en su lugar

---

## 🎯 CONTEXTO

Airtable (`appAQpveuAec077jF`, plan Free) devuelve `429 API billing plan limit exceeded`
desde 2026-07-30 (confirmado 2x). Jorge tiene pocos leads reales — el consumo NO viene
del volumen de negocio, viene de los ~20+ agentes en el VPS que le pegan a Airtable
por cron, sin importar si hay actividad de leads o no.

**Antes de tocar código:** Jorge debe revisar Airtable → Workspace Settings → Usage,
para confirmar cuál integración/base consume más. Sin ese dato, esta lista es la mejor
hipótesis basada en lo que ya sabemos del sistema — CC debe confirmar contra el dato real.

---

## 🔴 SOSPECHOSO #1 — Log de conversación duplicado por cada SMS

`geo_agent.php` (v4) hace **2 escrituras a Airtable por cada mensaje SMS entrante**:
1. `geo_at_update_lead()` — actualiza status/notes del lead (necesario)
2. `geo_at_log_conversation()` (paso 12) — log de QC en tabla separada (Geo_Conversations)

Más las lecturas: `geo_at_find_lead_by_phone()`, y desde v4 `geo_agent_fetch_booked_slots()`.
Un solo intercambio de SMS (cliente escribe, bot contesta) puede generar 4-5 requests a Airtable.
Si el bot manda follow-ups (`geo_seguimiento.php`) eso suma más encima.

**Propuesta:** El log de conversación completo YA vive en JSON local (`geo_conversations/*.json`,
vía `geo_conv_append_turn()`) — no depende de Airtable para nada funcional, es solo copia de
respaldo/QC. Opciones, de menor a mayor esfuerzo:
- **A (rápido):** Quitar el paso 12 (`geo_at_log_conversation`) de `geo_agent.php` por completo.
  El JSON local ya tiene todo el historial. Jorge pierde la vista en Airtable de conversaciones,
  pero puede revisar los `.json` directo en el servidor si hace falta.
- **B (medio):** Batchear — en vez de loggear cada mensaje individual a Airtable, un cron aparte
  corre 1x/día y sube el resumen del día completo en un solo request por lead activo.
- **C (mínimo cambio):** Dejarlo igual pero solo loguear a Airtable si `escalate=true` (mensajes
  que sí importan a Jorge) — mensajes rutinarios de calificación no se loguean ahí.

**Recomendación Cowork: Opción A.** Es el cambio de menor riesgo y mayor ahorro inmediato.

---

## 🟡 SOSPECHOSO #2 — Crons de agentes no relacionados a leads, corriendo sin freno

Del inventario conocido (`GEO_CARPENTRY_TECH.md` + `MEMORY.md`):

| Agente | Frecuencia actual conocida | Toca leads en vivo? | Propuesta |
|---|---|---|---|
| `geo_seguimiento.php` | cada 30 min, guard 8am-6pm L-V | Sí (necesario) | Dejar igual — ya optimizado |
| Marco (social_media) | cron Mar/Vie 11am | No | Dejar — ya es baja frecuencia |
| Eli (Escriba) | cron Mar/Vie 10am | No | Dejar — ya es baja frecuencia |
| SM pipeline (Oráculo, Reescritor, Sofia, Leo, Max, Nina, Sage) | desconocida — CC confirmar | No | Si corre diario, bajar a 2-3x/semana |
| Nova (GBP) | desconocida — CC confirmar (bloqueada por quota GCP aparte) | No | Sin actividad hasta que Google resuelva quota — verificar que NO esté poleando Airtable mientras tanto |
| `analitico`, `rastreador`, `oraculo` (SEO/analytics) | desconocida — CC confirmar | No | Si corren cada hora o más seguido, bajar a 1x/día — SEO no cambia cada hora |
| **NUEVO: Cal (calendar sync)** | propuesto cada 15 min | Sí (citas) | Mantener, pero solo si Airtable ya está OK — si no, bajar a cada 30-60 min, las citas no son tan urgentes de sincronizar |

**CC: por favor correr `crontab -l` en el VPS y pegar la lista real acá** — la tabla de arriba
es la mejor info que Cowork tiene sin acceso directo al servidor. Con la lista real confirmamos
qué bajar sin adivinar.

---

## ✅ ACCIÓN INMEDIATA (sin esperar auditoría completa)

1. CC: aplicar Opción A del Sospechoso #1 (quitar log duplicado en Airtable) — mayor impacto,
   menor riesgo, un solo archivo (`geo_agent.php`, ya en v4, paso 12).
2. CC: correr `crontab -l` y `systemctl list-timers` en VPS, reportar frecuencia real de cada agente.
3. Jorge: revisar Airtable → Usage, confirmar top consumidor real.
4. Con datos reales, Cowork ajusta esta tabla y CC aplica cambios de frecuencia.
5. Repetir: revisar Usage de nuevo tras una semana para confirmar que bajó.

---

## ⚠️ NO TOCAR

- `geo_seguimiento.php` — ya tiene guard de horario y dedup, es el más optimizado del sistema.
- Escrituras de `Lead Status` / `Notes` en `geo_agent.php` (pasos 5, 9, 11) — son el corazón
  del sistema de leads, no se deben quitar aunque cuesten requests.

---
*Relacionado: `HANDOFF_CAL_AGENT_VPS.md` (bloqueado por este mismo problema)*
