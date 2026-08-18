# HANDOFF — Nuevo agente "Cal" (Calendar Sync) para el VPS
> Generado por: Cowork · Fecha: 2026-07-30
> Para: Claude Code (CC)
> Prioridad: Después de que Jorge arregle el límite de Airtable (ver bloqueador abajo)

---

## 🎯 QUÉ HACE ESTE AGENTE

"Cal" es un agente nuevo, igual de sencillo que Nova, que corre cada 15 minutos en el VPS.
Su único trabajo:

1. Lee la tabla `Geo_Leads` en Airtable (`appAQpveuAec077jF` / `tblaH41HWeVG9ZXLn`)
2. Busca leads con `Lead Status = "Appointment Set"` y `Appointment Date` lleno
3. Si esa cita **todavía no está sincronizada** al Google Calendar (ver marca abajo), crea el evento
4. Marca el lead como sincronizado para que nunca se duplique el evento

Esto conecta el trabajo que ya hizo Cowork en `geo_agent_v4.php` (el bot de SMS, que ya solo
ofrece citas Lunes/Miércoles/Jueves 4-6pm) con el Google Calendar real de Jorge
(`admin@geocarpentry.com`), para que él vea sus citas ahí sin hacer nada manual.

---

## 🔴 BLOQUEADOR ACTIVO — NO EMPEZAR SIN ESTO

Airtable de Jorge está en el plan gratis y llegó al límite mensual de requests
(error `429 API billing plan limit exceeded`, confirmado 2026-07-30, dos veces).
**Nada se puede leer ni escribir en Airtable hasta que Jorge suba de plan.**
Cal fallará en cada corrida hasta que esto se resuelva — no es un bug de Cal.

---

## 🔑 CREDENCIALES — REUTILIZAR LAS DE NOVA, NO CREAR UN PROYECTO NUEVO

Nova (el agente de Google Business Profile) ya tiene un Google Cloud Project funcionando:
**`investoros-agents`**, con OAuth2 Client ID/Secret ya creados y guardados en
`/opt/alex-bot/.env` como `GBP_CLIENT_ID` y `GBP_CLIENT_SECRET`.

**Plan recomendado (más rápido, menos piezas nuevas):**
1. En Google Cloud Console → proyecto `investoros-agents` → habilitar **Google Calendar API**
   (https://console.cloud.google.com/apis/library/calendar-json.googleapis.com?project=investoros-agents)
2. Reusar el MISMO `GBP_CLIENT_ID` / `GBP_CLIENT_SECRET` — son válidos para cualquier API de Google,
   solo cambia el **scope** que se autoriza.
3. Generar un refresh token NUEVO con scope de Calendar (los refresh tokens son específicos por scope,
   el de Nova no sirve para esto). Jorge puede hacerlo con Google OAuth Playground
   (https://developers.google.com/oauthplayground):
   - Engranaje ⚙️ (arriba a la derecha) → "Use your own OAuth credentials" → pegar Client ID/Secret de Nova
   - Step 1: elegir scope `https://www.googleapis.com/auth/calendar.events`
   - Autorizar con la cuenta `admin@geocarpentry.com`
   - Step 2: "Exchange authorization code for tokens" → copiar el **Refresh Token**
4. Guardar en `/opt/alex-bot/.env`:
   ```
   GEO_CAL_CLIENT_ID=<mismo que GBP_CLIENT_ID>
   GEO_CAL_CLIENT_SECRET=<mismo que GBP_CLIENT_SECRET>
   GEO_CAL_REFRESH_TOKEN=<nuevo, del OAuth Playground>
   GEO_CAL_CALENDAR_ID=admin@geocarpentry.com
   ```

**CC:** si prefieres un Client ID separado por limpieza/seguridad, también está bien — pero no es
necesario, y usar el existente ahorra un paso de configuración a Jorge.

---

## 🛠️ LÓGICA DEL AGENTE (pseudocódigo — adaptar al patrón real de agents/nova/nova.mjs)

```javascript
// agents/cal/cal.mjs
import { loadTenantConfig } from '../tenants/loader.mjs';
// ... imports de logger, airtable client, etc. — seguir el patrón de nova.mjs

const SYNC_TAG_PREFIX = '[GEO_CAL_SYNCED:';

async function run() {
  const config = await loadTenantConfig('geo-carpentry');

  // 1. Traer leads con cita confirmada
  const leads = await airtableGet('Geo_Leads', {
    filterByFormula: "AND({Lead Status}='Appointment Set', {Appointment Date}!='')",
  });

  for (const lead of leads) {
    const notes = lead.fields['Notes'] || '';
    if (notes.includes(SYNC_TAG_PREFIX)) continue; // ya sincronizado, saltar

    const apptDate = new Date(lead.fields['Appointment Date']);

    // 2. Red de seguridad — nunca crear un evento fuera de Lun/Mié/Jue 4-6pm CT
    const dow = apptDate.getDay(); // 0=Dom ... 6=Sáb (ajustar a CT)
    const hour = apptDate.getHours();
    const validDay = [1, 3, 4].includes(dow); // Lun, Mié, Jue
    const validHour = [16, 17].includes(hour); // 4pm o 5pm inicio
    if (!validDay || !validHour) {
      logger.warn('cal_skip_out_of_window', { leadId: lead.id, apptDate });
      // Notificar a Jorge por Telegram — esto necesita revisión manual
      continue;
    }

    // 3. Crear evento en Google Calendar (1 hora de duración)
    const endDate = new Date(apptDate.getTime() + 60 * 60 * 1000);
    try {
      await createCalendarEvent({
        calendarId: process.env.GEO_CAL_CALENDAR_ID,
        summary: `Estimación gratis — ${lead.fields['Full Name'] || 'Cliente'} (${lead.fields['Service Type'] || ''})`,
        description: `Tel: ${lead.fields['Phone']}\nDirección: ${lead.fields['Home Address'] || 'N/A'}\nNotas: ${lead.fields['Project Description'] || ''}`,
        location: lead.fields['Home Address'] || '',
        start: apptDate,
        end: endDate,
        timeZone: 'America/Chicago',
      });

      // 4. Marcar como sincronizado — idempotencia, nunca duplica
      await airtableUpdate('Geo_Leads', lead.id, {
        Notes: notes + `\n${SYNC_TAG_PREFIX}${new Date().toISOString()}]`,
      });

      logger.info('cal_synced', { leadId: lead.id, apptDate });
    } catch (err) {
      logger.error('cal_sync_failed', { leadId: lead.id, error: err.message });
      // No marcar como sincronizado — se reintenta en la próxima corrida (cada 15 min)
    }
  }
}
```

**Reglas importantes:**
- **Idempotente:** si Cal falla a medio proceso, la próxima corrida lo reintenta solo (no marca
  sincronizado hasta que el evento se creó con éxito).
- **Nunca crea un evento fuera de Lun/Mié/Jue 4-6pm** — aunque esto ya lo bloquea el bot de SMS
  (`geo_claude_v3.php`), esta es una segunda capa de seguridad por si un dato llega mal por otro lado.
- **No borra ni modifica** eventos existentes de Jorge — solo agrega los nuevos.
- **Duración fija:** 1 hora (confirmado con Jorge 2026-07-30).

---

## ⚙️ CRON

Agregar a la tabla `AGENT_MAP` en `router.mjs` y al cron existente:
```
*/15 * * * *  →  cal (cada 15 minutos, todo el día — no necesita estar limitado a horario laboral,
                  ya que solo lee citas ya confirmadas y las agrega al calendario)
```

---

## ✅ CHECKLIST

- [ ] Jorge: subir plan de Airtable (bloqueador — nada funciona sin esto)
- [ ] Jorge: habilitar Google Calendar API en proyecto `investoros-agents`
- [ ] Jorge: generar refresh token con OAuth Playground (scope calendar.events)
- [ ] Jorge: pasar el refresh token a Cowork o CC por canal seguro (nunca en texto plano en el chat)
- [ ] CC: crear `agents/cal/cal.mjs` siguiendo el patrón de `nova.mjs`
- [ ] CC: agregar `cal` a `AGENT_MAP` en `router.mjs`
- [ ] CC: agregar cron `*/15 * * * *` para `cal`
- [ ] CC: test en un lead de prueba antes de dejarlo corriendo solo
- [ ] Cowork: subir `geo_agent_v4.php` y `geo_claude_v3.php` a Hostinger (ya escritos, pendiente deploy)

---
*Relacionado: `HANDOFF_AGENTS_GEO_PATCH.md`, `HANDOFF_ATLAS_PLAYBOOKS.md` (handoffs anteriores, sin relación directa)*
