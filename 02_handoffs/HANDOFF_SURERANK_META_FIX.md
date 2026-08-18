# ~~HANDOFF — Fix SureRank Meta Keys en escriba.mjs~~
> ✅ **RESUELTO — Verificado: 2026-08-16**

## Estado real
`escriba.mjs:281-283` ya usa `_surerank_focus_keyword` y `_surerank_description`. Cero ocurrencias de `yoast` en todo `/opt/alex-bot`. El fix ya estaba aplicado antes de este handoff.

Verificación: `grep -n "yoast" /opt/alex-bot/agents/escriba/escriba.mjs` → sin resultados.

---
> Cowork → Claude Code | 2026-08-08 (ORIGINAL — ARCHIVADO)
> Bug: Eli (SEO Writer) escribe meta tags con keys de Yoast SEO, pero el sitio usa SureRank. (YA RESUELTO)

---

## El Problema (explicado simple)

`escriba.mjs` publica artículos en WordPress con estas meta keys:
- `_yoast_wpseo_focuskw` ← key de plugin Yoast SEO
- `_yoast_wpseo_metadesc` ← key de plugin Yoast SEO

Pero geocarpentry.com usa el plugin **SureRank**, que usa keys distintas:
- `_surerank_focus_keyword` ← correcta para SureRank
- `_surerank_description` ← correcta para SureRank

Cambiar estas 2 keys = Google puede leer los meta datos de SEO correctamente.

---

## Archivo a modificar

```
/opt/alex-bot/agents/escriba/escriba.mjs
```

---

## Búsqueda rápida (confirma que las keys existen antes de editar)

```bash
grep -n "yoast\|_yoast\|focuskw\|metadesc\|surerank" /opt/alex-bot/agents/escriba/escriba.mjs
```

---

## El fix — reemplazar las 2 keys

### Buscar y reemplazar con sed (más seguro):

```bash
# Backup primero
cp /opt/alex-bot/agents/escriba/escriba.mjs /opt/alex-bot/agents/escriba/escriba.mjs.bak

# Reemplazar las keys
sed -i 's/_yoast_wpseo_focuskw/_surerank_focus_keyword/g' /opt/alex-bot/agents/escriba/escriba.mjs
sed -i 's/_yoast_wpseo_metadesc/_surerank_description/g' /opt/alex-bot/agents/escriba/escriba.mjs
```

### Verificar que el reemplazo quedó correcto:

```bash
grep -n "surerank\|yoast" /opt/alex-bot/agents/escriba/escriba.mjs
```

Debe mostrar SOLO líneas con `surerank`. Si todavía aparece `yoast`, hay más instancias — repetir sed.

---

## También verificar en el objeto de meta fields

El código probablemente tiene algo como:

```javascript
// ANTES (incorrecto):
meta_input: {
  '_yoast_wpseo_focuskw': record.target_keyword,
  '_yoast_wpseo_metadesc': record.meta_description,
  '_geo_schema_jsonld': record.schema_jsonld,
}

// DESPUÉS (correcto):
meta_input: {
  '_surerank_focus_keyword': record.target_keyword,
  '_surerank_description': record.meta_description,
  '_geo_schema_jsonld': record.schema_jsonld,  // ← esta se queda igual
}
```

`_geo_schema_jsonld` NO cambia — esa es una meta custom de Geo Carpentry, no de ningún plugin SEO.

---

## Test del fix

```bash
# Correr escriba manualmente para verificar que publica correctamente:
cd /opt/alex-bot && node agents/escriba/escriba.mjs 2>&1 | tail -30
```

Resultado esperado:
- Publica a WordPress sin errores
- En WP Admin → post → SureRank block muestra el focus keyword y meta description

### Verificar en WordPress vía WP-CLI (en Hostinger SSH):

```bash
ssh u433637438@srv1067.hstgr.io
cd /home/u433637438/domains/geocarpentry.com/public_html
wp post meta get <POST_ID> _surerank_focus_keyword
wp post meta get <POST_ID> _surerank_description
```

Si retorna el keyword y meta desc, el fix funciona.

---

## Rollback si algo falla

```bash
cp /opt/alex-bot/agents/escriba/escriba.mjs.bak /opt/alex-bot/agents/escriba/escriba.mjs
```

---

## Estado del cron de escriba

El cron de escriba ya está ACTIVO (no silenciado):
```
# Martes y Viernes 10am UTC
0 10 * * 2,5 cd /opt/alex-bot && node agents/escriba/escriba.mjs >> /var/log/alex-bot/escriba.log 2>&1
```

No tocar este cron — solo modificar el archivo .mjs.
