# Handoff técnico y operativo — Geo Carpentry Media Agent

> **Propósito.** Este documento permite que cualquier operador continúe el proyecto sin reinterpretar el trabajo anterior. El estado descrito se obtuvo de una auditoría directa del código, la base de datos y el equipo local conectado al cierre de la sesión.

## 1. Resumen ejecutivo

**Geo Carpentry Media Agent** es una aplicación privada para respaldar y organizar fotos y videos de Geo Carpentry. Guarda los originales en almacenamiento administrado, comprueba cada carga mediante SHA-256, propone limpieza no destructiva, clasifica imágenes con IA y prepara borradores de contenido. Nunca elimina archivos del iPhone ni de la copia local.

La importación está completa: **448 imágenes únicas** y **117 videos únicos** están almacenados y verificados en Hostinger, para un total de **565 originales**. La IA clasificó 408 imágenes; las 40 restantes no pudieron procesarse porque el servicio de IA reportó agotamiento de uso. No hay publicaciones creadas, proyectos definidos ni acciones de limpieza aprobadas.

| Área | Estado al handoff | Acción de continuidad |
|---|---|---|
| Imágenes | 448/448 originales únicos respaldados y verificados; 408 clasificados por IA | Resolver la disponibilidad del servicio de IA y clasificar las 40 imágenes restantes; revisar resultados. |
| Videos | 117/117 únicos respaldados y verificados | Completado mediante transferencia local al VPS, checksum y almacenamiento MinIO. |
| Duplicados locales | 61 duplicados exactos detectados mediante SHA-256 | No se cargaron como originales separados; no borrar nada localmente. |
| Limpieza | 30 propuestas automáticas por posible borrosidad | Revisar visualmente; no aprobar ni borrar por defecto. |
| Facebook | Código y secretos de configuración previstos; **sin conexión OAuth almacenada** | Conectar y autorizar la Página desde el flujo de Facebook antes de publicar. |
| Seguridad | Canales temporales de transferencia y clasificación retirados | Usar el flujo autenticado normal de la aplicación para futuras cargas y clasificación. |

## 2. Identidad del proyecto y ubicaciones relevantes

| Elemento | Valor operativo |
|---|---|
| Nombre del proyecto | `Geo Carpentry Media Agent` |
| Directorio de código | `/home/ubuntu/geocarpentry-media-agent` |
| Cliente | React 19 + Vite + Tailwind 4 + shadcn/ui |
| Servidor | Express 4 + tRPC 11 |
| Persistencia | Drizzle ORM sobre MySQL/TiDB administrado |
| Almacenamiento | S3 administrado a través de los helpers de `server/storage.ts` |
| Autenticación | Manus OAuth; el propietario se identifica con `OWNER_OPEN_ID` |
| Copia local de origen | `C:\GeoCarpentry_Media_Archive\01_INBOX_IPHONE` en el equipo Windows conectado |
| Repositorio GitHub seleccionado | `geocarp24/geo-carpentry` |
| Rama compartida actual | `main`, con commit remoto `46f6d4d` al inicio de este handoff |

El archivo de instrucciones operativas es [`guia_uso_y_alojamiento.md`](guia_uso_y_alojamiento.md). El inventario inicial se documentó en [`media-import-2026-08-16.md`](media-import-2026-08-16.md). La lista de trabajo de esta sesión está en [`todo-rbbekgcq.md`](todo-rbbekgcq.md).

## 3. Estado del respaldo local

El respaldo local se examinó sin renombrar, mover, modificar ni borrar originales. No se encontraron archivos `AGENTS.md` en la carpeta de archivo ni en la raíz de la unidad consultada.

| Medida | Resultado |
|---|---:|
| Archivos totales en `01_INBOX_IPHONE` | 693 |
| Medios aceptados por la aplicación | 626 |
| Originales únicos por SHA-256 | 565 |
| Duplicados exactos locales | 61 |
| Archivos `.AAE` de ediciones Apple | 67 |
| Imágenes únicas | 448 |
| Videos únicos | 117 |

Los archivos `.AAE` son instrucciones de edición de Apple, no medios independientes. Deben conservarse junto al respaldo local, pero no se cargan a la biblioteca.

### Videos completados

Los **117 videos únicos** ya están respaldados y verificados en Hostinger. Los seis videos antes pendientes y `IMG_1935.MOV` (~1.21 GB) se transfirieron localmente por SFTP al VPS, se cargaron a MinIO desde el servidor y se validaron por SHA-256. La ruta interna temporal utilizada para esta excepción fue retirada tras la comprobación; los originales locales permanecen intactos.

## 4. Estado real de la biblioteca remota

La base de datos se consultó después de detener la transferencia interrumpida. Todos los elementos actualmente registrados están verificados.

| Tipo | Cantidad | Verificados | Tamaño total aproximado | Categoría actual | Origen de clasificación |
|---|---:|---:|---:|---|---|
| Imágenes | 448 | 448 | 1,144.73 MB | 189 Trabajo, 173 Personal, 44 Capturas, 42 Pendiente | IA para 408; 40 sin clasificar |
| Videos | 117 | 117 | Incluye los siete videos grandes verificados | `Videos` | Inicial por formato |
| **Total** | **565** | **565** | Biblioteca principal de Hostinger | — | — |

La transferencia se hizo por lotes y cada elemento confirmado pasó por verificación de tamaño y checksum después de guardarse. Los videos restantes se completaron mediante transferencia local al VPS y carga interna a MinIO, evitando el proxy web inestable. No hay evidencia de pérdida de datos: la verificación pública final confirma 565 registros verificados.

### Clasificación asistida actual

El modelo `gemini-3-flash-preview` clasificó 408 imágenes en lotes verificados. De ellas, 189 quedaron en `Trabajos de Geo Carpentry`, 173 en `Personal`, 44 en `Capturas de pantalla` y 2 en `Pendiente de revisar` por ambigüedad. Las otras 40 siguen en `Pendiente de revisar` sin origen de clasificación porque el servicio de IA devolvió un error de uso agotado; no se alteraron las imágenes ni se aplicó una clasificación estimada.

> Antes de reintentar la clasificación de las 40 imágenes restantes, restablecer la disponibilidad del servicio de IA mediante el canal de ayuda de Manus. Después usar el botón normal **Clasificar 12** o la acción `media.analyzeBatch`; no reactivar los canales temporales retirados.

### Limpieza, proyectos y calendario

| Elemento | Estado |
|---|---|
| Candidatos de limpieza | 30 en estado `Propuesto` |
| Aprobaciones de limpieza | 0 |
| Proyectos de construcción | 0 |
| Borradores o publicaciones de calendario | 0 |
| Historial de importaciones en `media_imports` | Consulta separada confirmada: no existen registros. La transferencia temporal no creó historial de importación. |

Las 30 propuestas de limpieza son alertas de posible borrosidad. No constituyen órdenes de eliminación y no deben aprobarse de forma masiva.

## 5. Flujo de carga y clasificación ya implementado

La aplicación ya incluye importación por lotes, reintentos en cliente, historial de importaciones y carga directa de archivos grandes. Los archivos relevantes son:

| Componente | Archivo | Responsabilidad |
|---|---|---|
| UI de biblioteca, carga y clasificación | [`client/src/pages/Home.tsx`](client/src/pages/Home.tsx) | Selección de archivos, historial, reintentos, filtros y acción `Clasificar 12`. |
| Carga estándar y directa | [`server/mediaUpload.ts`](server/mediaUpload.ts) | Límite estándar de 250 MB, carga directa hasta 1 GB, checksum y verificación remota. |
| Reglas de importación | [`server/mediaImportRules.ts`](server/mediaImportRules.ts) | Límites de 250 MB y 1 GB; selección de candidatos de clasificación. |
| Procedimientos de medios | [`server/routers/media.ts`](server/routers/media.ts) | Dashboard, importaciones, clasificación individual y por lotes, exportación y calendario. |
| Persistencia | [`server/db.ts`](server/db.ts) | Consultas de medios, importaciones, limpieza, proyectos y Facebook. |
| Reglas de clasificación y limpieza | [`server/mediaRules.ts`](server/mediaRules.ts) | Tipos admitidos, categoría inicial, duplicados y candidaturas de borrosidad. |

La clasificación por lotes usa `media.analyzeBatch` con un máximo de 20 elementos por llamada; la interfaz expone un control de 12. El modelo configurado es `gemini-3-flash-preview` y devuelve una categoría, confianza y nota estructuradas. En la última ejecución el servicio informó uso agotado después de clasificar 408 imágenes. Las categorías válidas son:

| Categoría | Uso esperado |
|---|---|
| `Trabajos de Geo Carpentry` | Obras, acabados, materiales, herramientas, interiores o exteriores construidos y procesos de trabajo. |
| `Personal` | Material privado no destinado al negocio. |
| `Capturas de pantalla` | Interfaces, mensajes, referencias o imágenes de pantalla. |
| `Videos` | MOV y MP4; se asigna inicialmente por formato. |
| `Pendiente de revisar` | Imagen ambigua o que requiere decisión humana. |

> **Regla para el siguiente operador:** tras restablecer la disponibilidad de IA, ejecutar la clasificación en lotes de 12 o 20 desde la interfaz hasta agotar los 40 candidatos no clasificados. Revisar especialmente las clasificaciones `Personal`, `Trabajos de Geo Carpentry` y cualquier nota de baja confianza antes de utilizar el contenido en calendario o redes.

## 6. Facebook, calendario y publicación

El proyecto ya contiene una integración con Facebook. Implementa OAuth, intercambio de token, token de Página cifrado con AES-256-GCM y publicación manual de imágenes o Reels. El token de Página se cifra usando una clave derivada de `JWT_SECRET`.

| Función | Estado |
|---|---|
| Variables de configuración de Facebook | Previstas en el entorno del proyecto. |
| Conexión OAuth de Página almacenada | No se encontró ninguna fila en `facebook_connections` durante la auditoría. |
| Publicación automática | No implementada ni permitida por el flujo actual. |
| Publicación manual de Feed y Reels | Implementada, pero requiere conexión de Página y revisión previa. |
| Stories | Se mantienen como borrador; no se publican desde la versión actual. |

La continuación correcta es conectar la Página desde el flujo de Facebook de la aplicación, confirmar que la cuenta autorizada tiene las autorizaciones requeridas y hacer una publicación de prueba solo después de revisar el medio y el copy. El código pide los permisos `pages_show_list`, `pages_read_engagement`, `pages_manage_posts` y `publish_video`.

## 7. Credenciales y secretos: inventario seguro

No se incluyen contraseñas, tokens de acceso, secretos de aplicación, claves de sesión, URL de base de datos ni valores de Facebook en este documento. Incluirlos expondría la cuenta, el archivo privado y la Página. El siguiente operador debe usar el panel seguro de secretos del proyecto o el mecanismo administrado de solicitud de secretos; **nunca** debe pedir ni copiar valores al chat, a Git ni a Markdown.

| Variable | Uso | Valor en este handoff |
|---|---|---|
| `DATABASE_URL` | Conexión a MySQL/TiDB | Protegido; administrado por la plataforma. |
| `JWT_SECRET` | Sesiones y clave base de cifrado para el token de Facebook | Protegido; no rotar sin plan de migración de tokens cifrados. |
| `BUILT_IN_FORGE_API_URL` | API administrada de almacenamiento e IA | Protegido; inyectado por la plataforma. |
| `BUILT_IN_FORGE_API_KEY` | Autorización de almacenamiento e IA del servidor | Protegido; inyectado por la plataforma. |
| `FACEBOOK_APP_ID` | Identificador de la aplicación de Meta | Protegido en el entorno. |
| `FACEBOOK_APP_SECRET` | Secreto de la aplicación de Meta | Protegido en el entorno; nunca exponer. |
| `FACEBOOK_PAGE_ID` | Página de Facebook objetivo | Protegido en el entorno. |
| Token de acceso de Página | Publicación en Facebook | No se entrega; se guarda cifrado en `facebook_connections` solo después del OAuth. |
| `OWNER_OPEN_ID` y `OWNER_NAME` | Identidad del propietario y recuperación del lote inicial | Protegidos; administrados por la plataforma. |
| `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL` | Flujo de Manus OAuth | Protegidos/integrados por la plataforma. |
| `VITE_FRONTEND_FORGE_API_URL`, `VITE_FRONTEND_FORGE_API_KEY` | Integración de frontend con servicios administrados | Protegidos/integrados por la plataforma. |
| `VITE_ANALYTICS_ENDPOINT`, `VITE_ANALYTICS_WEBSITE_ID` | Analítica del proyecto | Gestionados por la plataforma. |

**Cómo entregar acceso a otro operador de manera segura:** conceder acceso al proyecto en la plataforma y dejar que la plataforma inyecte los secretos existentes. Si es necesario cambiar un secreto, hacerlo desde el panel de secretos. No se debe copiar ningún valor de `FACEBOOK_APP_SECRET`, token de Página, `JWT_SECRET`, claves de almacenamiento o cadena de base de datos a esta guía, a GitHub o a conversaciones.

## 8. Seguridad y acceso temporal utilizado durante la sesión

Para importar desde el equipo Windows conectado se habilitaron temporalmente rutas autenticadas de transferencia, carga directa y clasificación. Todos esos accesos temporales fueron **retirados al cierre de esta actualización**. El código actual no conserva rutas temporales ni tokens. No reutilizar valores de comandos, registros de terminal o mensajes anteriores.

La carga normal sigue protegida por sesión autenticada. La ruta estándar es `/api/media/upload`; para archivos de más de 250 MB y hasta 1 GB están disponibles `/api/media/prepare-upload` y `/api/media/complete-upload`. Los archivos mayores de 1 GB requieren una estrategia nueva antes de cargarlos.

## 9. Cambios recientes y controles de calidad

| Commit / checkpoint | Cambio principal |
|---|---|
| `46f6d4d` | PWA móvil, caché segura del armazón, cola editorial Feed/Reel, OAuth de Facebook, token cifrado y publicación manual con confirmación. |
| `8298ded` | Recuperación del lote inicial, historial de importaciones, reintentos, carga directa de archivos grandes y clasificación asistida por lotes. |
| `9486684` | Inventario inicial, primer lote de 16 originales de `201902_a` verificados y guía de seguridad. |
| `07f03d9` | Apertura del proyecto y creación del seguimiento de la sesión. |

Al cierre se ejecutaron correctamente los controles técnicos:

| Verificación | Resultado |
|---|---|
| `pnpm check` | Correcto; TypeScript sin errores. |
| `pnpm test` | Correcto; 15 pruebas en 5 archivos. |
| Respaldo remoto actual | 558/558 archivos registrados están verificados. |

El árbol de trabajo debe mantenerse limpio salvo los documentos de handoff y seguimiento de la sesión antes de guardar el próximo checkpoint. No usar `git reset --hard`; ante un problema, restaurar mediante un checkpoint administrado.

## 10. Runbook de continuación recomendado

### Paso 1: validar antes de continuar

Iniciar sesión como propietario, abrir el panel de resumen y confirmar que se muestren **448 imágenes**, **110 videos** y **558 originales verificados**. Confirmar también que no se ha aprobado ningún candidato de limpieza.

### Paso 2: completar videos pequeños

No quedan videos estándar pendientes: los **109 videos de hasta 250 MB** están verificados y aparecen automáticamente en la categoría `Videos`.

### Paso 3: videos grandes

Este paso está completado: los siete videos que excedían el límite web ya se respaldaron y verificaron en Hostinger. Para futuras cargas superiores a 1 GB, planificar una transferencia interna o por partes antes de iniciar el proceso; no reactivar rutas temporales anteriores.

### Paso 4: clasificar imágenes

Restablecer primero la disponibilidad del servicio de IA y después usar **Clasificar 12** de forma repetida hasta que se procesen las 40 imágenes todavía sin clasificación. La IA no debe tener la última palabra: comprobar las categorías de trabajo, personal y capturas antes de asignar proyectos o preparar contenido.

### Paso 5: revisión editorial y social

Crear proyectos de construcción, marcar etapas `Antes`, `Durante` o `Después`, y generar exportaciones Feed o Stories solo para medios aprobados. Conectar Facebook después de verificar las credenciales en el panel seguro, crear un borrador y publicar manualmente una prueba tras confirmación explícita.

## 11. Reglas no negociables para el siguiente operador

1. No borrar, mover ni renombrar ningún original de `C:\GeoCarpentry_Media_Archive\01_INBOX_IPHONE`.
2. No aprobar propuestas de limpieza sin revisión visual y confirmación humana.
3. No exponer secretos, tokens, URL de base de datos ni credenciales de Facebook en documentos, código, terminal compartida o chat.
4. No publicar en Facebook automáticamente; conservar el paso de confirmación manual.
5. No fabricar reseñas, testimonios, calificaciones ni contenido que parezca generado por clientes.
6. Guardar un checkpoint antes de entregar una modificación funcional del proyecto.

## 12. Qué quedó pendiente exactamente

| Pendiente | Cantidad / detalle | Prioridad |
|---|---|---|
| Videos estándar por respaldar | Ninguno; 109 únicos de hasta 250 MB están verificados | Completado |
| Videos de carga directa | Completado; 117/117 únicos verificados | Completado |
| Video fuera del límite actual | Completado; `IMG_1935.MOV` fue transferido internamente y verificado | Completado |
| Clasificación IA de imágenes | 40 imágenes sin clasificar; servicio de IA no disponible por uso agotado | Alta; reintentar tras resolver disponibilidad. |
| Revisión humana de baja certeza | 2 imágenes clasificadas como `Pendiente de revisar` y revisión de las 406 clasificaciones de IA | Alta |
| Propuestas de borrosidad | 30 | Media; nunca automática. |
| Proyectos, etapas y calendario | Sin configurar | Media |
| OAuth de Facebook y publicación de prueba | Sin conexión almacenada | Media |

---

**Handoff preparado para continuidad segura.** Si se cambia el entorno, se rota `JWT_SECRET` o se modifica el proveedor de almacenamiento, revisar primero la compatibilidad con los tokens de Facebook cifrados y con los enlaces almacenados de los medios.

## 13. Despliegue real de Hostinger recuperado

La aplicación visible en `https://media.geocarpentry.com` se ejecuta en un VPS de Hostinger; no depende del panel hPanel ni de un flujo de GitHub Actions. La conexión reutilizable está configurada en el equipo local conectado como el alias SSH `alex-vps`. No se incluyen aquí su dirección, usuario, clave privada ni variables de entorno.

| Componente | Configuración verificada |
|---|---|
| Código activo | `/opt/geo-media` |
| Servicio | `geo-media.service` ejecuta `node /opt/geo-media/dist/index.js` |
| Proxy público | Nginx termina TLS y enruta `media.geocarpentry.com` a `127.0.0.1:3020` |
| Base de datos local | Contenedor `geo-media-mysql` |
| Almacenamiento local | Contenedor `geo-media-minio`, con objetos bajo `/opt/geo-media/data/minio` |
| Configuración sensible | `/opt/geo-media/.env`; no copiar, mostrar ni versionar |
| Staging actual | `/opt/geo-media-staging-20260818T0632Z` |

Antes de la actualización se creó el punto de restauración local `/opt/geo-media/backups/preupdate-code-db-20260818T0620Z`. Después se verificó el respaldo completo `/opt/geo-media/backups/full-snapshot-20260818T0650Z`: incluye código, base MySQL, una copia protegida del archivo de entorno y una instantánea de MinIO mediante enlaces duros con manifiesto de 41 objetos. Sus checksums de código y base de datos fueron comprobados en el VPS. El almacenamiento de producción no se modificó durante la instantánea.

La compilación actualizada se activó de manera reversible el 18 de agosto de 2026. Se preservaron las versiones anteriores de `dist` y `node_modules` en directorios con el prefijo `preupdate-`. La compatibilidad de acceso abierto de Hostinger se integró de forma explícita mediante `OPEN_ACCESS=true`; si esa variable no está activada, la aplicación conserva el flujo de autenticación habitual. Tras una exposición durante la auditoría, se rotaron en el VPS las credenciales internas de sesión, MySQL, MinIO y el acceso SSH; no se registraron sus valores ni claves. La verificación pública posterior confirmó que `media.geocarpentry.com` responde correctamente. Las credenciales de Meta deben rotarse desde el portal de Meta antes de reutilizar funciones de Facebook.

> **Importante:** Hostinger conserva una biblioteca local distinta, que en la verificación pública contiene 8 medios. El entorno administrado de este proyecto conserva 558 medios verificados. La actualización de código no migra automáticamente esos medios ni sus metadatos entre bases de datos y almacenamientos separados. Cualquier sincronización de los 558 medios requiere una migración dedicada, con una nueva copia de seguridad, verificación SHA-256 y validación de almacenamiento antes de alterar la biblioteca local de Hostinger.

## 14. Estado final de la migración a Hostinger

La migración dedicada ya se completó. **Hostinger es ahora la biblioteca principal visible** en `https://media.geocarpentry.com`, con **565/565 originales verificados**. Los ocho registros que existían previamente se conservaron como deduplicaciones exactas; se incorporaron 550 registros adicionales desde la biblioteca administrada y siete videos locales adicionales mediante transferencia interna verificada. La actualización no eliminó originales, no aprobó limpiezas y no creó publicaciones.

| Verificación | Resultado en Hostinger |
|---|---:|
| Originales verificados | 565/565 |
| Trabajo | 189 |
| Personal | 173 |
| Capturas de pantalla | 44 |
| Videos | 117 |
| Pendientes de revisión | 42 |
| Propuestas de limpieza | 30, todas en `Propuesto` |

Las categorías, la fuente de clasificación, la confianza y el estado de revisión se conciliaron sin transferir archivos por segunda vez. Los 408 medios clasificados por IA conservaron su confianza; los 117 videos conservaron clasificación inicial y 40 imágenes continúan sin clasificación por el bloqueo externo del servicio de IA. El manifiesto `HOSTINGER_VIDEO_CHECKSUM_MANIFEST.md` contrasta los siete videos internos por tamaño y SHA-256. Los canales temporales de exportación, importación, conciliación y limpieza se retiraron y sus cuatro rutas responden únicamente con el respaldo HTML del servidor, no con una API operativa.

La ruta `/revision-editorial` añade una vista no publicable de los 189 medios de trabajo. Muestra el proyecto real existente `Obra · febrero de 2019`, mantiene los medios sin proyecto ni etapa hasta una confirmación humana y no ofrece acciones de publicación, calendario ni limpieza.

La única continuación requerida no es de migración: solicitar la reactivación de IA en https://help.manus.im para clasificar las 40 imágenes restantes; revisar manualmente las 30 propuestas de limpieza; y rotar el secreto de Meta antes de volver a habilitar cualquier flujo de publicación. La instrucción vigente del propietario es conservar el token de Meta actual hasta la entrega final y no publicar contenido.
