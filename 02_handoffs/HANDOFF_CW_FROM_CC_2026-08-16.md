# HANDOFF — CC → Cowork | 2026-08-16

Sesión de CC sobre `HANDOFF_CC_SESSION_BRIEF_2026-08-08.md`. Varias tareas del brief resultaron obsoletas o mal planteadas. Este doc te pone al día y te deja 4 frentes que puedes trabajar en paralelo sin chocar conmigo.

---

## Antes que nada: el brief del 08-08 no es confiable

Tres de sus siete tareas estaban mal:

| Tarea del brief | Realidad |
|---|---|
| #1 Reactivar cron de Marco | Marco fue **retirado a propósito** el 2026-06-03, reemplazado por `social_media.mjs process_posts`, que ya corre martes y viernes. Descomentarlo habría creado un publicador duplicado en el mismo horario. No se hizo. |
| #2 Fix SureRank en escriba | Ya estaba aplicado. `escriba.mjs:281-283` usa `_surerank_*`. Cero ocurrencias de `yoast` en todo `/opt/alex-bot`. |
| #3 Agregar GBP Place ID | El campo ya existía, pero **con un typo**. Corregido. Detalle abajo. |
| #4 Patchear `sofia.mjs`, `leo.mjs`, `marco.mjs` | Esos archivos no existen. Los agentes reales son `creativo`, `director_v2` y `social_media`. Marco está retirado. |

**Qué hacer distinto:** antes de escribir un paso concreto en un handoff, verifica el estado real en el VPS (`crontab -l`, `grep` del archivo, logs en `/var/log/`). Los handoffs envejecen en semanas y ejecutarlos al pie de la letra puede romper producción.

---

## Lo que cambió en el VPS hoy

**Place ID corregido.** `agents/tenants/geo-carpentry.json` tenía `ChIJ49c5TIf7S4QRbXXNl1H0EvQ`. El correcto es `ChIJ49c5Tlf7S4QRbXXNI1H0EvQ`. Difieren en `I` mayúscula contra `l` minúscula, intercambiadas en dos posiciones. Se validó decodificando ambas contra el `place_id_fid` que ya estaba en el archivo. El sitio en vivo siempre tuvo el correcto, así que el link de reseñas nunca estuvo roto. También se llenaron `google_business_profile.place_id` y `.url`, que estaban en `"TBD"`.

**Nova apagado.** `agents/nova/` no existe en el VPS y nunca existió. Sus 4 crons diarios llevaban meses reventando con `MODULE_NOT_FOUND`. Quedaron comentados.

**Dos bugs del publicador corregidos.** Esto es lo importante:

1. El limitador de rate comparaba `Date.now()` contra slots programados en el futuro, dando intervalos negativos. Un número negativo siempre es menor que el mínimo, así que bloqueaba todo de forma permanente. Firma en los logs: `min_interval_-120min_need_0.25h`.
2. Los 2 posts de cada corrida pedían el mismo slot, así que el segundo siempre chocaba con el primero.

Resultado combinado: **13 posts quedaron varados en `Status=Error`** con scores de 8 y 9. Ninguno falló por calidad.

**Cuota de Airtable.** Estuvo agotada varios días y tumbó el pipeline entero. Jorge ya subió el plan. Ojo con esto: la mayoría de los agentes no chequean `r.ok` al llamar Airtable, así que un 429 se reporta como `"no records pending"`. El pipeline puede estar muerto reportando que todo va bien. Solo Eli grita el error de verdad.

---

## Estado de la cola de contenido

| Estado | Cantidad |
|---|---|
| Visual Listo (listos para publicar) | 14 |
| Error (varados por el bug, recuperables) | 13 |
| Programado | 13 |

Si Jorge aprueba el reset de los 13 en `Error`, la cola queda en 27 listos.

---

## Frente 1 — Revisión de contenido antes del martes (URGENTE)

**Por qué ahora:** con el bug corregido, el publicador del martes va a publicar de verdad en Facebook e Instagram. Hasta hoy no lo lograba. Es la primera vez que sale contenido real, y son hasta 27 posts en cola.

**Qué hacer:** revisar los posts en `Visual Listo` y en `Error` de la base `appAQpveuAec077jF`, tabla Posts (`tblBbSbpzzANl74y0`). Buscar:

- Léxico de real estate filtrado desde Pinnacle (motivated seller, wholesaling, ARV, cap rate). Geo es contratista general, no inmobiliaria.
- Captions en español sin acentos.
- Teléfono y sitio correctos en el CTA: (920) 367-1272 y geocarpentry.com.
- Visuales que sean obra real, no stock genérico.
- Coherencia EN/ES: cada record es un solo idioma y no debe traducirse.

**Entregable:** lista de IDs a aprobar, corregir o descartar. Es trabajo de criterio, no de código, y no toca nada de lo que yo estoy modificando.

---

## Frente 2 — Decisión sobre Nova

Nova aparece en la landing de Cowork como uno de los 27 agentes, pero no existe. Nunca se escribió. `foreman_marketing.mjs:91` ya lo reporta como `nova-offline` con nota "GBP quota pending (Case 5-5881000041235)".

**Qué hacer:** un doc corto de decisión. ¿En qué quedó el caso de quota con Google? ¿Cuánto trabajo es realmente construirlo (OAuth, Google Business Profile API, 4 modos: health_check, post_update, reply_reviews, weekly_report)? ¿Vale contra las otras prioridades de revenue?

No empieces a construirlo. Primero la decisión.

---

## Frente 3 — Limpiar los handoffs obsoletos

Estos tres describen un estado que ya no existe y son trampas para quien los ejecute:

- `HANDOFF_CC_SESSION_BRIEF_2026-08-08.md`
- `HANDOFF_MARCO_CRON_ACTIVATE.md`
- `HANDOFF_SURERANK_META_FIX.md`

Márcalos como resueltos o corrígelos con lo de este doc. Sugerencia: agrega una línea de fecha de verificación arriba de cada handoff nuevo, para que se note cuándo dejó de ser confiable.

---

## Frente 4 — Tareas 5, 6 y 7 del brief (solo especificación)

Siguen sin tocarse: Foreman cache-bust, Atlas Loop 2 más playbooks, y retry/backoff en los probes del supervisor.

Puedes afinar la especificación de estas tres, pero **no escribas código en `/opt/alex-bot`**. Yo estoy trabajando ahí y nos pisaríamos.

---

## Límites para no chocar

**No toques:**
- Nada dentro de `/opt/alex-bot` en el VPS
- El crontab
- El estado de los records en Airtable (yo espero aprobación de Jorge para el reset de los 13)

**Tuyo:**
- Revisión y criterio sobre el contenido
- Documentos y especificaciones
- La decisión sobre Nova

---

## Referencia

- VPS: `root@187.77.215.146`, llave en `Memory Claude/vps_key`
- Airtable base: `appAQpveuAec077jF`, tabla Posts `tblBbSbpzzANl74y0`
- FB Page `723873447473999` · IG `17841475418377793`
- Place ID correcto: `ChIJ49c5Tlf7S4QRbXXNI1H0EvQ`
- Backups de hoy: `safety.mjs.bak-20260816`, `social_media.mjs.bak-20260816`, `/root/crontab.bak-20260816`
- Publicador: FB martes y viernes 10:00 UTC, IG martes y viernes 11:00 UTC
