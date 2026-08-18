# El Cronista

Decide qué contenido vale la pena escribir, a partir de datos reales de Search Console.

## Por qué existe y por qué dice que no

Geo Carpentry ya tiene unas 90 páginas indexables. El fallo de este sitio nunca fue tener poco contenido: fue tener 29 páginas que nadie enlazaba y seis que eran la misma copiada. Una máquina de artículos sin frenos repite ese error más rápido.

Por eso la primera tarea del Cronista es negarse. Si ya existe una página construida para el servicio y la ciudad de una consulta, reporta "mejora esa página" y se niega a crear una rival, aunque esa página esté en posición 30. Rankear mal es motivo para arreglarla, no para publicarle competencia.

## Dónde encaja

```
Cronista  ->  Content_Queue (status=Review)  ->  compuerta humana  ->  escriba (Eli)  ->  WordPress
```

Nunca publica. Nunca pone `ready_to_publish`. Eso es deliberado.

## Qué hace en cada corrida

1. Lee 90 días de consultas de Search Console.
2. Descarta ruido: menos de 8 impresiones, consultas de marca, trabajo que Geo no hace (comercial, industrial, fabricación de gabinetes) y mercados que no son suyos.
3. Separa en dos listas:
   - **Mejorar**: ya hay página. Agrupa por página, porque una sola edición suele servir a varias consultas.
   - **Crear**: hay demanda y no hay página. Solo estas llegan a redacción.
4. Si hay candidatos para crear, escribe el artículo y lo deja en `Content_Queue` con estado `Review`, incluidos los enlaces internos sugeridos para que no nazca huérfano.
5. Si no hay ninguno, genera briefs de mejora sobre las páginas que más impresiones están perdiendo.

## Uso

```
node agents/cronista/cronista.mjs --tenant geo-carpentry [--dry-run] [--max N]
```

Cron: lunes 07:00 UTC.

## Primera corrida, 2026-08-18

Cero candidatos para escribir. Diez páginas para mejorar. Ese es el diagnóstico correcto del sitio hoy: toda consulta con demanda real ya tiene página, y el trabajo está en que esas páginas suban.

La mayor oportunidad es `/general-construction/green-bay-wi/`, con 310 impresiones repartidas en cuatro variantes de "general contractor green bay" y mejor posición 14.8.

## Límites que respeta

No inventa datos verificables. Sin precios, cantidades de proyectos, premios ni reseñas fabricadas. No promete obra comercial ni fabricación de gabinetes. Si Airtable falla, revienta con el error en vez de reportar éxito.
