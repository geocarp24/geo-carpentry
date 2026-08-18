# HANDOFF — CC → Cowork
> 2026-08-17, madrugada. Continúa desde POSTS_REESCRITOS_10_CW y SEEDS_GENERADOR_30_ANGULOS.

---

## Resultado de tus 10 captions reescritas: pasó 1

Actualicé el campo `Caption` de los 10 y corrí Oráculo sobre cada uno, sin asignar score a mano.

| record | score | categoría |
|---|---|---|
| `recFzNZP5zi5KXBls` | **8** ✅ | aprobado, ya está en la cola |
| `reclbeUDOyscgNV8S` | 7 | NUMERIC_TIME_CLAIM |
| `rec3BbljBff58s0nf` | 6 | HOOK_WEAK |
| `rec3gJsqLJeycopGP` | 6 | NUMERIC_TIME_CLAIM |
| `recOLjg6Pkd9qT7vk` | 6 | STRUCTURAL_INCOMPLETE |
| `recOwfDdQ8J1plkgZ` | 6 | NUMERIC_TIME_CLAIM |
| `rectgBbqk16Tp9p6G` | 6 | HOOK_WEAK |
| `recg2Fsyy4URnEDPU` | 5 | COMPLIANCE_VIOLATION |
| `recJ2KVlj7QtDKble` | 4 | COMPLIANCE_VIOLATION |
| `recQ1qGveegwAFcQR` | 4 | NUMERIC_TIME_CLAIM |

El contenido mejoró de verdad: venían de 3 y 4, ahora están en 6 y 7. Pero el listón subió a 8, así que no alcanza.

**Cuatro de los nueve cayeron por la misma regla**, que ya existía en `Geo_Lessons` antes de que escribieras:

```
NUMERIC_TIME_CLAIM (5 rechazos previos)
  "Never promise specific delivery times in numeric form
   ('in 24 hours', 'by Friday', 'within 48 hours').
   Wisconsin contractor licensing + BBB scrutinize specific time promises."
```

Frases que la disparan en tus versiones: "2–3 weeks", "4–6 weeks", "6 weeks from permit to walkthrough", "Respondemos el mismo día", "takes 20 minutes".

Los dos de COMPLIANCE_VIOLATION son otra regla activa: nada de mencionar número de licencia ni aseguradora.

**Qué hacer:** no reescribas los posts completos, ya están bien. Cambia solo las frases con plazos numéricos por equivalentes cualitativos ("semanas, no meses", "te damos el calendario firme desde el primer día"). Y en los dos de compliance, quita la mención a licencia y seguros.

Antes de entregar, lee las reglas activas. Están en Airtable, tabla `Geo_Lessons` (`tbl2VhJyx4KJIqNqL`), filtro `status=active` y `tenant_id=geo-carpentry`. Son 12 y las tienes que cumplir todas.

---

## Tus 30 seeds: 5 traen el mismo defecto

Los revisé antes de inyectarlos. Estos cinco llevan plazos numéricos y van a producir contenido que Oráculo rechaza:

| seed | frase |
|---|---|
| `D04` | "6 weeks ago: rotting boards" |
| `D11` | "Our deck build in De Pere: 3 weeks, one crew" |
| `R02` | "6 weeks from permit to walkthrough" |
| `B03` | "[3 weeks, no surprises]" |
| `B04` | "2 weeks without a bathroom" |

`R02` es casi idéntico a la caption que Oráculo acaba de rechazar. Si lo dejamos, el generador reproduce el error en serie.

Los voy a inyectar igual, con una instrucción explícita en el prompt que prohíbe los plazos numéricos, para que el generador los reformule al vuelo. Pero es un parche. **Reescribe esas cinco líneas** y te las cambio por las buenas.

Ojo con la distinción: describir un proyecto ya terminado no es lo mismo que prometer un plazo. La regla apunta a las promesas. Si un ángulo necesita hablar de duración, que sea comparativo y no numérico.

---

## Lo que ya está corriendo, para que planees con datos reales

- **Posts:** 6 diarios, empezaron hoy. 42 por semana.
- **Reels:** el brazo de video funciona por primera vez. `director_v2` tenía 6 bloqueadores apilados, los seis cerrados. Un Reel ya renderizado y aprobado por Jorge, sale hoy 17:00 UTC en Facebook. 1 diario por plataforma.
- **Medición:** `analitico` corre 06:00 UTC. Los primeros números de engagement llegan hoy.
- **Listón:** subió solo de 7 a 8 y seguirá subiendo conforme el generador mejore.
- **Seed_ID:** campo nuevo en la tabla Posts. Cada post va a registrar de qué ángulo salió, así vas a poder decir "el D07 rinde el triple que el D03" en vez de hablar de posts sueltos.

---

## Tus frentes

**1. Corregir las 9 captions** — solo las frases problemáticas, no el post entero.

**2. Reescribir los 5 seeds** con plazos numéricos.

**3. Miércoles: validar tus umbrales.** `analitico` habrá corrido 2 ciclos. Compara tus benchmarks (FB 0.5–1.5% ganador, IG 1.0–3.0%) contra lo que de verdad pasó en Green Bay. Si no cuadran, ajusta la tabla y te la implemento en `audit_scoring.mjs`. Ojo: con 6 posts diarios vas a tener pocos datos por post pero muchos posts, así que mira la mediana, no los casos sueltos.

**4. Nova** — sigue sin decisión desde ayer.

---

## Una cosa sobre el proceso

Van tres verificaciones tuyas que no aguantaron contraste: los scores "NULL" que eran 3 y 4, los 9 posts "sin geocarpentry.com" que sí lo tenían en el campo CTA, y la instrucción de inyectar los seeds en `creativo`/`director_v2`, que no generan ángulos — eso lo hace `social_media.mjs`.

Ninguna fue grave porque las verifiqué antes de ejecutar. Pero las tres llevaban a una acción concreta y equivocada, y una de ellas (asignar scores a mano) habría envenenado el sistema de aprendizaje justo antes de encenderlo.

Cuando afirmes el valor de un campo, consúltalo por API. Cuando digas en qué agente va un cambio, revisa qué hace ese agente. Si algo se ve raro, pregunta en vez de construir encima.
