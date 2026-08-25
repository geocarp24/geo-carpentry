# Pendientes de Geo Carpentry

Estado al 2026-08-25. Nada de esta lista es urgente y nada corre riesgo de perderse:
`/opt/geo-backup/backup.sh` respalda el VPS a diario al repo privado `geo-backup`.

Antes de ejecutar cualquiera de estos puntos, verificar el estado real. Esta lista
envejece; el servidor manda.

## Las dos reglas que ordenan todo lo demás

**No romper nada que esté funcionando.** El CRM, los agentes del VPS y el webhook
están en uso. Antes de proponer un cambio sobre algo vivo hay que verificar qué
depende de eso, no averiguarlo después.

**Todo lo de Geo va al repo `geo-carpentry`** — carpetas, código, memorias, handoffs.
`investoros-web` entra recién cuando esa app arranque, y ahí Geo será el primer
cliente. Hasta entonces no se trabaja de ese lado.

## Obra y negocio

1. **Change order de 1340 Harvey St.** Decidir si se le acredita a Bruce el
   diferencial de la ventana ($2,013). En cualquier escenario el trabajo cierra
   cerca de cero.
2. **Costos de Harvey St en Airtable.** El registro todavía dice 100% de margen.
   Pasarlo a Completed cuando cierre.
3. **Meta Ads** espera que Jorge elija la cuenta publicitaria.
4. **Nova / Google Business Profile**: caso `0-9678000041538`.
5. **Brazo social**: decidir si se apaga. De 23 posts publicados, 18 con alcance
   cero. Queda un "SMOKE TEST 001" vivo en la página de Facebook.

## Código y seguridad

El punto 6 bloquea al 7 y al 8. Conviene hacerlos en ese orden.

6. **Sacar el `WEBHOOK_SECRET` de `budget/CRM/api.php`.** Está en texto plano como
   respaldo de `config.php`. Ese secreto es lo único que impide que cualquiera
   dispare agentes en el VPS. Mientras siga ahí y el repo sea público, commitear
   la app publica la llave.
7. **Meter `budget/CRM/` y `budget/Social/` a git.** Hoy no están en ningún repo:
   viven en OneDrive y en Hostinger. Depende del 6.
8. **Las cuatro apps GeoBudget** (remodel, siding, roofing, deck), misma situación.
9. **GeoBudget Pro** sigue servido desde `pinnaclegroupwi.com/GeoBudget/` con el
   token `geocarpentry2026` en claro. Bajarlo o rotar el token. Jorge ya no la usa.
10. **Mudar el agente `review_request` a este repo** y repuntar de dónde hace pull
    `/opt/alex-bot`. Hoy jala de `investoros-web`. Mover el código sin repuntar el
    servidor lo deja sin actualizaciones y nadie se entera.
11. **Sincronizar `/opt/alex-bot` con su repo.** Hay 2.200 líneas editadas a mano en
    el servidor que nunca se commitearon, y seis agentes que solo existen ahí:
    `cronista`, `atlas`, `cal`, `marco`, `foreman_seo`, `foreman_marketing`.
    Nunca correr `git pull` ni `git add -A` a ciegas en ese directorio.
12. **Cerrar el login de root por contraseña en el VPS.** Hay bots probando a diario.
    La consola de Hostinger entra con llave, así que apagarlo no deja a nadie afuera.
13. **Rotar dos credenciales**: el `client_secret` de Google commiteado en
    `investoros-web` (público desde mayo) y el PAT de GitHub que vive dentro de la
    URL del remote en `/opt/alex-bot`. Jorge prefiere hacerlo junto con el pase de
    los repos a privados.

## Deploy del webhook

`/opt/geo-webhook/` se actualiza a mano con `scp` y `systemctl restart`. No hay pull
ni CI. El camino está en [`vps/geo-webhook/README.md`](../vps/geo-webhook/README.md).
