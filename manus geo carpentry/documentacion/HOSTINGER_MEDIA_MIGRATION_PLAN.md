# Plan de migración de medios hacia Hostinger

## Propósito

Sincronizar la biblioteca administrada de Geo Carpentry con la biblioteca local de `media.geocarpentry.com` sin sustituir los 8 medios ya existentes, sin borrar originales y con capacidad de reversión. Este plan no ejecuta todavía ninguna transferencia.

## Inventario de origen verificado

| Tipo | Archivos | Tamaño total aproximado | Archivos > 1 GB |
|---|---:|---:|---:|
| Imágenes | 448 | 1.20 GB | 0 |
| Videos | 110 | 4.89 GB | 0 |
| **Total** | **558** | **6.09 GB** | **0** |

Los 558 registros tienen checksum SHA-256 único y respaldo verificado en el almacenamiento administrado. El destino de Hostinger usa una base MySQL y MinIO local independiente; actualmente conserva 8 medios.

## Diseño de la transferencia

La migración debe ejecutarse por lotes de 20 imágenes o 5 videos, con una tabla local de manifiesto que almacene por cada objeto: identificador de origen, checksum, clave de almacenamiento de origen, URL firmada temporal, clave de MinIO de destino, tamaño, estado y error. El proceso debe consultar el manifiesto antes de cada copia para que sea reanudable e idempotente.

> No se deben copiar URLs permanentes ni secretos de almacenamiento al VPS. Cada objeto se descarga mediante una URL firmada de corta duración generada en el entorno de origen y se carga directamente al endpoint MinIO local de Hostinger.

## Controles obligatorios

| Control | Criterio de aceptación |
|---|---|
| Respaldo previo | Mantener el respaldo completo de Hostinger creado el 18 de agosto de 2026. |
| Aislamiento | Crear una nueva importación denominada `Migración Manus 2026-08` en Hostinger. |
| Integridad | Comparar SHA-256 de origen y destino antes de registrar cada medio como verificado. |
| Idempotencia | Reanudar por checksum; no crear una segunda copia si el objeto ya fue confirmado. |
| Datos | Migrar primero los registros MySQL con estado pendiente y marcar el respaldo solo después del checksum correcto. |
| Publicación | No publicar en Facebook ni cambiar candidatos de limpieza durante la migración. |
| Reversión | Si un lote falla, conservar el objeto de destino sin enlazarlo como respaldo verificado y registrar la incidencia. |

## Orden propuesto

Primero se transferirán 20 imágenes como lote piloto. Tras comprobar 20/20 checksums, se continuará con el resto de imágenes y después con los videos en lotes de 5. Al final se compararán conteo, bytes totales y checksums contra el manifiesto de origen. El lote piloto no modifica ni elimina la biblioteca existente de 8 medios.

## Dependencias pendientes

La migración requiere implementar una ruta de exportación temporal autenticada en el proyecto administrado y una ruta de importación temporal autenticada en el VPS. Ambas rutas deben eliminarse al cerrar la migración. También requiere rotar las credenciales de Meta antes de habilitar nuevamente cualquier publicación de Facebook.

## Avance de ejecución

El canal temporal autenticado se validó desde el VPS y se completó el lote piloto de 20 medios con checksum. Después se procesaron siete lotes adicionales de 20 medios mediante el ejecutor reanudable. El siguiente identificador seguro de origen es **120056**. La migración debe reanudarse desde ese identificador y verificarse contra el manifiesto local del VPS antes de marcar el lote completo como finalizado.

La verificación pública posterior confirmó **558/558 originales respaldados** en Hostinger. La primera transferencia preservó los archivos y checksums, pero las imágenes quedaron con clasificación inicial de pendiente de revisión. Antes de retirar los canales temporales, se debe ejecutar una conciliación de metadatos para restaurar las categorías, confianza y notas ya existentes en la biblioteca de origen.

La conciliación de metadatos se completó y la verificación pública confirmó la distribución esperada: 189 medios de trabajo, 173 personales, 44 capturas de pantalla, 110 videos y 42 pendientes de revisión. Los proyectos y el calendario siguen vacíos en origen. Las propuestas de limpieza se migrarán por separado: Hostinger muestra 3 propuestas heredadas, mientras que el origen conserva 30 para revisión manual.

La auditoría de Hostinger confirmó 558 registros y 558 checksums únicos. Ocho registros preexistentes permanecieron en la biblioteca como deduplicaciones exactas y 550 filas se incorporaron mediante la migración, por lo que no se perdió la biblioteca inicial. Los metadatos quedaron alineados: 408 medios con clasificación de IA y confianza registrada, 110 videos con clasificación inicial y 40 pendientes sin clasificación; los 558 conservan estado de revisión pendiente y no se asignaron etapas inexistentes en origen. Finalmente se registraron 30 propuestas de limpieza como `Propuesto`, sin aprobar ni borrar ningún medio.

Después de retirar las rutas temporales, la comprobación pública mostró una página vacía. La migración de datos permanece verificada, pero se requiere diagnosticar y corregir el artefacto final antes de considerar la actualización de Hostinger cerrada.

La consulta local de autenticación del VPS respondió correctamente y una recarga pública confirmó la recuperación del tablero. La biblioteca principal de `https://media.geocarpentry.com` ahora muestra 558/558 originales respaldados, 42 pendientes de revisión, 189 medios listos para calendario y 30 candidatos de limpieza. Las categorías visibles coinciden con la conciliación: 189 de trabajo, 173 personales, 44 capturas, 110 videos y 42 pendientes.

Como comprobación de cierre, las rutas `/api/media/temporary-migration/export`, `/import`, `/cleanup` y `/reconcile` respondieron únicamente con el respaldo HTML del servidor (tipo `text/html`) y no con una API de migración. Por tanto, los canales temporales ya no están operativos en Hostinger.

Después de incorporar los siete videos locales restantes, una comprobación visual mostró el armazón de la aplicación y una carga de datos en curso. La respuesta del servicio debe verificarse antes del siguiente checkpoint; no se debe interpretar el estado visual inicial como una pérdida de la biblioteca.

La ruta `/revision-editorial` quedó publicada y la navegación lateral la muestra correctamente. En la primera verificación, la ruta permaneció en estado de carga mientras se consultaban los datos; el servicio de Hostinger se mantuvo activo y la validación debe completarse antes de declarar la vista lista.

La verificación posterior confirmó la vista cargada. Muestra 189 medios de trabajo, todos sin proyecto, sin etapa y con revisión pendiente; presenta las 24 primeras piezas, los conteos de etapas en cero y el proyecto real existente `Obra · febrero de 2019`. La vista no ofrece acciones de publicación, calendario ni limpieza, por lo que preserva el estado no publicable y no destructivo de la biblioteca.
