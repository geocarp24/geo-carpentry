# geo-webhook

El servicio que recibe los disparos del CRM y lanza los agentes en el VPS.

**Esto es una copia del código, no el deploy.** Lo que corre de verdad vive en
`/opt/geo-webhook/` en el VPS (`187.77.215.146`), y ese directorio **no es un repo git**.
Editar acá no cambia nada en el servidor. Ver "Cómo se despliega" abajo.

## El camino completo

```
budget/CRM/index.html   Jorge aprieta "📩 Solicitar Reseña"
        ↓
budget/CRM/api.php      valida DNC, firma HMAC-SHA256, POST a :3003/trigger
        ↓
index.mjs               verifica la firma contra WEBHOOK_SECRET
        ↓
router.mjs              busca el agente en AGENT_MAP y lo lanza como proceso aparte
        ↓
/opt/alex-bot/agents/<agente>/<agente>.mjs
```

Responde al instante con un `jobId` y se olvida: los agentes tardan de 2 a 20 minutos y
reportan por su cuenta a Airtable y Telegram.

## Archivos

| | |
|---|---|
| `index.mjs` | servidor Express, valida la firma, `/health` y `/trigger` |
| `router.mjs` | `AGENT_MAP` (nombre → script) y el spawn |
| `geo-webhook.service` | unidad de systemd, copia de `/etc/systemd/system/` |
| `.env.example` | solo los nombres de variable; los valores viven en el `.env` del VPS |

## Agregar un agente

En `router.mjs`, una línea en `AGENT_MAP`:

```js
mi_agente: "agents/mi_agente/mi_agente.mjs",
```

Si el agente trabaja sobre un registro puntual en vez de un lote — como `review_request`,
que recibe un `lead_id` — hay que sumarlo también a `RECORD_SCOPED` y validar el id en
`index.mjs` antes de responder 200. El CRM toma cualquier 200 como "enviado", y el spawn
es fire-and-forget: sin esa validación, un id malo falla en silencio y el usuario ve un
tilde verde.

## Cómo se despliega

A mano, con `scp`. No hay pull ni CI:

```bash
scp vps/geo-webhook/index.mjs vps/geo-webhook/router.mjs root@187.77.215.146:/opt/geo-webhook/
```

Después, en el servidor:

```bash
node --check /opt/geo-webhook/router.mjs && systemctl restart geo-webhook && systemctl status geo-webhook --no-pager
```

Hacer copia con fecha antes de pisar nada. En `/opt/geo-webhook/` hay varios `.bak.<fecha>`
de ediciones anteriores.

## Verificar que está vivo

```bash
curl -s http://187.77.215.146:3003/health
```

Los errores de ruteo salen en el journal, no en la respuesta HTTP:

```bash
journalctl -u geo-webhook -n 50 --no-pager
```

## Respaldo

`/opt/geo-backup/backup.sh` copia este directorio a diario al repo privado `geo-backup`,
bajo `02_apps/geo-webhook/`. Nunca copia valores del `.env`, solo los nombres.
