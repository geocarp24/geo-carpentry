# Geo Carpentry — Follow-up Sequences (Email + SMS)

**Plan:** Fase 1 — Secuencia de 8 toques para leads que no responden o no cierran.

**Stack:** Make.com (cuenta existente del Jefe) + Hostinger SMTP (deals@geocarpentry.com) + Quo SMS (cuando se resuelva carrier issue).

**Tone:** profesional + cálido, NO sales-y. Pinnacle "homeowner" voice adaptado a "construction client".

**Variables:** `{{first_name}}`, `{{service}}`, `{{quote_amount}}`, `{{job_link}}`, `{{calendar_link}}`.

---

## SECUENCIA: Lead nuevo sin respuesta a quote

### Toque 1 — DÍA 0 (auto-respond, 5 min después de submit)
**Channel:** Email
**Subject:** Got your request, {{first_name}} — review by tomorrow

```
Hola {{first_name}},

Recibimos tu solicitud para {{service}}. Soy Jorge, dueño de Geo Carpentry LLC.

Voy a revisar tu proyecto y te llamo en las próximas 24 horas con próximos pasos
(usualmente una visita gratis para medir + foto del lugar).

Si tienes prisa, llámame directo: (920) XXX-XXXX

— Jorge
Geo Carpentry LLC
Built to Last. Crafted with Pride.

📞 (920) XXX-XXXX
🌐 geocarpentry.com
```

---

### Toque 2 — DÍA 3 (lead no respondió a la primera llamada)
**Channel:** SMS (suave)
```
Hola {{first_name}}, es Jorge de Geo Carpentry — ¿pudiste ver el quote 
que te mandé para {{service}}? Cualquier pregunta o ajuste, te marco hoy. — J
```

---

### Toque 3 — DÍA 7 (showing social proof)
**Channel:** Email
**Subject:** Quick look — recently finished {{service}}

```
{{first_name}},

Queriendo recordarte tu quote para {{service}}. 

Te mando una foto de un job de {{service}} que terminamos la semana pasada
en [ciudad] — el cliente quedó super contento, te paso su contacto si quieres
verificar referencia.

[FOTO ATTACHED]

Mi agenda para arrancar nuevos proyectos:
- Esta semana: 1 slot disponible  
- Próxima semana: 3 slots

Si quieres asegurar uno, te marco hoy para confirmar fechas.

— Jorge
```

---

### Toque 4 — DÍA 14 (offering flexibility)
**Channel:** SMS
```
Hola {{first_name}}, ¿el quote de {{service}} te quedó muy alto o muy ajustado? 
Te puedo proponer una versión más simple si necesitas — solo me dices qué 
es lo más importante. — Jorge
```

---

### Toque 5 — DÍA 21 (urgency + discount)
**Channel:** Email
**Subject:** Final offer — 5% off if we start before end of month

```
{{first_name}},

Voy a cerrar mi agenda para [mes próximo] esta semana.

Te ofrezco un descuento del 5% en el quote actual ({{quote_amount}}) si confirmamos 
arranque antes del [fecha 30 días de hoy].

Solo confirma con SÍ a este email o llamada y te aseguro el slot.

— Jorge
Geo Carpentry LLC
```

---

### Toque 6 — DÍA 35 (release pressure)
**Channel:** SMS
```
Hola {{first_name}} — entiendo que a veces los proyectos se pausan. 
Si tu plan de {{service}} sigue activo, te aviso cuando se libere mi agenda. 
Sin compromiso. — Jorge
```

---

### Toque 7 — DÍA 60 (educational, value-first)
**Channel:** Email
**Subject:** What I learned doing {{service}} last month

```
{{first_name}},

Sin presión, sólo queriendo compartir algo útil.

Acabamos de terminar 3 jobs de {{service}} este mes. Lo que aprendí que 
podría servirte cuando estés listo:

1. [Tip específico al servicio, ej. para deck: "El mejor momento para construir 
   en Wisconsin es entre Mayo y Septiembre — los costos de materiales suben 10% 
   en winter"]

2. [Tip 2]

3. [Tip 3]

Si quieres seguir conversando, llámame. Si no, está bien también — sigo 
disponible cuando estés listo.

— Jorge
```

---

### Toque 8 — DÍA 90 (casual reactivation)
**Channel:** SMS
```
Hola {{first_name}}, sólo paso a saludar — ¿cómo va tu proyecto de {{service}}? 
Si ya lo hiciste con alguien, me alegra. Si todavía no, ahí estoy. — J
```

---

## SECUENCIA: Post-Job (Reviews + Referrals + Upsell)

### Toque +1 (al día siguiente del COMPLETED)
**Channel:** Email + SMS
**Subject:** All done, {{first_name}} — would love your review

```
{{first_name}},

¡Listo! Terminamos {{service}} y quedé súper contento con el resultado.

Si tú también lo estás, ¿podrías dejarnos una review rápida en Google?
Toma 30 segundos y nos ayuda mucho:

👉 [GOOGLE REVIEW LINK]

Y por si quedaste con algún detalle, dime y vamos hasta que estés 100%.

Gracias por confiar en Geo Carpentry,
— Jorge
```

### Toque +7 (1 semana después)
**Channel:** SMS
```
Hola {{first_name}}, una semana después de {{service}} — ¿todo bien? 
Si conoces alguien que necesite carpintería, paso una tarjeta de referido 
y les hago descuento + a ti $100 de regalo cuando cierre. — Jorge
```

### Toque +30 (1 mes después)
**Channel:** Email
**Subject:** Quick check-in + idea for next phase

```
{{first_name}},

Un mes desde {{service}}. ¿Cómo está aguantando? Cualquier detalle me dices.

Y si estás pensando en lo siguiente — [sugerencia específica al servicio, ej.
después de deck: "los muchos de mis clientes después de un deck quieren 
una pergola o screen room"] — te hago quote prioritario con descuento de 
cliente existente (10% off).

— Jorge
```

---

## SECUENCIA: Referral cerrado

### Al referidor (cuando el referido cierra contrato):
**Channel:** Email + SMS
```
{{first_name}},

¡Buenas noticias! [Nombre del referido] cerró {{service}} con nosotros.

Como prometí, $100 de regalo: te envío Venmo / cheque / lo descuento del 
próximo job tuyo — tu eliges.

Gracias por la confianza,
— Jorge
```

---

## Reglas de la secuencia (importantes)

1. **Si responden en cualquier toque** → secuencia se PAUSA. Jorge maneja personal.
2. **Si cierran (Stage = Won)** → secuencia se DETIENE. Cambia a secuencia Post-Job.
3. **Si marcan "Stage = Lost"** → secuencia se DETIENE. Wait 6 meses → secuencia de re-engagement.
4. **SMS sólo se envía con teléfono válido** (consentimiento via form submit cuenta como opt-in).
5. **Email tiene unsubscribe link** en footer (obligatorio CAN-SPAM).
6. **Horarios:** SMS solo entre 9am-7pm CT. Email anytime.
7. **Fallback Quo SMS:** mientras está paused el SMS de Quo (carrier issue), TODO va por email + llamada manual.

---

## Make.com setup (workflow)

**Trigger:** Airtable webhook — Lead created OR Lead.Stage changes
**Branches:**
- Stage = "Quote Sent" → arranca secuencia "Lead nuevo sin respuesta"
- Stage = "Won" → arranca secuencia "Post-Job" (espera Completed)
- Job.Status = "Completed" → arranca secuencia "Post-Job"

**Scheduler:** Make scenario corre cada hora, busca Leads con "Last contact date" matching pattern de los toques.

**Variables sourced from Airtable:**
- Contact.first_name → `{{first_name}}`
- Lead.service → `{{service}}`
- Lead.estimated_value → `{{quote_amount}}`

---

## Métricas a trackear

- **Open rate** por toque (email)
- **Response rate** por toque (call/SMS reply)
- **Conversion rate post-secuencia** (cuántos pasan de "Quote Sent ghost" → "Won")
- **Best performing toque** (qué día convierte más)

Ajustar A/B test después de 30 leads que pasaron por la secuencia.
