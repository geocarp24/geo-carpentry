# Geo Carpentry — Cutover Status (2026-05-15 03:45 UTC)

## TL;DR

- ✅ DNS de `geocarpentry.com` propagó (resuelve a IPs Hostinger + Cloudflare en 8.8.8.8 / 1.1.1.1 / 9.9.9.9).
- ⚠️ **`https://geocarpentry.com` devuelve HTTP 409** — Cloudflare no puede hablar HTTPS con el origen Hostinger porque el SSL cert para `geocarpentry.com` todavía no está provisionado en Hostinger.
- ✅ El sitio en sí está sano: `http://156.67.74.243/` con header `Host: geocarpentry.com` devuelve **200 OK**, WP está bien configurado (`siteurl=http://geocarpentry.com`).
- ✅ Staging `https://blueviolet-gerbil-900105.hostingersite.com` sigue 200.
- ✅ Lead capture pipeline funcional end-to-end (mu-plugin + Airtable Contacts/Leads).
- ✅ Form "Quote Request" SureForms creada (ID 2340).

## Bloqueador único — fixes posibles (cualquiera de los 2)

### Opción A — Cambiar Cloudflare a "Flexible SSL" (1 minuto, funciona ya)
1. Cloudflare dashboard → `geocarpentry.com` → **SSL/TLS** → **Overview**
2. Encryption mode: cambiar de "Full" / "Full (strict)" a **"Flexible"**
3. Esperar ~60 segundos
4. Verificar: `https://geocarpentry.com` → 200

⚠️ Trade-off: Cloudflare ↔ origen va en HTTP plano (cliente ↔ Cloudflare sigue siendo HTTPS). Aceptable como solución temporal hasta que Hostinger emita el cert.

### Opción B — Forzar emisión SSL en Hostinger (10 min)
1. hPanel → `geocarpentry.com` → **SSL** → "Install SSL"
2. Esperar emisión Let's Encrypt (~5 min)
3. Mantener Cloudflare en "Full" / "Full (strict)"
4. Verificar: `https://geocarpentry.com` → 200

Recomendado: hacer **Opción A** ya para destrabar, después **Opción B** para subir a Full SSL.

## DNS anomalía secundaria

`nslookup geocarpentry.com 8.8.8.8` devuelve **2 IPs**: `156.67.74.243` (Hostinger directo) + `172.66.0.42` (Cloudflare proxy). Suena a que hay registros A duplicados — uno directo y uno proxied. Idealmente:
- En Cloudflare DNS, dejar **SOLO** un A record proxied (nube naranja) apuntando a `156.67.74.243`.
- Si hay un A record adicional (DNS-only, nube gris), borrarlo.

Esto evita rutas mixtas donde algunos usuarios pegan al origen directo y otros pasan por Cloudflare.

## Trabajo completado este turno (sin Jefe)

| Tarea | Estado |
|---|---|
| Audit WP estructura (18 pages + 10 posts) | ✅ done |
| Bug encontrado: `custom-carpentry` slug NO existe → real slug es `finish-carpentry` | ✅ tenant config actualizado |
| Plugins activos validados (LiteSpeed, SureForms, SureRank, SureMails, Jetpack) | ✅ |
| Constantes Airtable inyectadas en `wp-config.php` (backup `wp-config.php.bak.geo`) | ✅ |
| `mu-plugin` `geo-airtable-lead-capture.php` deployado a `/wp-content/mu-plugins/` | ✅ |
| Pipeline end-to-end probado: form submit → Airtable Contact + Lead | ✅ test record creado y borrado |
| SureForm "Quote Request" creada (ID 2340) con 7 campos: name/phone/email/service/city/budget/description | ✅ |
| GitHub Secrets seteados: `ALEX_GOOGLE_EMAIL`, `ALEX_GOOGLE_PASSWORD`, `ALEX_MAILBOX_EMAIL`, `ALEX_MAILBOX_PASSWORD` | ✅ |

## Pendiente del Jefe

| Acción | Tiempo | Cuándo |
|---|---|---|
| Cloudflare → SSL mode Flexible (Opción A arriba) | 1 min | YA — destraba el sitio |
| Hostinger → emitir SSL cert para `geocarpentry.com` | 5-10 min | hoy |
| Aceptar GMB Manager invite cuando llegue (yo lo mando) | 2 min | tras tener acceso GMB |
| Pasar: `ANTHROPIC_KEY`, `APP_TOKEN`, `DB_NAME/USER/PASS` | 10 min | cuando puedas |

## Pendiente de ALEX (sigo trabajando)

- Insertar el shortcode `[sureforms id="2340"]` en la página `/contact/` y/o homepage
- Verificar el form en frontend (cuando el SSL se arregle)
- Setup Search Console + Bing Webmaster (necesito access Google)
- Primer SEO baseline con Posicionador (necesito ANTHROPIC_KEY)
- Aceptar GMB Manager invite (necesito access Google)
- Configurar `secrets.ALEX_GOOGLE_*` para integraciones cron de GBP

## Archivos clave creados/modificados

- `automation/wordpress/mu-plugins/geo-airtable-lead-capture.php` — capturador de leads
- `automation/SEO_PLAN_CONSOLIDADO.md` — plan vigente
- `automation/airtable/populate_base.py` — script idempotente de 7 tablas
- `InvestorOS/agents/tenants/geo-carpentry.json` — tenant config (slug `finish-carpentry` corregido)

## Cómo verificar tú mismo (en 30 segundos)

```powershell
# Origen sano (debería responder 200 OK)
curl.exe -H "Host: geocarpentry.com" -I http://156.67.74.243/

# Staging vivo
curl.exe -I https://blueviolet-gerbil-900105.hostingersite.com/

# Cloudflare problema (devuelve 409 hasta arreglo SSL)
curl.exe -I https://geocarpentry.com/
```
