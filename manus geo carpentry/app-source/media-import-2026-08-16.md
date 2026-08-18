# Inventario inicial de respaldo — 16 de agosto de 2026

La carpeta local `C:\GeoCarpentry_Media_Archive\01_INBOX_IPHONE` contiene **693 archivos**, de los cuales **626** son medios admitidos por la aplicación (aproximadamente **13.78 GB**). El inventario incluye 352 HEIC, 91 JPG, 46 PNG, 127 MOV y 10 MP4. También hay 67 archivos `.AAE`, que son instrucciones de edición de Apple y no se cargan como medios.

La carga actual acepta archivos individuales de hasta **250 MB**. Catorce videos MOV superan ese límite y se excluyen de este primer proceso hasta habilitar un flujo adecuado para archivos grandes. Se detectaron también posibles duplicados por tamaño y nombre; la aplicación verificará cada archivo mediante SHA-256 antes de considerarlo respaldado.

> Principio operativo: los originales permanecen intactos en el respaldo local. Cualquier carga crea una copia verificada y no elimina, renombra ni mueve el archivo de origen.

## Resultado del lote inicial

Se revisó la carpeta `201902_a`, que contenía 32 archivos JPG. Las comprobaciones SHA-256 confirmaron que corresponden a **16 originales únicos** y **16 duplicados exactos**. Se respaldaron los 16 originales únicos de forma secuencial; los **16/16** quedaron verificados tanto en el almacenamiento como en la biblioteca de la aplicación. El panel muestra además tres propuestas de limpieza asociadas a imágenes potencialmente borrosas; son solamente propuestas y no se ha eliminado ni marcado ningún archivo para borrado.

El canal temporal autenticado utilizado exclusivamente para esta transferencia se retiró al terminar el lote.
