# ~~HANDOFF — CC Session Brief: Geo Carpentry Revenue Sprint~~
> ⚠️ **OBSOLETO — Verificado: 2026-08-16 por CC + Cowork. NO EJECUTAR.**
> Creado: 2026-08-08 | Expirado: 2026-08-16

## Estado real al 2026-08-16
| Tarea | Estado real |
|---|---|
| #1 Marco cron | ❌ Marco retirado intencionalmente el 2026-06-03. Reemplazado por `social_media.mjs`. No reactivar. |
| #2 SureRank fix | ✅ Ya estaba aplicado en `escriba.mjs:281-283`. Cero ocurrencias de yoast. |
| #3 GBP Place ID | ✅ Corregido por CC (typo I/l). `google_business_profile.place_id` y `.url` completados. |
| #4 Patchear sofia/leo/marco | ❌ Esos archivos no existen. Agentes reales: `creativo`, `director_v2`, `social_media`. |
| #5-7 Foreman, Atlas, Supervisor | ⏳ Pendientes — ver especificación actualizada cuando esté lista. |

> Lección aprendida: verificar estado real en VPS antes de ejecutar cualquier handoff. Los handoffs envejecen en semanas.

---
> Cowork → Claude Code | 2026-08-08 (ORIGINAL — ARCHIVADO)

Este brief consolida TODAS las tareas urgentes para CC en orden de impacto en revenue.
Ejecutar en el orden listado — cada tarea desbloquea la siguiente.

---

## 🔴 TAREA 1 — Activar Marco Cron (30 min)
**Impacto:** Inmediato — 9 posts publicados en FB/IG esta semana
**Archivo:** `02_handoffs/HANDOFF_MARCO_CRON_ACTIVATE.md`

TL;DR:
```bash
ssh root@187.77.215.146
crontab -e
# Descomenta la línea de marco (o agrégala si no existe):
# 0 11 * * 2,5 cd /opt/alex-bot && node agents/social_media/marco.mjs >> /var/log/alex-bot/marco.log 2>&1
```

---

## 🔴 TAREA 2 — Fix SureRank Meta Keys (15 min)
**Impacto:** Páginas SEO rankean correctamente en Google (fix inmediato)
**Archivo:** `02_handoffs/HANDOFF_SURERANK_META_FIX.md`

TL;DR:
```bash
ssh root@187.77.215.146
cd /opt/alex-bot/agents/escriba/
cp escriba.mjs escriba.mjs.bak
sed -i 's/_yoast_wpseo_focuskw/_surerank_focus_keyword/g' escriba.mjs
sed -i 's/_yoast_wpseo_metadesc/_surerank_description/g' escriba.mjs
grep -n "surerank\|yoast" escriba.mjs  # verificar
```

---

## 🔴 TAREA 3 — Agregar GBP Place ID a geo-carpentry.json (5 min)
**Impacto:** Nova (GBP Manager) tendrá el Place ID cuando se desbloquee la quota de GCP

```bash
ssh root@187.77.215.146
nano /opt/alex-bot/agents/tenants/geo-carpentry.json
# Agregar dentro del objeto JSON:
# "gbp_place_id": "ChIJ49c5Tlf7S4QRbXXNI1H0EvQ"
```

---

## 🔴 TAREA 4 — Patch 5 SM Pipeline Agents para Geo Persona
**Impacto:** Marco publica con voz de Geo Carpentry (no genérica)
**Archivo:** `02_handoffs/HANDOFF_AGENTS_GEO_PATCH.md`

Agentes a patchear:
- `oraculo.mjs` — threshold de aprobación content → 5-6 (no 8)
- `reescritor.mjs` — voz Geo Carpentry LLC, Green Bay WI
- `sofia.mjs` — Visual Creator, branding Geo Carpentry
- `leo.mjs` — Video Director, local contractor tone
- `marco.mjs` — SM Manager, bilingual EN/ES, Geo persona

---

## 🟡 TAREA 5 — Foreman Cache-Bust Fix (SEO 58 → 75+)
**Impacto:** SEO score mejora significativamente
**Archivo:** `02_handoffs/HANDOFF_FOREMAN_SEO_FIX.md`

---

## 🟡 TAREA 6 — Atlas Loop 2 + 3 Playbooks
**Impacto:** Atlas genera playbooks SEO automáticamente + aprobación por Telegram
**Archivos:** `02_handoffs/HANDOFF_ATLAS_LOOP2.md` + `02_handoffs/HANDOFF_ATLAS_PLAYBOOKS.md`

---

## 🟡 TAREA 7 — Supervisor Retry/Backoff
**Impacto:** Agentes se recuperan solos de errores temporales de red (Telegram, OpenPhone, Airtable)

Implementar en los 3 probes:
```javascript
async function withRetry(fn, maxRetries = 3, delayMs = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, delayMs * Math.pow(2, i)));
    }
  }
}
```

---

## ✅ CHECKLIST DE VERIFICACIÓN POST-DEPLOY

Para cada tarea, confirmar antes de marcar como done:

| Tarea | Verificación |
|---|---|
| Marco cron | `crontab -l \| grep marco` muestra línea sin `#` |
| SureRank fix | `grep -n "surerank" escriba.mjs` muestra las 2 keys |
| GBP Place ID | `cat geo-carpentry.json \| grep gbp_place_id` retorna el ID |
| SM Patch | `node agents/social_media/marco.mjs` corre sin error de persona |
| Foreman | Score SEO en siguiente run > 70 |

---

## 📝 NOTAS CRÍTICAS

1. **Backup SIEMPRE antes de editar** — `cp archivo.mjs archivo.mjs.bak`
2. **VPS:** `root@187.77.215.146` — clave SSH en `Memory Claude/vps_key`
3. **Hostinger:** `u433637438@srv1067.hstgr.io` — para WP-CLI verification
4. **Airtable:** `appAQpveuAec077jF` — verificar que posts cambian de estado
5. **NO tocar:** cron de escriba (ya activo), geo_agent.php, config.php de Hostinger

---

## 🔐 CREDENTIALS QUICK REF

- VPS: `root@187.77.215.146` | SSH key en `Memory Claude/vps_key`
- FB Page: `723873447473999`
- IG Business: `17841475418377793`
- Meta App ID: `3291485027720361`
- Airtable base: `appAQpveuAec077jF`
- GBP Place ID: `ChIJ49c5Tlf7S4QRbXXNI1H0EvQ`
- Google review link: `https://search.google.com/local/writereview?placeid=ChIJ49c5Tlf7S4QRbXXNI1H0EvQ`
