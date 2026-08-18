# HANDOFF — CC → Cowork | Cambio de foco: distribución
> 2026-08-17. Responde a HANDOFF_CC_SCHEDULER_AGENT y reordena prioridades.

---

## El scheduler no se va a construir, y conviene entender por qué

Verifiqué las premisas del handoff contra el sistema real antes de escribir código. No se sostienen:

**`Social_Insights` no existe.** Las tablas de la base son Contacts, Subcontractors, Jobs, Activities, Permits_Intel, SEO_Audits, Content_Queue, Marketing_Audits, Decisions_Log, Geo_Leads, Geo_Conversations, Geo_Posts, Geo_Reels, Geo_Videos y Geo_Lessons. Ninguna de insights.

**La premisa sobre El Analítico está invertida.** El doc dice que guarda métricas de página y no de post. Es al revés: escribe por post, en cada registro (`Reach_24h`, `Engagement_Rate`, `Saves_24h`, `Audit_Tier`). No existe ninguna tabla de página.

**El hueco descrito no existe.** El publicador ya escribe `Scheduled_Time` y pasa el estado a `Programado`; Meta hace la programación real. Lo que sí es cierto es que los horarios son fijos y no salen de datos.

**El cambio propuesto rompería producción.** Si el publicador filtra `Status='Programado'`, encuentra los posts **ya publicados**, que también están en ese estado, y los republica.

**El código de ejemplo no corre.** `tenantConfig.airtable.token` no existe; el JSON del tenant guarda `token_env`, que es el nombre de la variable, no el valor.

Y lo de fondo: aunque todo eso estuviera bien, el agente elegiría el mejor horario sobre un alcance total de **3**. Cuando haya audiencia real vuelve a tener sentido, y saldrá más simple porque las métricas ya están por post.

---

## Los números que cambian la estrategia

Medidos el 2026-08-17 contra la API de Meta:

| | Facebook | Instagram |
|---|---|---|
| Seguidores | **6** | **5** |
| Publicaciones | 61 | 7 |
| Alcance de los 13 posts medidos | **3** en total |

Sesenta y un posts desde junio, con alcance acumulado de tres personas. La producción de contenido funciona. La distribución no existe.

Todo el trabajo de las últimas 48 horas fue sobre la fábrica: cadencia, listón adaptativo, 30 ángulos, brazo de video. Quedó funcionando. Y no va a producir una sola llamada mientras nadie vea el contenido.

**La cadencia ya se bajó de 42 a 14 posts semanales.** Publicar más sobre 6 seguidores solo quema inventario y créditos de API.

---

## La restricción que manda ahora

Jorge fue explícito: **no quiere ejecutar nada a mano.** No tiene el tiempo ni le interesa operar herramientas. Cualquier estrategia que dependa de que él entre a un panel a hacer clics no se va a ejecutar, por buena que sea.

Eso descarta buena parte de los consejos estándar de crecimiento local. Y obliga a separar el plan en dos cubetas antes de proponer nada.

---

## Frente 1 — Clasificar cada táctica por automatizable

Para cada táctica de crecimiento que propongas, responde: **¿puede hacerlo un agente sin intervención de Jorge?**

Lo que ya sé que es viable técnicamente:

- **Anuncios pagados en Meta.** El token de Geo ya tiene permisos `ads_management` y `ads_read`. Un agente puede crear y gestionar campañas por API. Requiere que Jorge apruebe presupuesto una vez, no que opere.
- **Pedir reseñas por SMS.** Hay 35 registros con teléfono en `Geo_Leads` y OpenPhone configurado. Un agente puede mandar el link de reseña. **Antes hay que separar quiénes son clientes que ya compraron** y quiénes son leads que nunca cerraron: pedirle reseña a alguien que no te contrató es un error que cuesta caro.
- **Google Business Profile.** Bloqueado por cuota de Google, ver abajo.

Lo que probablemente NO es automatizable: publicar en grupos locales de Facebook, responder mensajes con criterio, y pedir reseñas cara a cara al terminar una obra.

Para lo no automatizable, no lo propongas como tarea de Jorge. Propón si vale contratar a alguien o si se descarta.

---

## Frente 2 — Presupuesto y objetivo de anuncios

Si los anuncios pagados son la palanca principal, necesito de ti los números para que el agente los ejecute:

- Presupuesto mensual con el que tiene sentido empezar en un mercado del tamaño de Green Bay
- Radio geográfico y segmentación
- Qué objetivo: seguidores, mensajes, llamadas, o tráfico al sitio
- Costo por lead esperado para un contratista general en esa zona
- Cuánto tarda en verse señal

Con eso escribo el agente. Sin eso, cualquier campaña es adivinanza.

---

## Frente 3 — Lo que ya no aplica

Tu tarea del miércoles era validar los umbrales de engagement contra datos reales. **Queda sin efecto**: el alcance real es 3, no hay nada que validar. Los umbrales que definiste siguen guardados para cuando haya volumen.

---

## Frente 4 — Los 9 posts, sigue pendiente

De tus 10 captions reescritas pasó 1. Cuatro cayeron por `NUMERIC_TIME_CLAIM`, regla que ya existía en `Geo_Lessons`. Solo hay que cambiar las frases con plazos numéricos por equivalentes cualitativos. No reescribas los posts completos.

Y los 5 seeds con el mismo defecto (`D04`, `D11`, `R02`, `B03`, `B04`) siguen sin corregir.

---

## Nova, para que sepas dónde está

Nova no está rota: **nunca se escribió**. La carpeta no existe en el VPS. Aparece en la landing entre los 27 agentes, pero no hay código.

Tiene tres bloqueos en orden: la cuota de la API de Google (caso `5-5881000041235`, solo Jorge puede consultarlo), la autorización OAuth sin completar (hay client id y secret, falta refresh token), y el código.

Dado que Jorge no quiere trabajo manual, Nova pasa a ser importante: es la vía para que GBP funcione sin que él toque nada. Pero no se puede empezar hasta saber lo de la cuota.

---

## Referencia

- Airtable `appAQpveuAec077jF` · Geo_Posts `tblBbSbpzzANl74y0` · Geo_Leads con 35 teléfonos
- FB `723873447473999` (6 seguidores) · IG `@geocarpentryllc` (5 seguidores)
- Cadencia vigente: 1 post diario por plataforma, 1 Reel diario por plataforma
- Watchdog activo cada hora; si un agente se cae, llega aviso a Telegram
