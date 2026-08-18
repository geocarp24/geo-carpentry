# Geo Carpentry LLC — Ops Brain

Respaldo completo del sistema operativo de Geo Carpentry LLC:
memoria de agentes de IA, handoffs, scripts, configuraciones, y contenido SEO.

**Última actualización:** 2026-08-17

---

## Estructura

```
Memory Claude/
├── MEMORY.md                    # Índice maestro del sistema
├── GEO_CARPENTRY_CURRENT.md     # Sprint activo + estado de tareas
├── GEO_CARPENTRY_TECH.md        # Stack técnico completo
├── GEO_CARPENTRY_DECISIONS.md   # Decisiones estratégicas
├── GEO_CARPENTRY_RULES.md       # Reglas del sistema (no modificar sin revisión)
│
├── 01_legal/                    # Documentos legales (TOS, Privacy Policy)
├── 02_handoffs/                 # Handoffs Cowork ↔ Claude Code
├── 03_scripts/                  # Agentes VPS + scripts de automatización
│   └── vps_agents/              # analitico, audit_meta, rastreador, etc.
├── 04_tenant-configs/           # Configuración de tenants (geo-carpentry, etc.)
├── 05_seo-content/              # Contenido SEO en español para Investoros
└── 99_archive/                  # Versiones anteriores
```

## Proyectos activos

- **Geo Carpentry LLC** — General Contractor, Green Bay WI
  - Pipeline social: Oráculo → Creativo → Publisher (FB/IG)
  - Agentes VPS: analitico, social_media, oraculo, creativo
  - Meta Ads: $50/semana — campañas EN + ES aprobadas 2026-08-17
  
- **Investoros SaaS** — Platform for Hispanic contractors

## Seguridad

- Tokens de API NO están en este repo — se referencian como variables de entorno
- `vps_key` está en `.gitignore` — NO subir nunca la SSH key
- Los configs de tenant usan `token_env` (nombre de la variable, no el valor)

## Stack

- VPS: Ubuntu, Node.js, `/opt/alex-bot/`
- Airtable: base `appAQpveuAec077jF`
- Meta: FB Page `723873447473999`
- Plataformas: Facebook, Instagram
