# Actualización de Hostinger y biblioteca de medios

**Fecha de actualización:** 19 de agosto de 2026
**Estado:** Biblioteca principal migrada y verificada en Hostinger; tareas externas y manuales claramente separadas.

## Resumen ejecutivo

La aplicación activa en `https://media.geocarpentry.com` fue recuperada, respaldada y actualizada desde su despliegue real en Hostinger. Hostinger queda como la **biblioteca principal visible**. La migración se realizó de manera no destructiva, con comprobación de checksum por archivo y sin eliminar los originales locales.

La biblioteca visible conserva **565 originales verificados**: 448 imágenes y 117 videos. La aplicación cuenta además con una vista de **Revisión editorial** que permite inspeccionar 189 medios de trabajo sin publicar, borrar, aprobar limpieza ni asignar proyectos automáticamente.

| Área | Estado verificado |
|---|---|
| Biblioteca principal de Hostinger | 565/565 originales respaldados y verificados |
| Imágenes | 448 |
| Videos | 117, incluidos los siete que requerían transferencia interna al VPS |
| Medios de trabajo | 189 |
| Medios personales | 173 |
| Capturas de pantalla | 44 |
| Pendientes de revisión | 42 |
| Propuestas de limpieza | 30, todas conservadas como `Propuesto` |
| Publicaciones y calendario aprobados | Ninguno |

## Trabajo realizado

Se recuperó el despliegue existente de Hostinger y se documentó su topología sin publicar contraseñas, direcciones IP, usuarios ni llaves privadas. La aplicación ejecuta su servicio de Node detrás de Nginx, utiliza MySQL y MinIO locales, y cuenta con un respaldo completo de código, base de datos y almacenamiento. La actualización se aplicó de forma reversible, preservando las compilaciones previas.

Se migraron los 558 medios del entorno administrado hacia Hostinger en lotes reanudables. La migración conservó los metadatos de categoría, confianza de clasificación y estado de revisión. Los ocho registros que existían en Hostinger fueron mantenidos como deduplicaciones exactas. Después se incorporaron siete videos locales que no estaban incluidos en el conjunto administrado; cada uno se comparó por tamaño y SHA-256. El detalle está en `documentacion/HOSTINGER_VIDEO_CHECKSUM_MANIFEST.md`.

Se retiraron los canales temporales de exportación, importación, conciliación, limpieza e importación interna usados durante la migración. La verificación posterior confirmó que ya no se exponen como APIs operativas.

La aplicación tiene ahora una ruta `/revision-editorial`, disponible desde la navegación lateral como **Revisión editorial**. Es una vista de solo revisión: presenta los medios de trabajo, el proyecto real existente y el conteo de etapas; no crea publicaciones, no programa contenido y no modifica la biblioteca.

## Validación técnica

| Comprobación | Resultado |
|---|---|
| Tipado TypeScript | Correcto |
| Pruebas automatizadas | 15 pruebas aprobadas |
| Compilación de producción | Correcta |
| Servicio de Hostinger tras el despliegue | Activo |
| Vista pública de revisión editorial | Carga verificada |
| Manifiesto de siete videos locales | 7/7 coincidencias de tamaño y SHA-256 |

## Pendientes reales

No se deben confundir los pendientes siguientes con una pérdida de datos. Son tareas que requieren una decisión humana o un servicio externo.

| Pendiente | Requisito para continuar |
|---|---|
| Clasificar 40 imágenes restantes | Restablecer la disponibilidad del servicio de IA y volver a ejecutar la clasificación por lotes. |
| Asignar 189 medios de trabajo a obras | Proporcionar nombres reales de proyecto, ubicación y etapa. Usar `documentacion/PROJECT_ASSIGNMENT_TEMPLATE.md`. |
| Revisar 30 propuestas de limpieza | Decisión manual; no se realizará ninguna eliminación automática. |
| Integración de Meta | El token actual quedó sin uso y no hubo publicaciones. Rotar el secreto de Meta antes de reactivar publicaciones. |

## Contenido del paquete de soporte

La carpeta incluye el código fuente actual, el handoff técnico, el plan y la auditoría de migración, el manifiesto de videos, la guía editorial y la plantilla de asignación de obras. Se excluyeron archivos `.env`, tokens, contraseñas, llaves privadas, medios privados, dependencias generadas y registros internos.

> Este paquete sirve como referencia segura para mantenimiento futuro. Antes de aplicar cambios en producción, revisar `documentacion/HANDOFF_GEO_CARPENTRY_MEDIA_AGENT.md` y crear un respaldo verificable del VPS.
