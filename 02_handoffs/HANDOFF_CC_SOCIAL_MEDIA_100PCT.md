# HANDOFF — CC: Social Media Pipeline al 100%
> Cowork → Claude Code | 2026-08-16
> Verificado: agentes reales en VPS son `social_media.mjs`, `oraculo`, `creativo`, `reescritor`
> Objetivo: pipeline completo Idea → Publicado funcionando sin intervención manual

---

## Estado actual (después de la sesión de hoy)

| Etapa | Agente real | Estado |
|---|---|---|
| Stage 3: Visual Listo → Publicado | `social_media.mjs` | ✅ Bug corregido hoy. Corre Tue/Fri 10:00 UTC (FB) + 11:00 UTC (IG) |
| Stage 2: Oráculo OK → Visual Listo | `creativo` (visual creator) | ❓ Sin verificar |
| Stage 1: Idea → Oráculo OK | `oraculo` (o equivalente) | ❓ Sin verificar |

**Cola actual:**
- 27 posts en `Visual Listo` → se publican Tue/Fri automático ✅
- 7 posts nuevos en `Idea` → necesitan pasar por Etapas 1 y 2

---

## TAREA 1 — Verificar y activar Etapa 1: Oráculo (URGENTE)

```bash
ssh root@187.77.215.146

# Encontrar el agente de revisión de contenido
ls /opt/alex-bot/agents/ | grep -iE "oraculo|oracle|review"

# Ver su cron
crontab -l | grep -iE "oraculo|oracle|review"

# Ver últimas líneas de su log
tail -30 /var/log/alex-bot/oraculo.log  # ajustar nombre si es diferente
```

**Qué debe hacer este agente:**
- Leer posts en Airtable `tblBbSbpzzANl74y0` con `Status = "Idea"`
- Evaluarlos (score de calidad, voz de marca, CTA correcto)
- Mover los aprobados a `Status = "Oraculo OK"` — **nota: sin acento en Airtable**
- Mover los rechazados a `Status = "Rechazada"`

**Si el cron no existe o está comentado:** activarlo con el mismo patrón que el publisher.
**Si el agente falla:** revisar si llama Airtable correctamente (base `appAQpveuAec077jF`, tabla `tblBbSbpzzANl74y0`).

---

## TAREA 2 — Verificar y activar Etapa 2: Creativo/Visual (URGENTE)

```bash
# Encontrar el agente generador de visuales
ls /opt/alex-bot/agents/ | grep -iE "creativo|sofia|visual|imagen"

# Ver su cron
crontab -l | grep -iE "creativo|sofia|visual"

# Ver su log
tail -30 /var/log/alex-bot/creativo.log  # ajustar nombre
```

**Qué debe hacer este agente:**
- Leer posts con `Status = "Oraculo OK"`
- Generar imagen (FLUX-AI o Pexels) usando el campo `fld0gqkDeyGEwbLV5` (visual prompt — ya rellenado en los 7 posts nuevos)
- Subir imagen a Cloudinary o storage
- Mover post a `Status = "Visual Listo"`

**Si el cron no existe o está comentado:** activarlo.
**Si falla en la generación de imagen:** loggear el error exacto — puede ser API key de FLUX, quota de Cloudinary, o campo vacío.

---

## TAREA 3 — Diversidad de temas en el publisher

**Problema:** 27 posts en cola incluyen 8 sobre cedar/composite deck y 8 sobre shower/tub. Si el publisher los saca en orden cronológico, publicará 4 posts casi idénticos seguidos.

**Fix:** en `social_media.mjs`, al seleccionar el post a publicar, agregar lógica de topic diversity:

```javascript
// En lugar de simplemente tomar el primer post "Visual Listo":
// 1. Obtener los últimos 2 posts publicados (campo fldWz1LeSMtOnDf7Y = topic)
// 2. Excluir posts con el mismo topic que el último publicado
// 3. Si todos los pendientes son del mismo topic, proceder normal (no bloquear)

// Lógica sugerida (agregar después de obtener candidates):
const lastPublished = await getLastPublishedTopics(2); // últimos 2 topics
const preferred = candidates.filter(p => !lastPublished.includes(p.topic));
const selected = preferred.length > 0 ? preferred[0] : candidates[0];
```

Campo de topic en Airtable: `fldWz1LeSMtOnDf7Y`
Valores posibles: `Deck-Build`, `Bathroom-Remodel`, `Kitchen-Remodel`, `Bilingual`, `General`, `Home-Renovation`, `Finish-Carpentry`

---

## TAREA 4 — Airtable error handling (rápido, alta prioridad)

Según CC hoy: la mayoría de agentes no chequean `r.ok` en llamadas a Airtable. Un 429 (quota excedida) se reporta como "no records pending" en lugar de error real. Jorge ya subió el plan pero el bug sigue latente.

**Fix en todos los agentes que llaman Airtable:**
```javascript
const r = await fetch(url, opts);
if (!r.ok) {
  const err = await r.text();
  throw new Error(`Airtable ${r.status}: ${err}`);
}
```

Agentes a patchear: `oraculo`, `creativo`, `social_media.mjs`, `reescritor` (todos los que toquen Airtable).

---

## TAREA 5 — Test end-to-end del pipeline

Una vez activadas las Tareas 1-3, verificar que los 7 posts en `Idea` fluyen solos:

```bash
# Correr oraculo manualmente para procesar los 7 posts en "Idea":
cd /opt/alex-bot && node agents/[nombre_oraculo]/[archivo].mjs 2>&1 | tail -30

# Verificar en Airtable que cambiaron de Idea → Oraculo OK
# Luego correr creativo:
cd /opt/alex-bot && node agents/[nombre_creativo]/[archivo].mjs 2>&1 | tail -30

# Verificar que cambiaron de Oraculo OK → Visual Listo con imagen generada
```

---

## CHECKLIST DE VERIFICACIÓN FINAL

```
[ ] crontab -l muestra cron activo para oraculo (Stage 1)
[ ] crontab -l muestra cron activo para creativo (Stage 2)
[ ] crontab -l muestra cron activo para social_media (Stage 3) ← ya verificado
[ ] Los 7 posts en "Idea" tienen Status = "Visual Listo" al final del test
[ ] social_media.mjs selecciona posts con topic diversity
[ ] Todos los agentes hacen r.ok check en llamadas Airtable
```

---

## Referencia rápida

- VPS: `root@187.77.215.146`
- Airtable base: `appAQpveuAec077jF`
- Tabla Posts: `tblBbSbpzzANl74y0`
- Campo Status: `fldWBZWoN7DUV1hO6` → opciones: `Idea`, `Oraculo OK`, `Visual Listo`, `Programado`, `Publicado`, `Error`
- Campo Topic: `fldWz1LeSMtOnDf7Y`
- Campo Visual Prompt: `fld0gqkDeyGEwbLV5` ← ya rellenado en los 7 posts nuevos
- FB Page: `723873447473999` | IG: `17841475418377793`
- Publisher: FB Tue/Fri 10:00 UTC, IG Tue/Fri 11:00 UTC
- Backups de hoy: `safety.mjs.bak-20260816`, `social_media.mjs.bak-20260816`
