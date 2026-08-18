# HANDOFF — CC → Cowork | Estrategia 4 pilares + medición
> 2026-08-16, tarde. Reemplaza en prioridad al handoff de esta mañana.

Jorge definió el enfoque: dejar de producir volumen y concentrarse en 4 servicios con demanda, medir qué post pega, y reutilizar los ganadores con números probados.

Este doc te deja lo que puedes avanzar sin chocar conmigo.

---

## Cambio de estrategia

Cuatro pilares, nada más:

1. **Decks** (`Deck-Build`) — máxima demanda ahora mismo
2. **Baños** (`Bathroom-Remodel`) — en demanda
3. **Adiciones y remodelaciones** (`Home-Renovation`)
4. **Construcción nueva** (`General-Construction`)

Los cuatro ya existen como valores de `Segment_Anchor` en Airtable, así que no hay que inventar taxonomía.

Cadencia objetivo: 3 posts diarios. Jorge todavía tiene que confirmar si son 3 en total o 3 por plataforma, porque la diferencia cambia el consumo de inventario.

---

## El dato incómodo que ordena todo

**No existe una sola métrica de engagement.** Cero posts medidos, nunca.

El agente que mide (`analitico`) está escrito y completo, incluida la lógica de reciclaje por tiers, pero nunca se encendió y le faltan los 8 campos en Airtable. Yo me encargo de eso.

Consecuencia para ti: todavía no se puede decir cuál post pega duro. No hay ganadores que reutilizar. Primero hay que publicar con la cadencia nueva y acumular unas dos semanas de datos.

Eso no cancela el plan. Lo pone en orden: publicar, medir, reciclar.

---

## Frente 1 — Revisión de contenido antes del martes (lo más urgente)

El martes salen los primeros posts reales a Facebook e Instagram. Confirmé que los tokens de Meta funcionan y que los dos bugs que lo bloqueaban están corregidos. La cola tiene 26 posts aprobados listos.

Revisa esos 26 en la base `appAQpveuAec077jF`, tabla Posts (`tblBbSbpzzANl74y0`), filtrando `Status = Visual Listo` y `Oraculo_Score >= 7`. Busca:

- Léxico de real estate filtrado desde Pinnacle (motivated seller, wholesaling, ARV, cap rate). Geo es contratista general.
- Español sin acentos.
- Teléfono (920) 367-1272 y geocarpentry.com correctos en el CTA.
- Visual que corresponda al texto.

Entrega una lista de IDs en tres cubetas: aprobar, corregir, descartar.

---

## Frente 2 — Qué significa "pegar duro" (hazlo antes de que lleguen los datos)

Cuando `analitico` empiece a escribir métricas, alguien tiene que decidir el umbral. Si no está definido antes, vamos a discutirlo con los datos encima y sesgados por lo que ya salió.

Define ahora, por escrito:

- Qué `Engagement_Rate` cuenta como ganador para un contratista local en un mercado del tamaño de Green Bay. Busca referencias del sector, no inventes el número.
- Cuántas impresiones mínimas hacen falta para que el dato sea confiable y no ruido.
- Qué pesa más para Geo: alcance, guardados, comentarios o clics. Un guardado en un post de decks probablemente vale más que un like, porque indica intención.
- Cuántos días esperar antes de juzgar un post.

Esto entra directo en `audit_scoring.mjs`, que ya clasifica por tiers. Entrégalo como tabla de umbrales, no como ensayo.

---

## Frente 3 — Ángulos por pilar

Cada pilar necesita ángulos que valga la pena probar y después repetir. Para cada uno de los 4, entrega entre 5 y 8 ángulos con:

- El gancho en una línea, en inglés y español
- A qué duda o miedo del cliente responde
- Por qué es del pilar y no genérico
- Si es educativo, promocional o prueba social

Contexto que ya está validado y debes respetar: dueños de casa de 35 a 65 años en Green Bay, Appleton, Oshkosh, De Pere y Howard. Cocinas de los noventa, baños de los ochenta, decks vencidos. Buscan un contratista con licencia, bilingüe, que llegue a la hora.

**Decks primero.** Es el de mayor demanda hoy y además tiene urgencia estacional, porque en Wisconsin la temporada se cierra.

---

## Frente 4 — Los 10 posts atorados

Hay 10 posts en `Visual Listo` con score 3 y 4 que el publicador descarta en silencio, porque exige 7 o más. Son de autoría de CW, aprobados a mano el 1 de junio, y llevan ahí desde entonces.

Revisa por qué Oráculo los puntuó bajo y decide: se corrigen para que suban de 7, o se descartan. No les subas el score a mano sin arreglar el contenido, porque el score es lo que va a alimentar el sistema de aprendizaje.

Sus IDs salen filtrando `Status = Visual Listo` y `Oraculo_Score < 7`.

---

## Frente 5 — Validar la demanda

Jorge dice que decks y baños están en demanda ahora. Confírmalo con datos, porque de ahí sale el reparto de esfuerzo entre los 4 pilares.

Busca estacionalidad de búsquedas en el noreste de Wisconsin, qué están publicando los competidores locales, y si hay algo de permisos o clima que empuje la urgencia. Si los datos contradicen la corazonada, dilo.

---

## Límites

**No toques:**
- Nada dentro de `/opt/alex-bot` en el VPS
- El crontab
- El esquema de Airtable, los campos nuevos los creo yo
- El estado de los records

**Tuyo:** contenido, criterio, umbrales, ángulos, investigación de mercado.

---

## Qué hago yo mientras tanto

Crear los 8 campos de métricas, encender `analitico` a diario, subir la cadencia, y enfocar la generación en los 4 pilares.

Advertencia sobre eso último: casi toda la cola actual es cocina y decks. Si corto cocina de golpe, se pierde inventario ya producido. El plan es dejar salir lo que está listo y aplicar el foco solo a lo nuevo.

---

## Referencia

- Airtable `appAQpveuAec077jF`, Posts `tblBbSbpzzANl74y0`, Reels `tblF6RDSTysUtb7bf`
- Publicador: martes y viernes, FB 10:00 UTC, IG 11:00 UTC (sube a diario en cuanto Jorge confirme el número)
- FB Page `723873447473999`, IG `17841475418377793`, tokens verificados el 2026-08-16
- Estado de la cola hoy: 36 en `Visual Listo`, de los cuales 26 pasan el filtro del publicador
- El brazo de video (Reels) sigue muerto. `director_v2` nunca ha funcionado y no hay cron que publique Reels. No cuentes con video por ahora.
