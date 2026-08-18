# Meta App Review — InvestorOS
> Preparado por Cowork para Jorge Cruz / Pinnacle Holdings Group LLC
> Fecha: Mayo 2026 · App: InvestorOS · BM: Pinnacle Holdings

---

## PASO 1 — Crear la App (Jorge hace esto en developers.facebook.com)

1. Ve a https://developers.facebook.com/apps/
2. Click "Create App"
3. Use case: **"Other"** → luego selecciona **"Business"**
4. App name: `InvestorOS`
5. App contact email: `admin@geocarpentry.com` (o crea ops@investoros.tech primero)
6. Business account: Selecciona **Pinnacle Holdings Group** (tu Business Manager)
7. Click "Create App"

---

## PASO 2 — Agregar productos a la App

En el App Dashboard, Add Products:
1. **Facebook Login for Business** → Configure
2. **Instagram Graph API** → Configure
3. **Pages API** → ya incluido con Facebook Login for Business

---

## PASO 3 — Permisos a solicitar (App Review)

Solicitar en este orden (de menor a mayor fricción):

### Permisos básicos (NO requieren review — disponibles en Development mode):
- `pages_show_list` — lista las páginas del usuario
- `pages_read_engagement` — leer métricas básicas
- `instagram_basic` — info básica de cuenta IG

### Permisos que SÍ requieren App Review:

| Permiso | Para qué lo usamos | Nivel de dificultad |
|---|---|---|
| `pages_manage_posts` | Publicar contenido en páginas de clientes | Medio |
| `pages_read_user_content` | Leer posts y comentarios para analytics | Fácil |
| `instagram_content_publish` | Publicar en Instagram de clientes | Medio |
| `instagram_manage_insights` | Analytics de IG para agente Sage | Fácil |
| `pages_manage_engagement` | Responder comentarios (agente Marco) | Medio |

---

## PASO 4 — Use Case Descriptions (COPIAR EXACTO EN META)

### Para `pages_manage_posts`:

**How will you use this permission?**

> InvestorOS is a business management platform for contractors and service businesses. When a client connects their Facebook Business Page to InvestorOS, our platform generates AI-assisted content drafts (blog posts, project updates, seasonal promotions) and schedules them for publishing on their behalf. The client reviews and approves each post before it is published. We use the `pages_manage_posts` permission to publish approved content directly to the client's Business Page through our dashboard at investoros.tech. This eliminates the need for the business owner to manually copy-paste content, saving them significant time while maintaining their social media presence consistently.

### Para `instagram_content_publish`:

**How will you use this permission?**

> InvestorOS helps small contractors and service businesses maintain a consistent Instagram presence. Our AI agents generate relevant content (project photos with captions, before/after highlights, seasonal tips) tailored to the client's business. Using `instagram_content_publish`, our platform publishes client-approved content to their connected Instagram Professional account. The client retains full control — they review and approve each post in our dashboard before any content goes live. This permission allows us to eliminate the manual step of uploading content from our platform to Instagram manually.

### Para `instagram_manage_insights`:

**How will you use this permission?**

> InvestorOS includes an analytics agent (Sage) that monitors social media performance for our clients. We use `instagram_manage_insights` to read engagement metrics (reach, impressions, profile visits, website clicks) for our clients' Instagram accounts. This data is displayed in the client's InvestorOS dashboard to help them understand what content is performing best. We do not share this data with third parties and use it exclusively to provide analytics features within our platform.

### Para `pages_manage_engagement`:

**How will you use this permission?**

> InvestorOS includes a community management agent (Marco) that helps clients respond to comments on their Facebook Business Pages. When a client activates this feature, our AI suggests responses to comments and the client approves before posting. We use `pages_manage_engagement` to post approved comment responses on behalf of the client. This helps small business owners stay responsive to their audience without spending hours monitoring social media.

---

## PASO 5 — Screencast Video Requirements

Meta requiere un video mostrando cómo usas cada permiso. Instrucciones para grabar:

### Video para `pages_manage_posts` y `instagram_content_publish`:
**Duración:** 2-3 minutos
**Lo que debe mostrar:**
1. Usuario logueado en investoros.tech/[tenant]/dashboard
2. Navegar a sección "Social Media" o "Content Queue"
3. Mostrar un post draft generado por el agente Marco
4. Click en "Review" — se ve el contenido completo
5. Click en "Approve & Schedule" o "Publish Now"
6. Mostrar confirmación de publicación
7. Abrir Facebook/Instagram y mostrar el post publicado

**Narración sugerida:**
> "In this video, I'll demonstrate how InvestorOS uses the pages_manage_posts permission. As a client, I log into my InvestorOS dashboard where I can see content drafted by my AI agents. I review the post, make any edits, and click 'Publish.' The content is then posted directly to my Facebook Business Page. I am always in control — nothing is published without my approval."

### Herramienta para grabar: Loom (loom.com) — gratis, fácil, sube directo

---

## PASO 6 — Data Use Checkboxes (respuestas correctas)

En la sección "Data Use" del App Review:

- **Does your app use data obtained from Facebook to train AI/ML models?** → **NO**
- **Does your app use data to target advertising?** → **NO**
- **Does your app store user data beyond what's necessary?** → **NO**
- **Does your app share data with third parties?** → **YES** — Compartimos con Buffer (scheduling tool) únicamente para publicar contenido que el usuario ha aprobado.

---

## PASO 7 — URLs que Meta va a verificar

Deben estar live ANTES de someter el review:

| URL | Qué debe tener |
|---|---|
| https://investoros.tech/privacy | Privacy Policy completa (ya redactada ✅) |
| https://investoros.tech/terms | Terms of Service completos (ya redactados ✅) |
| https://investoros.tech | Landing page funcional con descripción del producto |

---

## PASO 8 — Business Verification (si no está verificado aún)

Si el Business Manager de Pinnacle no está verificado:
1. Ve a Business Settings → Security Center → Start Verification
2. Documentos necesarios: EIN letter o Articles of Incorporation de Pinnacle Holdings Group LLC
3. Tiempo: 2-5 días hábiles

Business Verification es REQUERIDO para los permisos de nivel avanzado.

---

## TIMELINE ESPERADO

| Paso | Tiempo estimado |
|---|---|
| Crear App + agregar productos | 30 minutos |
| Business Verification (si aplica) | 2-5 días |
| Grabar screencasts | 2-3 horas |
| Someter App Review | 1 hora |
| Meta review básico | 3-5 días hábiles |
| Meta review avanzado (si hay preguntas) | 2-4 semanas |
| **Total estimado** | **1-5 semanas** |

---

## MIENTRAS META REVISA — Buffer como puente

Mientras espera aprobación, usar Buffer Business:
1. Crear cuenta en buffer.com/business ($99/mo — cubre 10 social accounts)
2. Conectar las páginas de clientes a Buffer (OAuth normal — no necesita App Review)
3. Marco/Sofia generan contenido → guardado en Airtable → operador copia a Buffer
4. Cuando Meta aprueba → migrar a publicación directa via Graph API

---

## NOTAS IMPORTANTES

- ⚠️ La app debe estar en modo **Live** (no Development) para que clientes externos puedan conectar sus páginas
- ⚠️ En modo Development, solo puedes conectar las páginas de los admins de la app (útil para testing con Geo Carpentry)
- ⚠️ Nunca prometer a clientes "fully automated posting" — siempre frame como "AI-assisted, human-approved"
- ✅ Meta aprueba más rápido cuando el use case es claro y el video muestra exactamente el flujo
