# Configuración segura de acceso

## Regla de protección

No añadir valores de credenciales, tokens, claves privadas, contraseñas, archivos `.env`, cookies, cadenas de conexión ni volcados de base de datos a este repositorio.

El operador que necesite acceso debe recibir permisos al proyecto administrado y configurar o reutilizar los secretos desde el panel seguro correspondiente. Los valores existentes deben mantenerse fuera de GitHub y de cualquier conversación.

| Variable o dato protegido | Finalidad |
|---|---|
| `DATABASE_URL` | Persistencia de la biblioteca y metadatos. |
| `JWT_SECRET` | Sesión y base de cifrado de tokens de Facebook. |
| `BUILT_IN_FORGE_API_URL` / `BUILT_IN_FORGE_API_KEY` | Almacenamiento e IA en el servidor. |
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` / `FACEBOOK_PAGE_ID` | Integración de Facebook. |
| Token de acceso de Página | Publicación manual en Facebook; se almacena cifrado tras OAuth. |
| `OWNER_OPEN_ID` / `OWNER_NAME` | Control de acceso y recuperación de importaciones. |
| `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL` | Autenticación de la aplicación. |

## Facebook

La aplicación ya contiene código para OAuth, cifrado de token y publicación manual. Al empaquetar, no había conexión OAuth de Facebook almacenada en la base de datos. Antes de publicar, conecta la Página desde el flujo de la aplicación y comprueba los permisos solicitados. Nunca pegues el token de Página ni el secreto de la aplicación en este archivo.

## Medios originales

La copia local maestra está en `C:\GeoCarpentry_Media_Archive\01_INBOX_IPHONE`. Debe conservarse intacta. Los archivos originales no pertenecen al repositorio de código; se administran como datos privados de negocio.
