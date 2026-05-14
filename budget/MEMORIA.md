# MEMORIA DEL PROYECTO — GeoBudget Pro
**Fecha:** 4 de abril, 2026  
**Propietario:** Jorge Cruz — Geo Carpentry LLC, Wisconsin  
**Sitio web:** pinnaclegroupwi.com/GeoBudget  
**Repositorio:** github.com/geocarp24/geo-budget-pro  

---

## 1. QUÉ ES ESTE PROYECTO

GeoBudget Pro es una herramienta web de estimación de costos para construcción. Tiene dos módulos principales:

### Módulo 1: Budget Builder (`index.html`)
**ESTADO: FUNCIONAL**  
- Login con token (APP_TOKEN definido en config.php)
- Dashboard con grid de presupuestos
- Editor de presupuestos con categorías y líneas de items
- Integración con Claude API (modelo opus-4-6) para análisis de planos vía `api/analyze.php`
- Exportación a PDF usando jsPDF
- Interfaz profesional con colores Geo Carpentry (Azul #1B3A6B + Naranja #FF6B00)

### Módulo 2: Plan Takeoff Tool (`takeoff.html`)
**ESTADO: PARCIALMENTE FUNCIONAL — EL PDF NO SE RENDERIZA**  
- Herramienta de medición sobre planos de construcción (tipo PlanSwift)
- Abrir imágenes JPG/PNG: **FUNCIONA**
- Abrir archivos PDF: **NO FUNCIONA** (problema principal a resolver)
- Calibrar escala: FUNCIONA (click dos puntos + ingresar distancia real en pies)
- Medir Linear Feet (LF): FUNCIONA
- Medir Area en Square Feet (SF): FUNCIONA
- Contar elementos (EA): FUNCIONA
- Colocar etiquetas: FUNCIONA
- Exportar mediciones a .txt: FUNCIONA

---

## 2. ARQUITECTURA TÉCNICA

### Stack
- **Frontend:** HTML5 + CSS3 + JavaScript vanilla (sin frameworks)
- **Backend:** PHP vanilla (sin Composer, sin frameworks)
- **Base de datos:** MySQL (configurada pero NO implementada aún)
- **Hosting:** Hostinger shared hosting (LiteSpeed/nginx)
- **Deploy:** GitHub Actions → SSH + rsync al servidor
- **CDN:** jsPDF 2.5.1, PDF.js 2.16.105

### Estructura de archivos
```
geo-budget-pro/
├── .github/workflows/deploy.yml   # CI/CD pipeline
├── .gitignore                     # Ignora api/config.php
├── .htaccess                      # Desactiva WordPress routing + no-cache
├── api/
│   ├── analyze.php                # Endpoint para Claude AI analysis
│   ├── config.php                 # [GENERADO EN DEPLOY] Secrets: API keys, DB creds
│   ├── pdf-convert.php            # Conversión PDF→imagen server-side (NO SE USA ACTUALMENTE)
│   └── test.php                   # Diagnóstico de Imagick
├── index.html                     # Budget Builder (837 líneas)
├── takeoff.html                   # Plan Takeoff Tool (679 líneas)
└── logo.png                       # Logo Geo Carpentry
```

### Deploy (`.github/workflows/deploy.yml`)
- **Trigger:** Push a `main`
- **Proceso:** checkout → genera config.php desde secrets → SSH a Hostinger (puerto 65002) → rsync
- **Ruta en servidor:** `~/domains/pinnaclegroupwi.com/public_html/GeoBudget/`
- **Retry logic:** 4 intentos con 4 segundos entre cada uno (SSH y rsync)
- **Secrets necesarios:** `SSH_PRIVATE_KEY`, `HOST`, `SSH_USERNAME`, `ANTHROPIC_KEY`, `APP_TOKEN`, `DB_NAME`, `DB_USER`, `DB_PASS`
- **Formato de SSH key:** RSA 4096 en formato PEM (NO OpenSSH)
- **PROBLEMA:** SSH timeout intermitente con Hostinger. Workaround: subir archivos manualmente vía hPanel File Manager

---

## 3. EL PROBLEMA PRINCIPAL: PDF NO SE RENDERIZA EN TAKEOFF TOOL

### Contexto
El Plan Takeoff Tool necesita abrir planos de construcción en PDF (archivos típicos de 6+ páginas, formatos 24"x36" o 30"x42", a veces con gráficos vectoriales complejos). Las imágenes JPG/PNG se abren sin problema. Los PDFs **no se muestran**.

### Lo que se ha intentado (TODO FALLÓ):

#### Intento 1: PDF.js v3.11.174 — Client-side
- **Enfoque:** Cargar PDF.js desde CDN, renderizar a temp canvas, convertir con `toDataURL()`, pasar a `loadImage()`
- **Resultado:** Canvas en blanco. Sin errores en consola reportados.
- **Posible causa:** `toDataURL()` puede fallar silenciosamente en canvases muy grandes (planos de construcción a 1.5x escala pueden ser 3000+ pixels)

#### Intento 2: PDF.js v2.16.105 — Client-side  
- **Enfoque:** Versión más vieja para compatibilidad con Safari
- **Resultado:** Mismo resultado, canvas en blanco
- **Posible causa:** Misma limitación de `toDataURL()`

#### Intento 3: PDF.js render directo al planCanvas
- **Enfoque:** Eliminar paso intermedio de `toDataURL()`, renderizar directamente al planCanvas
- **Resultado:** "Sigue sin funcionar" según el usuario
- **Posible causa:** No se verificó si la librería cargó correctamente, posible problema de worker con CORS en Safari, o el render al canvas sucede pero algo lo sobreescribe

#### Intento 4: PHP Imagick — Server-side (todas las páginas)
- **Enfoque:** `api/pdf-convert.php` con `readImage()` + loop por todas las páginas
- **Resultado:** **504 Gateway Time-out** — Hostinger tiene ~30s de timeout
- **Causa confirmada:** Cargar 6 páginas de un PDF de construcción pesado excede el timeout del servidor

#### Intento 5: PHP Imagick — Server-side (1 página, flattenImages)
- **Enfoque:** Solo cargar página 1 con `readImage($file.'[0]')`, usar `flattenImages()`
- **Resultado:** No timeout, pero imagen en blanco
- **Causa:** `flattenImages()` / `mergeImageLayers()` devuelve un NUEVO objeto Imagick, y el código escribía desde el objeto original (vacío después del merge)

#### Intento 6: PHP Imagick — Server-side (1 página, JPEG con white canvas composite)
- **Enfoque:** Crear canvas blanco con `newImage()`, composite el PDF encima, guardar como JPEG
- **Resultado:** "Sigue en blanco" según el usuario
- **Posible causa:** No se verificó si el problema es del lado del render en PHP o del lado del display en el navegador. El archivo JPEG podría haberse generado correctamente pero no cargado en el browser.

#### Intento 7: PDF.js v2.16 render directo (último intento)
- **Enfoque:** Worker configurado en `<head>`, render directo a `planCtx`, `planImg` como objeto simple
- **Resultado:** "No funciona" según el usuario. No sabemos si dio error o canvas en blanco.

### Lo que SÍ funciona:
- **`api/test.php`** confirmó que Imagick puede convertir un PDF simple a PNG en el servidor
- **Imágenes JPG/PNG** se abren y muestran correctamente en el Takeoff Tool
- **Todas las herramientas de medición** funcionan una vez que hay una imagen cargada

### Lo que NO se ha verificado aún:
1. Si PDF.js está cargando correctamente (verificar `console.log(typeof pdfjsLib)`)
2. Si el worker de PDF.js está cargando o fallando silenciosamente
3. Si hay errores de JavaScript en la consola del navegador al cargar un PDF
4. Si el problema es de Safari específicamente (el usuario usa Mac con Safari)
5. Si un PDF de construcción real se convierte correctamente a JPEG en el servidor (solo se probó con un PDF sintético de 1 página en test.php)
6. El tamaño real del JPEG generado por Imagick (se agregó `debug` info al response pero no se verificó)
7. Si usar `file.arrayBuffer()` en vez de `FileReader` funciona mejor
8. Si deshabilitar el web worker de PDF.js resuelve problemas de CORS en Safari
9. Si la respuesta del servidor (pdf-convert.php JPEG approach) devuelve JSON válido con la ruta correcta del archivo

### Recomendaciones para resolver:

**OPCIÓN A — Client-side con PDF.js (RECOMENDADA)**
1. Verificar que `pdfjsLib` existe en el browser (agregar `console.log`)
2. Deshabilitar el web worker para evitar CORS: usar `pdfjsLib.GlobalWorkerOptions.workerSrc = ''` o crear un blob worker desde mismo origen
3. Renderizar directo a planCanvas (NO usar toDataURL ni Image intermedio)
4. Si Safari tiene problemas, probar en Chrome primero para aislar
5. Usar escala más baja (1.0 en vez de 1.5) para canvases más pequeños
6. Agregar `console.log` en cada paso para debugging

**OPCIÓN B — Server-side con Imagick**
1. Subir un PDF de construcción real como archivo de test al repositorio
2. Crear un test endpoint que convierta ese PDF y devuelva la URL de la imagen
3. Verificar manualmente que la imagen generada se puede abrir en el browser
4. Si la imagen se genera correctamente, el problema es en cómo takeoff.html la carga

**OPCIÓN C — Enfoque híbrido (fallback)**
1. Intentar PDF.js primero
2. Si falla después de timeout, caer al server-side
3. Si ambos fallan, mostrar mensaje pidiendo convertir el PDF a imagen manualmente

---

## 4. HISTORIAL DE PROBLEMAS RESUELTOS

### Deploy SSH
- **SSH key "no key found":** La key estaba en formato OpenSSH. **Fix:** Generar con `ssh-keygen -t rsa -b 4096 -m PEM`
- **SSH "error in libcrypto":** Mismo problema de formato. **Fix:** PEM format
- **rsync "mkdir failed":** El directorio GeoBudget no existía. **Fix:** Agregar paso `mkdir -p`
- **Deploy path incorrecto:** Archivos iban a `~/public_html/` pero el sitio sirve desde `~/domains/pinnaclegroupwi.com/public_html/`. **Fix:** Actualizar path en deploy.yml
- **SSH timeout intermitente:** Hostinger a veces no responde. **Fix:** Retry loops. **Workaround:** Subir via hPanel File Manager

### Takeoff Tool UI
- **Botón Takeoff no visible:** Usaba `<a>` tag que no se mostraba en flexbox nav. **Fix:** Cambiar a `<button>`
- **Canvas layout roto:** Overlay canvas no se alineaba con planCanvas. **Fix:** planCanvas como `display:block`, overlay `position:absolute`

### PDF Errors
- **"The string did not match the expected pattern":** Error de Safari cuando `response.json()` recibe non-JSON. **Fix:** Usar `response.text()` + manual `JSON.parse` con catch
- **`require_once config.php`:** pdf-convert.php importaba config.php que no existe si se sube manualmente. **Fix:** Eliminar el require

---

## 5. FUNCIONALIDADES PENDIENTES (FUTURAS)

1. **Login con MySQL** — Actualmente usa token hardcodeado. Implementar autenticación real con la base de datos configurada en config.php
2. **Guardar presupuestos en MySQL** — Actualmente se guardan en localStorage. Migrar a DB
3. **Integración Takeoff → Budget** — Que las mediciones del takeoff se importen automáticamente como líneas de items en un presupuesto
4. **Autoincremento de quotes** — Numeración automática de cotizaciones (Quote #001, #002, etc.)
5. **Navegación de páginas en PDF** — Botones prev/next para ver diferentes páginas del plano
6. **Zoom y pan en el plano** — Para navegar en planos grandes
7. **Guardar mediciones** — Persistir las mediciones del takeoff (actualmente se pierden al recargar)

---

## 6. DATOS DEL SERVIDOR

- **Hosting:** Hostinger Business (shared)
- **Dominio:** pinnaclegroupwi.com
- **Ruta web:** `~/domains/pinnaclegroupwi.com/public_html/GeoBudget/`
- **SSH:** Puerto 65002
- **PHP:** Imagick extension ACTIVADA y confirmada funcional
- **Shell tools:** gs (Ghostscript), convert (ImageMagick), pdftoppm — **NO DISPONIBLES** en shared hosting
- **Límite de ejecución PHP:** ~30 segundos (timeout del proxy nginx/LiteSpeed)
- **CMS:** WordPress instalado en el dominio raíz (por eso el .htaccess desactiva mod_rewrite)

---

## 7. INSTRUCCIONES PARA EL NUEVO AGENTE

### Orden no negociable del usuario:
> "Analiza primero todos y cada uno de los problemas. Después soluciona todos los problemas de una vez. No desperdicies recursos ni créditos. Ejecuta solamente cuando tengas una solución concreta y estés 100% seguro."

### Prioridad #1: Hacer que el PDF se abra en el Takeoff Tool
- Este es el ÚNICO blocker actual. Todo lo demás funciona.
- El usuario trabaja con planos de construcción PDF de múltiples páginas, formatos grandes (24"x36"), con gráficos vectoriales y texto.
- El usuario usa **Safari en Mac**.
- Programas como **PlanSwift**, **Bluebeam**, **ConstructConnect** hacen exactamente esto — abrir PDFs y medir sobre ellos. Se necesita replicar esta funcionalidad básica.

### Para probar:
1. El sitio está live en: `pinnaclegroupwi.com/GeoBudget/takeoff.html`
2. Click "Open Plan" → seleccionar un PDF de construcción
3. Debería aparecer la primera página del plano en el canvas
4. Si no aparece, revisar la consola del navegador para ver errores

### Para deployar:
1. Push a `main` activa GitHub Actions deploy
2. Si el deploy falla por SSH timeout, el usuario sube manualmente via hPanel File Manager
3. Los archivos deben ir a: `domains/pinnaclegroupwi.com/public_html/GeoBudget/`

### El usuario:
- Jorge Cruz es dueño de Geo Carpentry LLC, NO es desarrollador
- Habla español
- Está frustrado por el tiempo invertido sin resultados en el tema del PDF
- Puede subir archivos al servidor manualmente via hPanel File Manager
- Puede verificar si el deploy pasó (verde/rojo en GitHub Actions)
- NO puede abrir la consola del navegador para debugging (no es técnico)
