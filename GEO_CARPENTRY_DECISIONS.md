# GEO CARPENTRY — DECISIONES ESTRATÉGICAS
> Espejo del Airtable Decisions_Log para referencia rápida

---

## 2026-05-27

### DEC-001: Webhook Fase 2 — Opción B
**Airtable Record:** recYvQUy4oAw7I355
**Decisión:** Implementar `geo-webhook.service` dedicado en VPS (puerto 3001)
**Rationale:**
- VPS ya está pagado → costo adicional = $0
- Arquitectura de alex-bot ya existe → mínimo código nuevo
- Multi-tenant por diseño → Pinnacle u otros tenants sin cambios
- HMAC-SHA256 auth → seguro por diseño
**Alternativas descartadas:**
- Opción A (Vercel Serverless Fn directo): No puede SSH al VPS
- Opción C (Make.com/Zapier): Costo mensual, vendor lock-in, latencia

### DEC-002: Páginas SEO — texto simple sobre Elementor
**Decisión:** Las 30 páginas SEO son páginas de texto WP estándar, NO Elementor
**Rationale:**
- Velocidad de producción: 30 páginas en horas vs días
- SEO performance: páginas ligeras rankean mejor
- Escalabilidad: script genera 1000 páginas igual que 30
- Elementor queda para páginas de diseño (home, servicios principales)
**Nota:** Jorge aprobó explícitamente este enfoque el 2026-05-27

### DEC-003: Programmatic SEO — 6 servicios × 5 ciudades
**Decisión:** Bucket B de SEO = 30 páginas ciudad-servicio en NE Wisconsin
**Ciudades:** Green Bay, Appleton, Oshkosh, De Pere, Howard
**Servicios:** Kitchen Remodeling, Bathroom Remodeling, Deck Building, Finish Carpentry, Home Renovation, General Construction
**Pilares de contenido:** kitchen-cost, bathroom-roi, permit-deck-brown-county, crown-molding-trim, addition-vs-renovation, choosing-contractor

### DEC-004: Plataforma Website — WordPress + Elementor
**Decisión:** Mantener WordPress en Hostinger (no migrar a Durable)
**Rationale:** Ya migrado y configurado, Elementor para páginas de diseño, WP para SEO programmatic
**Nota:** Plan original de marzo 2026 era Durable → descartado

---

---

## 2026-08-17

### DEC-008: Meta Ads — $50/semana aprobado
**Decisión:** Lanzar Meta Ads con objetivo Messages · $50/semana de cuenta Geo Carpentry LLC
**Rationale:** Pipeline de contenido funciona (23 posts Visual Listo score ≥7) pero reach orgánico = ~3 personas (6 FB / 5 IG followers). Distribución es el problema, no el contenido.
**Estructura:** 2 campañas (EN $25/sem + ES/Hispanic $25/sem) · 6 creativos (3 EN + 3 ES) · Green Bay +25mi · 35-65 homeowners
**Handoff:** HANDOFF_CC_META_ADS_AGENT.md — CC crea campañas en PAUSED, Jorge activa manualmente
**Alternativas descartadas:** Boost de posts (menos control), solo orgánico (insuficiente), LinkedIn (B2C no aplica)

### DEC-009: No construir programador.mjs
**Decisión:** Cancelar handoff de agente de scheduling inteligente
**Rationale:** CC confirmó que (1) Social_Insights no existe, (2) El Analítico escribe métricas per-post en Geo_Posts no en tabla separada, (3) publisher ya maneja Programado correctamente. El handoff estaba basado en premisas incorrectas.
**Lección:** Verificar con CC antes de diseñar agentes que asumen arquitectura existente.

### DEC-010: GitHub backup automático — Cowork scheduled task
**Decisión:** Backup diario de Memory Claude a github.com/geocarp24/geo-carpentry via tarea automática de Cowork (no Windows Task Scheduler)
**Rationale:** Cowork corre el script directamente · no requiere que Jorge toque la terminal · se activa sola diariamente a las 11pm
**Repo:** https://github.com/geocarp24/geo-carpentry (PRIVATE)
**Seguridad:** vps_key excluida por .gitignore · tokens redactados en archivos de texto · PAT almacenado en .env (gitignored)

---

## HISTORIAL (sesiones anteriores)

### Sesiones anteriores a 2026-05-27
- Migración de Mixo → WordPress realizada ✅
- Elementor instalado y páginas de diseño creadas ✅
- mu-plugin geo-service-city-pages.php desplegado ✅
- Dashboard Investoros live en Vercel ✅
- 6 agentes alex-bot corriendo en cron VPS ✅
- Bulk creator script `create_service_city_pages.py` listo (commit 866863e) ✅
