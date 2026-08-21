# Recuperación de despliegue — media.geocarpentry.com

> Estado documentado el 18 de agosto de 2026. Este registro contiene únicamente la topología y el procedimiento no sensible; no incluye claves privadas, contraseñas, variables de entorno ni tokens.

## Hallazgos verificados

| Elemento | Estado |
|---|---|
| URL pública | `https://media.geocarpentry.com` |
| Infraestructura | VPS de Hostinger con Nginx y un proceso Node.js administrado por systemd |
| Directorio de la aplicación | `/opt/geo-media` |
| Servicio | `geo-media.service` |
| Proxy | Nginx enruta el dominio al proceso interno en `127.0.0.1:3020` |
| Persistencia local | Contenedores `geo-media-mysql` y `geo-media-minio` |
| Copias locales del sitio | El directorio contiene paquetes `geo-media-*.zip` y scripts bajo `vps/` |

La versión pública detectada muestra una biblioteca anterior de 8 medios. No corresponde al estado administrado actual de Geo Carpentry Media Agent, que tiene 558 originales verificados.

## Procedimiento seguro de actualización

1. Respaldar en el VPS el código actual, la base de datos MySQL local y los objetos MinIO antes de tocar el servicio.
2. Preparar una copia de la aplicación actual en un directorio de staging separado, preservando en el despliegue activo `.env`, `data/` y los contenedores existentes.
3. Construir y ejecutar pruebas en staging antes de reiniciar `geo-media.service`.
4. Validar localmente el proxy de Nginx y después `https://media.geocarpentry.com`.
5. No copiar secretos del proyecto administrado al VPS en documentos ni en comandos visibles. Cualquier variable necesaria debe introducirse directamente en el archivo de entorno seguro del VPS.

## Restricción conocida

El servidor de Hostinger conserva su propia base de datos y almacenamiento local. Actualizar únicamente el código no sincroniza los 558 medios administrados ni sus metadatos. La actualización debe decidir explícitamente si se mantiene la biblioteca local existente, se realiza una migración segura de datos, o se configura el VPS para usar una fuente de datos compatible.
