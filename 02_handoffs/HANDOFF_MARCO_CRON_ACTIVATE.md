# ~~HANDOFF — Activar Marco Cron (Social Media Posts)~~
> ⚠️ **OBSOLETO — NO EJECUTAR. Verificado: 2026-08-16**

## Por qué está obsoleto
Marco fue **retirado intencionalmente el 2026-06-03**. El publicador real es `social_media.mjs`, que ya corre martes y viernes. Reactivar el cron de marco crearía un publicador duplicado en el mismo horario y rompería el pipeline.

Archivo relevante en VPS: `/opt/alex-bot/agents/social_media/social_media.mjs`
Cron activo: FB martes y viernes 10:00 UTC, IG martes y viernes 11:00 UTC.

---
> Cowork → Claude Code | 2026-08-08 (ORIGINAL — ARCHIVADO)
> PRIORIDAD: ~~🔴 URGENTE~~ — RESUELTO por pipeline nuevo

---

## Contexto rápido

Marco es el agente Social Media Manager. Su cron fue silenciado el 2026-06-01
mientras se completaba el SM pipeline. El pipeline YA está listo y funcionando:
- SM Pipeline: 9 posts aprobados (score 8-9) en estado "Visual Listo" en Airtable
- Marco solo necesita su cron activo para publicarlos en Meta (FB + IG)

---

## Paso 1 — SSH al VPS

```bash
ssh root@187.77.215.146
```

---

## Paso 2 — Verificar el crontab actual

```bash
crontab -l
```

Busca una línea con `marco` o `social_media` que esté comentada (con `#` al inicio).
Algo como:
```
# 0 11 * * 2,5 cd /opt/alex-bot && node agents/social_media/marco.mjs >> /var/log/alex-bot/marco.log 2>&1
```

---

## Paso 3A — Si la línea existe (comentada): descomentarla

```bash
crontab -l > /tmp/crontab_backup.txt   # backup primero
crontab -e                              # abre el editor
# Quita el # del inicio de la línea de marco
# Guarda y sal
```

---

## Paso 3B — Si la línea NO existe: agregarla

```bash
crontab -l > /tmp/crontab_backup.txt   # backup primero

# Agregar la línea (marco corre Martes y Viernes 11am UTC):
(crontab -l; echo "0 11 * * 2,5 cd /opt/alex-bot && node agents/social_media/marco.mjs >> /var/log/alex-bot/marco.log 2>&1") | crontab -
```

**Nota sobre el path del agente:** el archivo puede estar en:
- `/opt/alex-bot/agents/social_media/marco.mjs`
- `/opt/alex-bot/agents/marco/marco.mjs`

Verifica con: `ls /opt/alex-bot/agents/ | grep -i marco`

---

## Paso 4 — Crear directorio de log si no existe

```bash
mkdir -p /var/log/alex-bot
```

---

## Paso 5 — Verificar que quedó bien

```bash
crontab -l | grep marco
```

Debe mostrar la línea SIN el `#` al inicio.

---

## Paso 6 — Test manual (opcional pero recomendado)

```bash
cd /opt/alex-bot && node agents/social_media/marco.mjs 2>&1 | tail -20
```

Debe conectarse a Airtable, encontrar posts "Visual Listo" y publicarlos en Meta.
Si hay error de credenciales, revisar `/opt/alex-bot/.env` que tenga:
- `FB_PAGE_ID` o equivalente en geo-carpentry.json
- `FACEBOOK_ACCESS_TOKEN` o `FB_ACCESS_TOKEN`
- `INSTAGRAM_BUSINESS_ID` o `IG_USER_ID`

---

## Verificación final esperada

- Crontab muestra la línea de marco sin `#`
- Log en `/var/log/alex-bot/marco.log` empieza a tener actividad
- En Airtable `Geo_Posts` (appAQpveuAec077jF): posts cambian de "Visual Listo" → "Programado" o "Publicado"
- En FB Page (ID: 723873447473999) aparecen posts publicados

---

## Si algo falla

Revisa el log:
```bash
tail -50 /var/log/alex-bot/marco.log
```

Credenciales de Meta en `.env`:
- FB Page: 723873447473999
- IG: 17841475418377793
- FB Access Token: fue generado permanente el 2026-06-01 (26 permisos)
- App ID: 3291485027720361 ("Geo Carpentry Social" en BM de Pinnacle)
