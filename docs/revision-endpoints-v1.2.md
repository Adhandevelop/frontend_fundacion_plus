# Revisión de endpoints_info.md — backend PLUS v1.2

> **Revisión histórica:** este análisis corresponde a la primera entrega del manual v1.2. El backend corrigió posteriormente estos contratos y se sincronizaron `endpoints_info.md` y `endpoints.md` desde su entrega 1.2.0. Los pendientes de esta revisión no deben interpretarse como fallos actuales. Consultar [la integración de acceso y perfil](integracion-acceso-perfil.md) para el estado comprobado y las limitaciones vigentes.

Fecha: 9 de noviembre de 2026. Fuente: [`endpoints_info.md`](../endpoints_info.md). Comparación con [`endpoints.md`](../endpoints.md), la revisión OpenAPI previa y las vistas actuales.

## Resultado

La documentación v1.2 permite empezar la integración por módulos. Define autenticación JWT, perfiles, catálogos, contenido público, mapa, radicación, expediente, archivos, mensajes, notificaciones y operaciones administrativas. Varias dudas de la revisión anterior ya están respondidas; no corresponde seguir solicitándolas como si faltaran.

Esta revisión es documental: no se hicieron peticiones al servidor, no se verificaron migraciones ni permisos y no se modificó Angular. La presencia de una ruta en el manual no demuestra que la versión desplegada la implemente.

## Aclaraciones que ya están resueltas

| Tema | Contrato documentado en v1.2 |
|---|---|
| Acceso y registro | Respuesta con `user` y `tokens`; JWT en `tokens.access` y `tokens.refresh`. Cabecera `Authorization: Bearer <access>`. |
| Renovación | `POST /api/v1/auth/refresh/` con `refresh`; devuelve `access`. |
| Recuperación de contraseña | Solicitud por correo; validación con `token`; confirmación con `token`, `new_password` y `new_password_confirm`. |
| Errores | Sobre común `code`, `message`, `errors`. |
| Listados | Paginación `count`, `next`, `previous`, `results`; catálogos pueden devolver arrays. |
| Acciones de expediente | Se detallan entradas para moderar, solicitar corrección, asignar, registrar avances y resolver. |
| Mapa | GeoJSON `FeatureCollection`, puntos `[longitud, latitud]`, propiedades del caso y reglas de ubicación pública. |
| Archivos | Campos multipart, extensiones, límite por archivo y descarga privada binaria con `?download=1`. |
| Perfil | Fotografía, preferencias y cambio de contraseña definidos. |
| Rutas antes solicitadas | Aparecen `/public/site/`, galerías por iniciativa, propuestas públicas y suscripciones, con alias de compatibilidad. |

## Imágenes y otros adjuntos

El contrato de subida sí está contemplado:

| Operación | Campo multipart |
|---|---|
| Evidencia individual | `file` o `archivo` |
| Archivos iniciales del caso o de un aporte | `files` o `archivos` |
| Foto de perfil | `photo` o `foto` |
| Portada/multimedia de noticias e iniciativas | `archivo` o `imagen_portada` |

El límite global documentado es **15.728.640 bytes por archivo**. Extensiones: JPG, JPEG, PNG, WEBP, GIF, PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, MP4, MP3, WAV y OGG. No se debe asumir WEBM permitido porque lo admitía una vista de demostración. Los límites provisionales del frontend deben ajustarse; cada formulario puede aceptar un subconjunto apropiado al recurso.

La foto devuelve `foto_url`, con ejemplo `/media/profiles/uuid_avatar.jpg`. Las evidencias privadas se descargan por el endpoint autenticado con `?download=1`; sin ese parámetro se documentan metadatos y `download_url`. La consulta pública de evidencias aplica filtros de publicación/aprobación.

**Queda por comprobar el almacenamiento y la entrega en producción.** El manual no concreta el `MEDIA_ROOT`, su correspondencia con el volumen persistente ni qué servicio entrega las URLs públicas. En el compose compartido existe `plus_media:/app/media`, pero esto no prueba que Django escriba allí.

La configuración local [`docker/nginx.conf`](../docker/nginx.conf) solo reenvía `/api/`: no tiene una ruta `/media/`. Una URL de imagen `/media/...jpg` intentaría leerse en los estáticos del frontend y devolvería 404 si no existe allí. Debe definirse una entrega pública concreta para fotos/portadas, mediante almacenamiento o servicio autorizado. No se debe exponer todo el volumen de medios: los adjuntos privados conservan su descarga con permisos. También debe verificarse el límite de cuerpo en ambos Nginx; admitir 15 MB por archivo requiere considerar el tamaño total de una petición con varios adjuntos.

## Diferencias entre documentos que afectan a Angular

El manual v1.2 es más reciente que el OpenAPI local v1.0.0. Sus contratos no son intercambiables. Antes de generar clientes o cerrar DTO, alinear `/api/v1/schema/` con v1.2 y comprobar qué versión está desplegada.

| Tema | Diferencia relevante / ajuste requerido |
|---|---|
| Identificadores | Catálogos y varias rutas describen UUID, mientras radicación y asignación muestran relaciones numéricas. Confirmar el tipo aceptado/devuelto por cada campo; no convertir todo a UUID ni a número. |
| Restablecimiento | El OpenAPI anterior exigía `uid`; v1.2 muestra solo `token`. Usar el contrato actualizado comprobado. |
| Preferencias | v1.2 usa `notificar_correo`, `notificar_plataforma`, `notificar_mensajes`, `notificar_avance_casos`, `recibir_boletin`, `perfil_publico_comentarios`; difieren de campos anteriores. |
| Publicación de casos | v1.2 separa moderación de publicación; esta última usa `borrador`, `publicado_anonimo`, `publicado_completo`, `oculto`, `archivado`. No reutilizar el enum anterior de aprobación. |
| Estados operativos | Se documentan códigos como `recibido` y `en_gestion`, con equivalencias SQL. Consumir opciones/catálogos y acordar el código estable de escritura. |
| Comunidades | `tipo_comunidad` distingue urbana/rural/indígena/afrodescendiente/campesina/otra; la vista y el DDL anterior usaban barrio/vereda/etc. Son clasificaciones distintas; falta acordar su correspondencia. |
| Noticias y propuestas | Cambian nombres de propiedades respecto al OpenAPI anterior; por ejemplo `resumen`, `es_destacada`, `nombre_proponente`, `telefono_proponente`, `estado_revision`. Adaptar por recurso. |
| Aportes | Se describen como seguimientos `respuesta_ciudadano`, con archivos vinculados a `id_seguimiento`. No asumir una entidad `id_aporte` independiente. |
| Comentarios | La acción acepta `aprobado`, `rechazado`, `oculto`. La demostración también permite volver a pendiente; esa transición no está documentada para esta acción. |
| Identidad | Registro y usuarios necesitan `nombres` y `apellidos`; separar los campos de las vistas sin inferir apellidos desde un nombre completo. |

**Moderación de comentarios:** el manual indica expresamente que `motivo` se guarda en auditoría **y se envía al autor en una notificación**. La vista de demostración lo trata como nota interna. Hay que cambiar esa presentación antes de conectar la acción, o definir un campo interno independiente con el backend.

## Aclaraciones y verificaciones que siguen pendientes

1. **Cierre de sesión JWT.** Se recomienda JWT, pero logout solo describe invalidar `authtoken_token`. Aclarar si el `refresh` se revoca/blacklistea y cómo se comportan los JWT ante suspensión de cuenta. No afirmar revocación de JWT por borrar el token DRF.
2. **DTO completos donde hay resúmenes.** Algunos detalles, dashboards y CRUD administrativos enumeran recursos o usan `[...]`, sin todos los campos, tipos y restricciones. Se puede avanzar con operaciones definidas; las restantes necesitan el esquema actualizado o respuestas reales de prueba antes de tiparlas.
3. **Mensajería y lectura.** Concretar la forma de respuesta del listado de mensajes y si marcar como leído acepta un límite de mensaje/fecha para no incluir mensajes llegados después de abrir la conversación.
4. **Roles y ámbitos.** Verificar el catálogo real, las capacidades de `/me/` y la matriz de acceso. No deducir permisos solo por el nombre de un rol ni implementar multirrol porque una respuesta incluya `roles`.
5. **Entorno desplegado.** Comprobar URL base, versión de esquema y respuestas de prueba con cuentas de ciudadano y administración. No hacen falta contraseñas en la documentación; las credenciales se mantienen fuera del repositorio.

Estas aclaraciones afectan operaciones concretas; no bloquean todo el frontend ni demuestran que falten tablas.

## Orden de integración recomendado

1. Configuración de API, cliente HTTP, manejo de errores, autenticación, renovación, `/me/` y guards basados en capacidades.
2. Catálogos y contenido público: inicio, noticias, iniciativas, mapa y detalle público.
3. Portal ciudadano: perfil, radicación, adjuntos, expediente y correcciones.
4. Mensajes, notificaciones y seguimiento de casos.
5. Administración: expediente y moderación; después usuarios/ámbitos, contenidos, informes y auditoría, cerrando los DTO pendientes por módulo.

En cada módulo se sustituye la simulación por su servicio REST y se comprueban carga, vacío, validación, errores y permisos. No se deben presentar datos de demostración como si fueran respuestas del servidor.
