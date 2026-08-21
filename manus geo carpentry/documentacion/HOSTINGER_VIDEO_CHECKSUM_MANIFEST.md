# Manifiesto de verificación de videos — Hostinger

Este manifiesto documenta los siete videos que estaban pendientes en el archivo local. Cada entrada se calculó mediante SHA-256 en el equipo local y se contrastó con el checksum devuelto por la importación interna y la auditoría de Hostinger. Los originales locales no fueron modificados.

| Archivo y ruta local | Tamaño (bytes) | SHA-256 local = Hostinger | Resultado remoto |
|---|---:|---|---|
| `202306_a\IMG_1881.MOV` | 320,291,267 | `fd16fa7cae62a8d167eead7e53a1ad0c6fbeeca830a57cd0913ee110135c5910` | Mismo tamaño, checksum y `backupVerified=1` |
| `202307_a\IMG_1955.MOV` | 400,287,851 | `d028023bcdbc8ffe9570aff422a10c45b44f19af5039f6adeb7db0013d030ec8` | Mismo tamaño, checksum y `backupVerified=1` |
| `202307_a\IMG_1960.MOV` | 747,979,998 | `f82a9d09cc6424ed4d3f2fe0de54865b86209e08c9deaf11aed10470f1c5de90` | Mismo tamaño, checksum y `backupVerified=1` |
| `202307_a\IMG_2008.MOV` | 375,011,320 | `d480d2e7c319d6338486cf151f74ad11f13432e57189d457c30972cab39d4dee` | Mismo tamaño, checksum y `backupVerified=1` |
| `202308_a\IMG_2135.MOV` | 356,076,502 | `51ab865c03be70fd81c779e5d8b0d2d7328763edd927fcd90126c74c4dc1f7ff` | Mismo tamaño, checksum y `backupVerified=1` |
| `IMG_4042.MOV` | 351,127,627 | `10324d67e8a6d76d9277e57e23c14996b8a5685a9a1dcd52a67b6dcff105c87d` | Mismo tamaño, checksum y `backupVerified=1` |
| `202306_a\IMG_1935.MOV` | 1,300,208,960 | `c57b17be1980f40ae78ede1e9001ab10291f18acfd0eb04398851553ef0519b0` | Mismo tamaño, checksum y `backupVerified=1` |

Los videos se transfirieron por SFTP al VPS de Hostinger, se almacenaron en MinIO desde el servicio local y se validaron por tamaño y checksum antes de registrar cada medio. La auditoría remota comparó los siete registros de `media_assets` contra el manifiesto y devolvió `verified=true`, `matched=7` y `backupVerified=7`. La ruta temporal usada para la importación se retiró al finalizar.
