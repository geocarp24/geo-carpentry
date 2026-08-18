# HANDOFF — CC → Cowork | Post-deploy
> 2026-08-16, noche. Reemplaza al handoff de 4 pilares en prioridad.

El sistema cambió bastante en las últimas horas. Esto te pone al día y te deja lo que sigue.

---

## Antes de nada: dos verificaciones tuyas no aguantaron contraste

En el paquete de 4 pilares afirmaste que los 10 posts atorados tenían score **NULL** y que eran "anteriores al sistema de scoring". Consultando la API, nueve de los diez tienen score **3 o 4** con `Oraculo_Notes: src=sonnet`. Es decir, el LLM de Oráculo los evaluó y los reprobó. Sólo uno (`rectgBbqk16Tp9p6G`) está sin score.

También dijiste que 9 de 26 posts no llevaban geocarpentry.com. Los 26 lo llevan. El link está en el campo `CTA`, no en `Caption`.

Las dos veces la conclusión llevaba a una acción concreta y equivocada: en el primer caso, asignar scores a mano sobre contenido que el evaluador había reprobado, justo antes de encender el sistema de aprendizaje que se alimenta de esos scores.

**Cómo evitarlo:** antes de afirmar un valor de campo, consúltalo por API y mira todos los campos donde podría estar, no sólo el que esperas. Si algo se ve raro, pide que lo verifiquemos en vez de construir una recomendación encima.

---

## Qué cambió en el sistema

**Cadencia.** De 8 posts por semana a 42. Tres diarios por plataforma, empezando mañana 09:30 UTC.

**El listón ahora sube solo.** `APPROVE_THRESHOLD` dejó de ser 7 fijo. Se recalcula en cada corrida como el percentil 25 de lo aprobado reciente, con piso 7 y techo 9. Ya subió a 8. Cuando el generador consolide los 8, se irá a 8.5. El sistema no puede estancarse en "suficientemente bueno".

**La causa real de los rechazos repetidos.** `CTA_MISSING` acumulaba 71 rechazos. No era desobediencia del modelo: la descripción del campo `caption_es` pedía sólo el teléfono, mientras que Oráculo exigía teléfono y sitio web. El generador cumplía sus instrucciones y era reprobado por algo que nunca se le pidió. Ya está corregido.

**Lecciones ignoradas escalan.** Una lección que pasa de 10 rechazos sale de la lista de viñetas y se convierte en bloque no negociable al inicio del prompt.

**Medición encendida.** Los 11 campos de métricas existen y `analitico` corre diario a las 06:00 UTC. Los primeros datos de engagement llegan en 24-48h.

**Reels.** `director_v2` tenía cuatro bloqueadores apilados y nunca había corrido. Los cuatro están cerrados. Esta noche a las 22:00 UTC renderiza sus primeros Reels con marca de Geo.

---

## Frente 1 — Arreglar los 10 posts reprobados (tuyo, es contenido)

Jorge decidió que si Oráculo los reprobó, es por algo, y que no se les asigna score a mano.

Para cada uno de los 10, lee su `Error_Reason`, que trae el motivo del rechazo, y **corrige el contenido** para que resuelva ese motivo. Después los pasamos por Oráculo y el score sale del evaluador.

Ojo con esto: el listón ahora está en **8**, no en 7. Un arreglo que apenas los deje en 7 ya no alcanza.

Entrega el texto corregido por ID. Yo hago la escritura y la corrida de Oráculo.

---

## Frente 2 — Convertir tus 30 ángulos en semillas utilizables

Los ángulos que entregaste están bien, pero hoy viven en un documento y el generador no los ve. Necesito que los formatees para inyectarlos en el prompt.

Por ángulo: pilar, gancho EN, gancho ES, la duda del cliente que resuelve, y tipo. Una línea por ángulo, sin prosa alrededor. Prioriza por tu propia distribución 40/30/20/10.

Con eso el generador deja de inventar temas y empieza a trabajar variaciones sobre ángulos que ya validaste.

---

## Frente 3 — Confirmar tus umbrales contra datos reales

Los umbrales que definiste (FB ganador 0.5–1.5%, IG 1.0–3.0%, mínimo 150 impresiones) salieron de benchmarks del sector. En 48 horas vamos a tener números propios de Geo.

Cuando los tengamos, compara y ajusta. Si el engagement real de Geo resulta muy por encima o por debajo del benchmark, los umbrales que propusiste van a clasificar mal desde el primer día, y esa clasificación es la que decide qué se recicla.

No toques `audit_scoring.mjs`. Entrégame la tabla corregida y yo la implemento.

---

## Frente 4 — Nova, decisión pendiente

Sigue sin resolverse desde el handoff de la mañana. Nova no existe como código, sólo como casilla en la landing. Hace falta el doc corto de decisión: estado del caso de quota con Google, tamaño real del trabajo, prioridad contra lo demás.

---

## Límites

**No toques:** `/opt/alex-bot`, el crontab, el esquema de Airtable, ni el estado de los records.

**Tuyo:** contenido, ángulos, umbrales, criterio, investigación.

---

## Referencia

- Página de revisión de la cola (Jorge la tiene): muestra los 26 con visual, caption y CTA
- Airtable `appAQpveuAec077jF` · Posts `tblBbSbpzzANl74y0` · Reels `tblF6RDSTysUtb7bf` · Geo_Lessons `tbl2VhJyx4KJIqNqL`
- Cola hoy: 26 publicables. Deck-Build 12, Bathroom-Remodel 11, Kitchen-Remodel 2, General 1
- Listón de aprobación vigente: **8**
- Primer post con cadencia nueva: mañana 09:30 UTC en Instagram
