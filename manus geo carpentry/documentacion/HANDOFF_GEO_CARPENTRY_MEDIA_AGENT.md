# Handoff técnico y operativo — Geo Carpentry Media Agent

> **Propósito.** Este documento permite que cualquier operador continúe el proyecto sin reinterpretar el trabajo anterior. El estado descrito se obtuvo de una auditoría directa del código, la base de datos y el equipo local conectado al cierre de la sesión.

## 1. Resumen ejecutivo

**Geo Carpentry Media Agent** es una aplicación privada para respaldar y organizar fotos y videos de Geo Carpentry. Guarda los originales en almacenamiento administrado, comprueba cada carga mediante SHA-256, propone limpieza no destructiva, clasifica imágenes con IA y prepara borradores de contenido. Nunca elimina archivos del iPhone ni de la copia local.

La importación de fotos está completa: **448 imágenes únicas** están almacenadas y verificadas. La importación de videos se detuvo de forma controlada durante un lote: hay **40 videos verificados** y faltan **77 videos únicos**. La clasificación asistida de las fotos **todavía no se ha ejecutado**, por lo que las 448 imágenes siguen en `Pendiente de revisar`. No hay publicaciones creadas, proyectos definidos ni acciones de limpieza aprobadas.

| Área | Estado al handoff | Acción de continuidad |
|---|---|---|
| Imágenes | 448/448 originales únicos respaldados y verificados | Ejecutar clasificación asistida por lotes y revisar resultados. |
| Videos | 40/117 únicos respaldados y verificados | Cargar los 69 videos de hasta 250 MB, luego los 7 de carga directa; decidir cómo tratar 1 video mayor de 1 GB. |
| Duplicados locales | 61 duplicados exactos detectados mediante SHA-256 | No se cargaron como originales separados; no borrar nada localmente. |
| Limpieza | 30 propuestas automáticas por posible borrosidad | Revisar visualmente; no aprobar ni borrar por defecto. |
| Facebook | Código y secretos de configuración previstos; **sin conexión OAuth almacenada** | Conectar y autorizar la Página desde el flujo de Facebook antes de publicar. |
| Seguridad | Canal temporal de transferencia retirado | Usar el flujo autenticado normal de la aplicación para futuras cargas. |

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

### Videos pendientes y restricciones

| Grupo de video único | Cantidad | Tratamiento previsto |
|---|---:|---|
| Hasta 250 MB | 109 en total; 40 ya cargados; **69 pendientes** | Carga estándar por navegador autenticado. |
| Entre 250 MB y 1 GB | 7 | Usar el flujo de **carga directa** integrado en la aplicación. |
| Mayor de 1 GB | 1 | `202306_a\IMG_1935.MOV` (~1.21 GB). Mantener original; elegir una carga por partes, una copia derivada o ampliar el límite antes de transferirlo. |

Los siete videos de carga directa identificados son `IMG_1960.MOV`, `IMG_1955.MOV`, `IMG_2008.MOV`, `IMG_2135.MOV`, `IMG_4042.MOV`, `IMG_1881.MOV` e `IMG_1947.MOV`. Deben permanecer sin cambios en el archivo local hasta comprobar un respaldo remoto verificado.

## 4. Estado real de la biblioteca remota

La base de datos se consultó después de detener la transferencia interrumpida. Todos los elementos actualmente registrados están verificados.

| Tipo | Cantidad | Verificados | Tamaño total aproximado | Categoría actual | Origen de clasificación |
|---|---:|---:|---:|---|---|
| Imágenes | 448 | 448 | 1,144.73 MB | `Pendiente de revisar` | Sin clasificar aún |
| Videos | 40 | 40 | 655.21 MB | `Videos` | Inicial por formato |
| **Total** | **488** | **488** | **1,799.94 MB** | — | — |

La transferencia se hizo por lotes y cada elemento confirmado pasó por verificación de tamaño y checksum después de guardarse. La conexión del equipo Windows se desconectó durante el cuarto lote de videos; el proceso se detuvo deliberadamente. No hay evidencia de pérdida de datos: la consulta final confirma 488 registros verificados.

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

La clasificación por lotes usa `media.analyzeBatch` con un máximo de 20 elementos por llamada; la interfaz expone un control de 12. El modelo configurado es `gemini-3-flash-preview` y devuelve una categoría, confianza y nota estructuradas. Las categorías válidas son:

| Categoría | Uso esperado |
|---|---|
| `Trabajos de Geo Carpentry` | Obras, acabados, materiales, herramientas, interiores o exteriores construidos y procesos de trabajo. |
| `Personal` | Material privado no destinado al negocio. |
| `Capturas de pantalla` | Interfaces, mensajes, referencias o imágenes de pantalla. |
| `Videos` | MOV y MP4; se asigna inicialmente por formato. |
| `Pendiente de revisar` | Imagen ambigua o que requiere decisión humana. |

> **Regla para el siguiente operador:** ejecutar la clasificación en lotes de 12 o 20 desde la interfaz hasta agotar los candidatos. Revisar especialmente las clasificaciones `Personal`, `Trabajos de Geo Carpentry` y cualquier nota de baja confianza antes de utilizar el contenido en calendario o redes.

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

Para importar desde el equipo Windows conectado se habilitó temporalmente una ruta autenticada de transferencia. Ese acceso temporal fue **retirado antes de generar este handoff**. El código actual no conserva la ruta temporal ni su token. No reutilizar valores de comandos, registros de terminal o mensajes anteriores.

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
| Respaldo remoto actual | 488/488 archivos registrados están verificados. |

El árbol de trabajo debe mantenerse limpio salvo los documentos de handoff y seguimiento de la sesión antes de guardar el próximo checkpoint. No usar `git reset --hard`; ante un problema, restaurar mediante un checkpoint administrado.

## 10. Runbook de continuación recomendado

### Paso 1: validar antes de continuar

Iniciar sesión como propietario, abrir el panel de resumen y confirmar que se muestren **448 imágenes**, **40 videos** y **488 originales verificados**. Confirmar también que no se ha aprobado ningún candidato de limpieza.

### Paso 2: completar videos pequeños

Desde la aplicación autenticada, cargar los **69 videos únicos restantes de hasta 250 MB** en lotes moderados. Esperar a que cada lote termine y verificar el contador de originales. Cada video deberá quedar en la categoría `Videos` automáticamente.

### Paso 3: completar videos grandes

Para los **7 videos entre 250 MB y 1 GB**, usar el flujo de carga directa que ya incorpora la aplicación. Para `IMG_1935.MOV` (~1.21 GB), no cambiar ni borrar el original: implementar una transferencia por partes, incrementar el límite de manera justificada o generar una copia derivada para publicación manteniendo el original local.

### Paso 4: clasificar imágenes

Usar **Clasificar 12** de forma repetida hasta que el conjunto `Pendiente de revisar` se reduzca a las imágenes ambiguas. La IA no debe tener la última palabra: comprobar las categorías de trabajo, personal y capturas antes de asignar proyectos o preparar contenido.

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
| Videos estándar por respaldar | 69 únicos de hasta 250 MB | Alta |
| Videos de carga directa | 7 entre 250 MB y 1 GB | Alta |
| Video fuera del límite actual | 1, `IMG_1935.MOV` (~1.21 GB) | Media; requiere decisión técnica. |
| Clasificación IA de imágenes | 448 imágenes | Alta |
| Revisión humana de baja certeza | A determinar después de clasificación | Alta |
| Propuestas de borrosidad | 30 | Media; nunca automática. |
| Proyectos, etapas y calendario | Sin configurar | Media |
| OAuth de Facebook y publicación de prueba | Sin conexión almacenada | Media |

---

**Handoff preparado para continuidad segura.** Si se cambia el entorno, se rota `JWT_SECRET` o se modifica el proveedor de almacenamiento, revisar primero la compatibilidad con los tokens de Facebook cifrados y con los enlaces almacenados de los medios.
