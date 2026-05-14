# Geo Carpentry — Guía de Modificaciones en Hostinger

**Última actualización:** 2026-05-14 (post-reorg multi-repo)
**Fuente:** consolidación de `budget/MEMORIA.md` + workflows `setup-wordpress.yml` / `setup-geocarpentry.yml` / `deploy.yml` + screenshot Hostinger panel del Jefe.

## 📡 Acceso al servidor

| Item | Valor |
|---|---|
| **Plataforma** | Hostinger shared hosting (LiteSpeed/nginx) |
| **IP SSH** | `156.67.74.243` |
| **Puerto SSH** | `65002` |
| **Usuario SSH** | `u433637438` |
| **Comando manual** | `ssh -p 65002 u433637438@156.67.74.243` |
| **SSH key autorizada** | `geobudgetpro` (creada 2026-04-01, formato RSA 4096 PEM) |
| **Password SSH** | Cambiable desde hPanel → SSH Access → Change |
| **Panel** | https://hpanel.hostinger.com (login con cuenta del Jefe) |

## 🗂️ Paths importantes en el servidor

```
$HOME/                                              # = /home/u433637438
├── domains/
│   ├── geocarpentry.com/
│   │   └── public_html/                            # ← WP Geo Carpentry vive aquí
│   │       ├── wp-content/themes/
│   │       │   ├── astra/                          # tema parent
│   │       │   └── geo-carpentry-child/            # child theme con branding
│   │       ├── wp-content/uploads/                 # media library
│   │       ├── wp-config.php
│   │       └── ...
│   └── pinnaclegroupwi.com/
│       └── public_html/
│           └── GeoBudget/                          # ← GeoBudget Pro vive aquí
│               ├── index.html (Budget Builder)
│               ├── takeoff.html
│               ├── logo.png
│               └── api/
│                   ├── analyze.php
│                   ├── config.php                  # GENERADO en cada deploy
│                   ├── pdf-convert.php
│                   └── test.php
└── wp-cli.phar                                     # WP-CLI compartido para todos los WP del Jefe
```

## 🔐 Secrets de GitHub Actions

Estos secrets viven en el repo `geocarp24/geo-carpentry` y los workflows los inyectan al SSH:

| Secret | Status | Valor (sólo lectura del Jefe) |
|---|---|---|
| `HOST` | ✅ Set | `156.67.74.243` |
| `SSH_USERNAME` | ✅ Set | `u433637438` |
| `SSH_PORT` | ✅ Set | `65002` |
| `SSH_PRIVATE_KEY` | ❌ **FALTA** | Private key RSA 4096 PEM matching `geobudgetpro` |
| `SSH_PASSWORD` | ❌ **FALTA** | Password actual del SSH (cambiable en hPanel) |
| `ANTHROPIC_KEY` | ❌ **FALTA** | Claude API key para GeoBudget `api/analyze.php` |
| `APP_TOKEN` | ❌ **FALTA** | Token de login del Budget Builder (cualquier string seguro) |
| `DB_NAME` | ❌ **FALTA** | Nombre de DB MySQL (default Hostinger genera uno) |
| `DB_USER` | ❌ **FALTA** | Usuario MySQL |
| `DB_PASS` | ❌ **FALTA** | Password MySQL |

**Cómo setearlos rápido (5 min):**
```bash
# Por cada secret:
printf '%s' 'VALOR_AQUI' | gh secret set NOMBRE_SECRET --repo geocarp24/geo-carpentry
```

O via GitHub UI: Settings → Secrets and variables → Actions → New repository secret.

## 🚀 Workflows disponibles

### `budget/.github/workflows/setup-wordpress.yml`
**Trigger:** Manual (`workflow_dispatch`).
**Hace:** Setup inicial de WordPress (blogname, timezone, permalinks, 5 páginas base, menu).
**Cuándo usar:** Solo la PRIMERA vez después de instalar WP fresh.

### `budget/.github/workflows/setup-geocarpentry.yml`
**Trigger:** Manual (`workflow_dispatch`).
**Hace:**
- Crea child theme `geo-carpentry-child` con 570+ líneas de CSS branding
- Genera Home, Services, About, Portfolio, Contact con HTML inline custom
- Activa el child theme
- Reconfigura menu

**⚠️ Discrepancia detectada:** los colores HARDCODED en este workflow son `#0d2137` (Navy viejo) + `#c85a14` (Orange viejo). El branding aprobado de `GEOCARPENTRY_MEMORIA` es `#1B2A4A` (Navy nuevo) + `#FF6B00` (Orange nuevo). **Actualizar el workflow antes de re-ejecutar** para no quemar el branding viejo.

### `budget/.github/workflows/deploy.yml`
**Trigger:** Automático en push a `main`.
**Hace:** Deploya GeoBudget Pro al server vía rsync.
**Path destino:** `~/domains/pinnaclegroupwi.com/public_html/GeoBudget/`
**Genera:** `api/config.php` con secrets antes del rsync.

### `budget/.github/workflows/setup-core.yml`
**Por revisar — no lo he leído aún.**

## 🛠️ Cómo hacer modificaciones — Patterns probados

### Pattern 1: Modificar pages via WP-CLI (programático)
```yaml
- uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${{ secrets.HOST }}
    username: ${{ secrets.SSH_USERNAME }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    password: ${{ secrets.SSH_PASSWORD }}
    port: 65002
    script: |
      WP="php $HOME/wp-cli.phar --path=$HOME/domains/geocarpentry.com/public_html --allow-root"

      # Actualizar contenido de una página
      $WP post update [page_id] --post_content="$(cat /tmp/new_content.html)"

      # Crear nueva página
      $WP post create --post_type=page --post_title="Título" --post_status=publish --post_name="slug" --post_content="HTML"

      # Activar/desactivar plugin
      $WP plugin activate plugin-slug
      $WP plugin deactivate plugin-slug

      # Cambiar opción de WP
      $WP option update opcion_key "valor"
```

### Pattern 2: Subir archivos al theme (rsync)
```yaml
- uses: webfactory/ssh-agent@v0.9.0
  with:
    ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
- run: |
    ssh-keyscan -p 65002 ${{ secrets.HOST }} >> ~/.ssh/known_hosts
    rsync -avzr --delete \
      -e "ssh -o ConnectTimeout=15 -p 65002" \
      --exclude='.git' \
      ./local-path/ ${{ secrets.SSH_USERNAME }}@${{ secrets.HOST }}:~/domains/geocarpentry.com/public_html/wp-content/themes/geo-carpentry-child/
```

### Pattern 3: Workaround para SSH timeout intermitente
Si `appleboy/ssh-action` falla con timeout o "no key found":
- **Causa común:** SSH key en formato OpenSSH en lugar de PEM. Regenerar:
  ```bash
  ssh-keygen -t rsa -b 4096 -m PEM -f geobudgetpro -N ""
  ```
  Subir el `.pub` a Hostinger SSH keys panel + setear el `.priv` en GitHub Secret `SSH_PRIVATE_KEY`.
- **Workaround alternativo:** Subir archivos via hPanel File Manager (manual).
- **Retry pattern:** Loop 4 intentos × 4s gap entre intentos (ver `deploy.yml`).

## ✅ Checklist pre-modificación

Antes de correr cualquier workflow que modifique WP, verificar:

1. ✅ Todos los secrets están seteados (ver tabla arriba)
2. ✅ `setup-geocarpentry.yml` tiene los colores nuevos (#1B2A4A + #FF6B00), NO los viejos
3. ✅ Backup pre-cambio: `wp db export` en el servidor antes de mass-page-creation
4. ✅ Staging URL (`blueviolet-gerbil-900105.hostingersite.com`) responde HTTP 200
5. ✅ Si modificación visual: validar mobile (regla 1b mobile-first) antes de cutover
6. ✅ DNS Cloudflare: solo después de validar staging — no antes

## 🚨 Cosas que NO hacer

- ❌ Push a `main` sin validar staging primero (auto-deploy puede romper producción)
- ❌ Modificar colores hardcoded en workflows sin actualizar TODOS los workflows que los usan
- ❌ Usar SSH key en formato OpenSSH (Hostinger fall silenciosamente — debe ser PEM)
- ❌ Subir archivos con `--delete` en rsync sin verificar manifest primero (puede borrar archivos críticos del WP)
- ❌ Cargar PDFs grandes a `api/pdf-convert.php` (timeout 30s del shared hosting)
- ❌ Tocar el wp-config.php sin backup (rompe el sitio entero)

## 📞 Soporte directo

Si el deploy falla de manera inexplicable:
1. Verificar GitHub Actions log (look for "Connecting to..." step para confirmar SSH conectó)
2. Verificar `journalctl` no es aplicable (es shared hosting, no VPS — no hay systemd logs)
3. SSH manual desde tu máquina y `tail -f domains/geocarpentry.com/public_html/wp-content/debug.log` (si está habilitado)
4. Worst case: subir archivos manualmente via hPanel File Manager + restore backup

## 🔗 Referencias

- Memoria del proyecto GeoBudget: `budget/MEMORIA.md`
- Estrategia B2C transition: `Memory Claude/Geo_Carpentry_Memory_Strategy.md`
- Brand kit final: `docs/curated/GEOCARPENTRY_MEMORIA.md`
- Workflows: `budget/.github/workflows/*.yml`
