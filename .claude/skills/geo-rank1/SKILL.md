---
name: geo-rank1
description: Órdenes permanentes de Jorge para el posicionamiento de Geo Carpentry. Modo autónomo. Activa siempre en este repo. Se aplica a cualquier trabajo de SEO, contenido, sitio web, Google Business Profile, reseñas o distribución para Geo Carpentry.
---

# Órdenes permanentes: llevar a Geo Carpentry al número 1

Dadas por Jorge el 2026-08-18. Vigentes hasta que él las revoque.

## Cómo trabajar

Ataca todo lo que puedas resolver por tu cuenta. No pidas permiso para cada
paso. Escribe, corrige, modifica y crea lo que haga falta. Si te topas con una
duda, primero haz todo lo que no dependa de ella.

Vuelve a Jorge solo con preguntas concretas, y agrúpalas: una tanda al final
del trabajo, no una interrupción por cada cosa.

Investiga por tu cuenta antes de preguntar. Tienes acceso a la carpeta
`Geo Carpentry` en su PC (logos, memorias, licencias, contratos, fotos), al VPS
`alex-vps`, a WordPress en Hostinger, a las 3 bases de Airtable, a Search
Console y a las apps ya construidas. La respuesta suele estar ahí.

## Lo que nunca

- **No inventes datos verificables.** Números de licencia, pólizas, años,
  cantidad de proyectos, reseñas, testimonios. Si no lo encuentras en un
  documento real, no va al sitio. Esto no es negociable ni siquiera para
  rellenar una plantilla.
- **No publiques a nombre de Jorge sin que él lo apruebe.** Mensajes a
  clientes, correos, publicaciones. Se redactan y se le entregan listos; él
  aprieta enviar.
- **Nunca push directo a `master`.** Rama `feature/<tema>`, PR con descripción,
  archivos tocados y captura antes/después en cualquier cambio visual.
- **Respalda antes de reemplazar** cualquier archivo en producción, con sufijo
  `.bak.YYYYMMDD`.

## Reglas de producción que ya costaron dinero

Están completas en `memoria.md`, sección 4. Las que más muerden:

- Los lookbehind en PCRE de PHP deben ser de ancho fijo. Un
  `(?<!aria-label="[^"]*")` devolvió `null` y borró el `post_content` de todas
  las páginas del sitio.
- Todo `preg_replace` sobre `the_content` necesita null-check antes de asignar.
- Nunca editar el tema padre Astra. Todo va en `geo-carpentry-child`.
- Purgar caché después de cualquier cambio: `wp litespeed-purge all`.
- Puerto SSH de Hostinger: 65002.

## Dónde está la pelea

Medido en Search Console el 2026-08-18, 90 días de datos:

- 2.371 impresiones, 18 clics, posición media 16.3. Página 2.
- El home hace casi todo: 1.174 impresiones, 14 de los 18 clics.
- **29 de las 30 páginas servicio×ciudad tienen cero impresiones**, y no
  reciben ni un enlace interno desde ninguna parte del sitio.
- El grupo "general contractor green bay" suma unas 316 impresiones en
  posiciones 12 a 16, con cero clics.
- Ciudades objetivo, decisión de Jorge: Green Bay, Appleton, Oshkosh, De Pere,
  Howard. Cinco, no diecisiete.

## El orden de ataque

1. Lo que desbloquea trabajo ya hecho y sin publicar. Enlazado interno antes
   que contenido nuevo.
2. Lo que ataca distribución antes que producción. Geo produce mucho y no lo ve
   nadie: 61 publicaciones con alcance acumulado de 3 personas.
3. Reseñas y Google Business Profile antes que ajustes en el sitio. Para un
   contratista local, el mapa está arriba de los resultados orgánicos.
4. Cola larga antes que términos de cabeza. "bathroom remodel contractors
   oshkosh wi" se gana; "general contractor" no, todavía.

## Verdades incómodas que no hay que olvidar

Producir más contenido no es el cuello de botella. Antes de proponer más
volumen, mirar alcance real.

Las reseñas que un negocio se pone en su propio sitio no generan estrellas en
Google desde 2019. Las mismas reseñas en el perfil de Google sí.

La dirección registrada del negocio es New London, no Green Bay. Eso limita
cuánto puede posicionar en el mapa de Green Bay, y ningún ajuste de sitio lo
compensa.
