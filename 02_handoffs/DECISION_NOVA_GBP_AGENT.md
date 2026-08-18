# Decisión — ¿Construir Nova (GBP Manager)?
> Creado: 2026-08-16 | Requiere decisión de Jorge Cruz
> Estado actual: Nova referenciado como agente pero **no existe en `/opt/alex-bot`**

---

## Contexto

Nova aparece listado como uno de los 27 agentes de Geo Carpentry. En realidad:
- El directorio `agents/nova/` nunca se creó en el VPS
- `foreman_marketing.mjs:91` lo reporta como `nova-offline` con nota: `"GBP quota pending (Case 5-5881000041235)"`
- Sus 4 crons diarios llevaban meses fallando con `MODULE_NOT_FOUND` → CC los comentó el 2026-08-16

---

## Qué haría Nova si existiera

| Modo | Función |
|---|---|
| `health_check` | Verifica que el perfil de GBP esté completo y sin alertas |
| `post_update` | Publica Google Posts automáticamente (ofertas, actualizaciones) |
| `reply_reviews` | Responde reseñas de Google con voz de Geo Carpentry |
| `weekly_report` | Reporte semanal: vistas, llamadas, clics a sitio web |

---

## Costo estimado de construcción

| Componente | Estimado |
|---|---|
| OAuth con Google My Business API | 1-2 días CC |
| 4 modos (`health_check`, `post_update`, `reply_reviews`, `weekly_report`) | 3-4 días CC |
| Integración con Telegram (notificaciones) | 0.5 días |
| Testing + deploy | 1 día |
| **Total estimado** | **~1 semana de CC** |

Nivel de complejidad: **medio**. La API de Google Business Profile es bien documentada. El mayor riesgo es la quota de GCP (ver abajo).

---

## El bloqueador: GCP Quota

**Case #:** 5-5881000041235

**Acción requerida de Jorge:**
1. Entrar a la consola de soporte de Google Cloud: https://console.cloud.google.com/support
2. Buscar el caso 5-5881000041235
3. Verificar si la quota fue aprobada, denegada, o sigue pendiente
4. **Llenar aquí el resultado:** `[ ]`

Sin quota aprobada, Nova no puede hacer llamadas a la API de GBP aunque esté construido.

---

## Análisis de prioridad vs revenue $500K

| Criterio | Evaluación |
|---|---|
| Impacto en generación de leads directa | 🟡 Indirecto — mejora visibilidad GBP |
| Urgencia para $500K en 2026 | 🔴 Baja — no genera ventas directas |
| Dependencia externa (quota) | 🔴 Bloqueado hasta que Google resuelva |
| Alternativa manual | ✅ Jorge puede responder reseñas y publicar en GBP manualmente |
| Tiempo de CC que compite con Atlas/Foreman | 🔴 1 semana que podría ir a SEO o pipeline |

---

## Recomendación

**No construir ahora.** Razones:

1. Bloqueado por quota de GCP — si no se aprueba, la semana de CC se desperdicia
2. Bajo impacto directo en los $500K vs prioridades como Atlas Loop 2 (SEO automatizado) o Foreman (cache-bust que sube score de 58 → 75+)
3. El costo de no tenerlo ahora es bajo — Jorge puede responder reseñas manualmente (toma 5 min/semana)

**Cuándo reconsiderar:** cuando la quota de GCP esté aprobada Y Atlas + Foreman estén en producción.

---

## Decisión de Jorge

```
[ ] Construir Nova ahora de todas formas
[ ] Esperar a que se resuelva la quota, luego evaluar
[ ] Cancelar Nova permanentemente — no es prioridad para $500K
```

**Fecha de decisión:** ___________
**Notas:** ___________

---

## Si decides proceder

Antes de que CC empiece, confirmar:
1. Quota de GCP aprobada ✅
2. Place ID correcto en `geo-carpentry.json`: `ChIJ49c5Tlf7S4QRbXXNI1H0EvQ` ✅ (corregido 2026-08-16)
3. Google Business Profile OAuth credentials disponibles en VPS `.env`
