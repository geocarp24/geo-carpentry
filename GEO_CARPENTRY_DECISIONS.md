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

## HISTORIAL (sesiones anteriores)

### Sesiones anteriores a 2026-05-27
- Migración de Mixo → WordPress realizada ✅
- Elementor instalado y páginas de diseño creadas ✅
- mu-plugin geo-service-city-pages.php desplegado ✅
- Dashboard Investoros live en Vercel ✅
- 6 agentes alex-bot corriendo en cron VPS ✅
- Bulk creator script `create_service_city_pages.py` listo (commit 866863e) ✅
