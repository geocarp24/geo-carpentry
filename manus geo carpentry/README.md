# Manus Geo Carpentry — paquete de continuidad

Esta carpeta conserva el código y la documentación de continuidad de **Geo Carpentry Media Agent**. Está preparada para que un nuevo operador técnico pueda retomar el proyecto sin depender de conversaciones anteriores.

## Contenido

| Ruta | Contenido |
|---|---|
| `app-source/` | Copia del código fuente, pruebas, migraciones, configuración no sensible y listas de tareas. |
| `documentacion/HANDOFF_GEO_CARPENTRY_MEDIA_AGENT.md` | Estado operativo auditado, inventario, avances, pendientes y runbook de continuidad. |
| `documentacion/guia_uso_y_alojamiento.md` | Manual de uso, arquitectura y recomendación de alojamiento. |
| `documentacion/media-import-2026-08-16.md` | Inventario y resultado de los lotes iniciales de respaldo. |
| `documentacion/validation-media-import.md` | Validaciones funcionales y de interfaz de la importación. |
| `CONFIGURACION_SEGURA.md` | Variables requeridas y procedimiento seguro para aportar acceso a otro operador. |

> Este repositorio no contiene archivos `.env`, tokens, contraseñas, claves privadas, secretos de Facebook, cadena de base de datos, registros internos ni dependencias generadas. Los originales de la biblioteca de medios tampoco se copian a GitHub.

## Estado al empaquetar

El paquete documenta **488 medios verificados** en la biblioteca remota: 448 imágenes y 40 videos. El inventario original conserva 69 videos estándar pendientes, 7 videos de carga directa y 1 video mayor de 1 GB. La clasificación asistida de las 448 imágenes sigue pendiente.

Lee primero el handoff completo antes de realizar cargas, clasificación, limpieza o publicación social.
