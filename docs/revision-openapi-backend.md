# Revisión de endpoints entregados por el backend

> **Estado posterior:** las copias locales del manual y del OpenAPI ya se sincronizaron con la entrega corregida 1.2.0 del backend. Este documento conserva el análisis de la entrega anterior. Ver [integración de acceso y perfil](integracion-acceso-perfil.md) para el estado actual.

> **Actualización:** el backend añadió el manual [`endpoints_info.md`](../endpoints_info.md), versión 1.2. Resuelve varias dudas registradas en esta revisión del OpenAPI 1.0.0 y también introduce diferencias de contrato. Consultar la [revisión v1.2](revision-endpoints-v1.2.md) antes de usar los pendientes de este documento. Aún debe alinearse el esquema OpenAPI con el manual y comprobarse la versión desplegada.

Revisión del **9 de noviembre de 2026**, sobre [`endpoints.md`](../endpoints.md), que contiene YAML **OpenAPI 3.0.3**, API versión **1.0.0**.

## 1. Resultado y alcance

La entrega documenta **170 rutas, 292 operaciones HTTP y 127 esquemas de componentes**. Incluye alias/compatibilidad: no son 292 funciones distintas. El YAML se pudo analizar y las referencias locales a esquemas revisadas resuelven; esto no equivale a una validación exhaustiva OpenAPI ni a probar el servidor.

Existe cobertura de autenticación, perfil, catálogos, casos, mensajes, notificaciones, usuarios, ámbitos, noticias, iniciativas/ediciones, jornadas, medios, postulaciones, comentarios, informes y auditoría. También aparecen preferencias, seguimiento de casos y campos ampliados de privacidad/corrección/aportes que no figuraban en el DDL inicial de 30 tablas.

**En esta revisión original se usó `endpoints.md` para las rutas y DTO.** La actualización v1.2 indicada arriba modifica esa referencia. `docs/endpoints-integracion-backend.md` conserva la petición previa y sus requisitos, pero sus rutas propuestas y carencias del SQL inicial no se deben tratar como el estado actual del backend.

No se llamaron endpoints ni se crearon cuentas/casos. No se comprobó despliegue, autenticación, permisos, migraciones, archivos o entrega de correos. «Documentado» significa que aparece en esta especificación entregada, no que se haya probado su funcionamiento.

## 2. Correspondencia con el frontend

Todas las rutas de esta tabla son las que aparecen en `paths`, no nombres inferidos de descripciones.

| Módulo | Rutas documentadas que usar como referencia | Situación para la integración |
|---|---|---|
| Acceso | `/api/v1/auth/login/`, `/register/`, `/refresh/`, `/logout/` bajo el mismo prefijo auth. | Solicitudes de acceso/registro documentadas; falta un esquema de respuesta correcto de login y aclarar renovación/cierre de JWT. |
| Recuperación | `/api/v1/auth/password-reset/request/`, `/validate/`, `/confirm/`. | Validación y confirmación usan `uid` y `token`; nueva contraseña `new_password`. Aclarar respuestas de éxito/error, hoy anotadas con serializers de entrada. |
| Identidad/perfil | `/api/v1/me/`, `/api/v1/me/preferences/`, `/api/v1/me/photo/`. | ME y preferencias tienen schemas; fotografía carece de body/esquema de respuesta en PUT. |
| Catálogos | `/api/v1/catalogs/departments/`, `/municipalities/`, `/communities/`, `/case-types/`, `/case-statuses/` bajo catalogs. | Arrays con esquemas explícitos. No confundirlos con listados CRUD paginados del administrador. Filtros de relación necesitan documentación. |
| Opciones/categorías de caso | `/api/v1/catalogs/case-options/`, `/api/v1/catalogs/case-categories/`. | Respuesta sin esquema. `CaseCategory` de tipos contiene `id_tipo_caso`, `categoria` y `naturaleza`; aclarar forma del agregado. |
| Casos propios | `/api/v1/me/cases/`, `/api/v1/me/cases/{id}/` y acciones de contributions/evidence/history. | También existe familia `/api/v1/citizen/cases/`. Elegir una y no duplicar servicios. Listado/detalle tienen schemas; varias acciones usan anotación general de caso en vez de la acción concreta. |
| Mensajes | `/api/v1/cases/{case_id}/messages/` y `/messages/mark-read/`. | Alias administrativos/ciudadanos. Cardinalidad de GET, destinatario y límite de lectura requieren ejemplos precisos. |
| Notificaciones | `/api/v1/me/notifications/`, `/{id}/mark-read/`, `/mark-read/`, `/mark-all-read/`. | Existe alias `/citizen/notifications/`. Usar acciones de lectura; `Notification.leida` es readOnly en el schema, por lo que PATCH del recurso no demuestra que permita cambiarla. |
| Mapa/caso público | `/api/v1/public/cases/`, `/{lookup}/`, `/map/`, `/geojson/`, `/{case_id}/history/`, `/{case_id}/evidences/`, `/{case_id}/comments/`. | `evidences` está en plural. Listado/detalle/comentarios tipados; GeoJSON e historial/evidencias tienen anotaciones incompletas o contradictorias. |
| Casos administrativos | `/api/v1/admin/cases/`, `/{id}/`, `/{id}/assignments/`, `/moderation/`, `/correction-requests/`, `/progress/`, `/resolution/`. | Cobertura funcional documentada; confirmar bodies específicos. Descripción admite UUID o radicado para lectura, aunque algunas rutas usan UUID expresamente. |
| Dashboard | `/api/v1/admin/metrics/dashboard/`, `/api/v1/citizen/dashboard/`. | No `/admin/dashboard/` ni `/me/dashboard/` de nuestra propuesta. Ambos carecen de schema de respuesta. |
| Noticias | `/api/v1/public/news/`, `/{lookup}/`; `/api/v1/admin/news/`, `/{id}/`; `/api/v1/admin/news-media/`. | Hay schemas de lista/detalle y CRUD administrativo. Ajustar estados, slug y categorías; subida binaria aún no descrita. |
| Categorías de noticias | `/api/v1/public/news-categories/`, también `/api/v1/public/news/categories/`; CRUD `/api/v1/admin/news-categories/`. | GET público devuelve array `NewsCategory`; evitar usar simultáneamente alias equivalentes. |
| Iniciativas públicas | `/api/v1/public/initiatives/`, `/{lookup}/`, `/{lookup}/editions/`, `/{lookup}/editions/{edition_id}/`, y su `/activities/`. | Programa/edición están separados y los esquemas anidados son utilizables para lecturas. `metrics` del listado está declarado como string: confirmar su forma real. |
| Galería de iniciativas | `/api/v1/public/initiatives/gallery/`. | No es `/{id}/gallery/` como propusimos. Confirmar parámetros por iniciativa/edición; solo están declarados page/page_size. |
| Iniciativas administrativas | `/api/v1/admin/initiatives/`, `/initiative-editions/`, `/initiative-activities/`, `/initiative-media/`, `/initiative-metrics/`, `/initiative-communities/`, `/initiative-case-links/`. | CRUD por recurso, no exclusivamente rutas anidadas del prototipo. Enviar relaciones UUID (`iniciativa`, `edicion`, etc.); no extraerlas de títulos. |
| Postulaciones | `POST /api/v1/public/initiatives/proposals/`, alias `/public/event-proposals/`; CRUD `/api/v1/admin/proposals/`, alias `/admin/event-proposals/`. | Respaldo `EventProposal`/`AdminEventProposal`. Revisión se solicita mediante campos permitidos en PATCH; no aparece una acción independiente de revisión en esa ruta. |
| Comentarios | `/api/v1/admin/comments/`, `/{id}/moderation/`; alta `/api/v1/cases/{case_id}/comments/`. | Estados de lectura tipados. La acción de moderación está anotada con `CaseComment`, donde el estado es readOnly y no existe motivo: falta contrato de acción. |
| Usuarios/roles | `/api/v1/admin/users/`, `/{id}/role/`, `/{id}/status/`, `/api/v1/admin/roles/`. | `/roles/` plural es alias de compatibilidad, no prueba de multirrol. `roles` es readOnly; entrada documentada admite rol único mediante aliases. |
| Territorios y ámbitos | `/api/v1/admin/communities/`, `/departments/`, `/municipalities/` bajo admin; `/api/v1/admin/scope-assignments/`. | Schemas explícitos y CRUD paginados; la vista de ámbitos todavía falta en frontend. |
| Informes | `/api/v1/admin/reports/cases/`, `/cases/export/` bajo reports. | Describen agregados y CSV, pero no declaran cuerpos, filtros ni formato de archivo. |
| Auditoría | `/api/v1/admin/audit/events/`, `/events/{event_ref}/` bajo audit; también `/api/v1/admin/audit-logs/` y fuentes especializadas. | Ruta unificada usa `/audit/events/`, no `/audit-events/`. Describe `source:uuid`, pero faltan schemas de salida. |
| Seguimiento de casos | `/api/v1/me/followed-cases/`, `/{case_id}/`. | Aparece recurso y operaciones. La colección GET está anotada como un objeto, no lista; precisar cardinalidad y semántica de operaciones de colección. |
| Boletín | `/api/v1/public/newsletter/subscribe/`, `/confirm/`, `/unsubscribe/`. | No son las rutas newsletter-subscriptions propuestas. Hay entradas, pero éxito está documentado reutilizando dichas entradas. Aclarar mensaje/estado resultante. |
| Información institucional | `/api/v1/public/site-info/`, `/api/v1/public/settings/`, `/api/v1/public/home/`. | `settings` tiene array `SiteSetting`; home y site-info no tienen schema. No consumir claves privadas como si todo settings fuera contenido público autorizado. |

Cuencas no es una función terminada por aparecer una ruta: `/catalogs/basins/` y `/admin/basins/` describen expresamente **lista vacía controlada pendiente de fuente oficial AMP-13**. Mantener ese filtro sin datos hasta resolverlo, sin inventar cuencas.

## 3. Contratos incompletos que necesitan aclaración

### B-01 · Login y sesión: prioritario

`POST /api/v1/auth/login/` declara schema `Login` tanto en request como en response. `Login` solo contiene `correo`, `email`, `username` y `password` writeOnly; **no documenta access, refresh, token, usuario ni expiración**. No permite construir una respuesta de sesión tipada con certeza.

El archivo declara alternativas Bearer JWT, Token y cookie de sesión. Esto expresa mecanismos aceptables según la documentación, no que Angular deba enviar todos. `/auth/refresh/` usa un refresh JWT y devuelve access, mientras la descripción de logout habla de revocar «Token de API». Confirmar el mecanismo canónico y qué ocurre con refresh/access al cerrar sesión.

Solicitar ejemplo real redactado y schema de respuesta de login, registro, cierre y recuperación; errores 400/401/403/429, rotación/expiración y uso de «recordar sesión». No probar creación de cuentas, correo o resets reales como parte de esta revisión documental.

### B-02 · Acciones anotadas como el caso completo

Asignación, corrección, progreso, moderación y resolución bajo `/admin/cases/{id}/…` reutilizan `AdminCaseDetail` para las solicitudes. Ese esquema no define por sí solo la estructura de cada acción ni sus motivos/decisiones.

Ejemplos adicionales:

- GET de evidencia/historial ciudadano devuelve en la especificación `CitizenCaseCreateUpdate`, no una colección del recurso correspondiente.
- POST de aportes referencia también `CitizenCaseCreateUpdate`, aunque existe `CaseContribution` con `contenido` e `id_solicitud_correccion`.
- GET de mensajes está anotado como un único `CaseMessage`; confirmar si realmente es array, objeto o página.
- Descargas privadas se describen con schemas JSON de caso. Confirmar si hay binario, redirect o JSON con URL temporal; no decidirlo por el nombre download.

Esto **no demuestra que las implementaciones estén mal**: demuestra que no se puede inferir su contrato completo desde estas anotaciones. Se necesitan serializers de acción o ejemplos fieles de entrada/salida.

### B-03 · Moderación de comentarios

`POST /api/v1/admin/comments/{id}/moderation/` usa `CaseComment`. Allí `estado_moderacion` es readOnly y no aparece un campo de motivo. Nuestra vista necesita conocer el nombre y valores de la decisión, motivo admitido, efectos y representación del historial.

No enviar arbitrariamente `decision`, `state` o `reason` porque sean nombres usados por el prototipo. Confirmar el contrato real y qué estados/transiciones admite el backend.

### B-04 · Archivos y fotografía

- PUT `/me/photo/` no tiene `requestBody` documentado ni schema de respuesta.
- `CaseEvidence`, `InitiativeMedia` y `NewsMedia` exponen `ruta_archivo` como string; no describen un campo `format: binary` para subir el File seleccionado.
- Radicación admite multipart como content-type, pero `CitizenCaseCreateUpdate` no documenta la lista/campos de archivos. Content-type multipart no define por sí solo si se envía `files`, `archivo`, un JSON `data` u otro nombre.

Pedir un ejemplo multipart completo por flujo, nombre de campo(s), cantidad/tamaño/tipos admitidos, atomicidad, estados de procesamiento, URL de lectura y descarga privada. No enviar URLs `blob:` ni rutas locales como archivos.

### B-05 · Mapa y tipos complejos

`/public/cases/map/` y `/geojson/` describen **GeoJSON FeatureCollection**, pero el response referencia `PublicCaseList`. Este último describe una fila de caso; no `type`, `features`, `geometry` o `properties` de una colección GeoJSON.

Otros campos calculados están declarados como string sin estructura suficiente: `public_location`, `public_updates`, `public_status_history`, `public_evidence`, `approved_comments` en casos públicos; `seguimientos`/`evidencias` en expediente ciudadano; `metrics` en iniciativas. Confirmar si realmente son strings, listas u objetos y anotar la forma exacta.

No generar clientes automáticos para esos campos confiando en tipos que contradigan la descripción o el consumo previsto. No sustituir ubicación pública generalizada por la ubicación exacta.

### B-06 · Filtros y agregados

En muchos listados solo aparecen `page` y `page_size`. No se documentan los filtros que necesitan las pantallas: búsqueda, territorios, categoría/tipo, estado/publicación, responsable, año/edición y fechas; tampoco ordenación.

La ausencia en OpenAPI no prueba que Django los ignore: pueden leerse manualmente sin anotación. Pedir nombres, tipos y ejemplos. Especialmente importante en galería global por iniciativa/edición, ámbitos, informes y listados filtrados: no filtrar únicamente la página recibida en Angular como si fuera el conjunto completo.

Pedir además shapes de métricas, contadores de no leídos, informes y fecha de corte. Para CSV, documentar `text/csv`/binario, cabeceras y nombre de archivo.

### B-07 · Marca de lectura, nulabilidad y respuestas de error

`Notification.leida` es readOnly; existen acciones `/mark-read/` que deben preferirse frente a asumir que PATCH del recurso la cambia. Los endpoints masivos reutilizan `Notification` en el schema, por lo que no queda documentado si aceptan IDs/corte ni qué resumen retornan. La lectura de mensajes tampoco documenta body para el límite consultado.

También hay campos calculados requeridos sin nullable que podrían no tener valor en ciertos estados, por ejemplo una asignación activa inexistente. Confirmar null frente a ausencia/objeto vacío en casos nuevos y preferencias/perfil.

Se necesitan formatos reales de error por campo, no disponible, sesión vencida, permiso, archivo y conflicto. El análisis no comprobó esas respuestas en ejecución; no se deducen de tener un 200 documentado.

## 4. Operaciones con respuesta de éxito sin esquema

Se detectaron **19 operaciones con éxito distinto de 204 sin schema de respuesta**. La etiqueta `No response body` puede ser una omisión de anotación; no se afirma que la implementación devuelva realmente vacío. Algunas operaciones pueden ser intencionalmente sin cuerpo, como logout, pero deben confirmarse.

| Método | Ruta bajo `/api/v1/` |
|---|---|
| GET | `admin/audit/events/` |
| GET | `admin/audit/events/{event_ref}/` |
| GET | `admin/basins/` |
| GET | `admin/metrics/dashboard/` |
| GET | `admin/reports/cases/` |
| GET | `admin/reports/cases/export/` |
| POST | `auth/logout/` |
| PUT | `cases/{case_id}/messages/mark-read/` |
| GET | `catalogs/basins/` |
| GET | `catalogs/case-categories/` |
| GET | `catalogs/case-options/` |
| GET | `citizen/dashboard/` |
| GET | `me/conversations/` |
| PUT | `me/photo/` |
| GET | `public/cases/{case_id}/evidences/` |
| GET | `public/cases/{case_id}/history/` |
| GET | `public/home/` |
| GET | `public/initiatives/categories/` |
| GET | `public/site-info/` |

Los 204 de eliminación no se consideran carencias por no tener JSON.

## 5. Ajustes concretos del frontend

| Parte actual | Cambio que exige la entrega |
|---|---|
| Formularios de usuario/registro | Usar `nombres` y `apellidos` separados, correo hasta 150 y teléfono hasta 20; mapear `full_name` solo para mostrar. |
| Roles | Entrada de rol único vía `rol`/`id_rol`/`rol_nombre` según endpoint acordado. `roles` y `primary_role` son de lectura; la ruta plural no autoriza escribir varias asignaciones. Confirmar permisos efectivos y su shape. |
| Preferencias | Mapear a `notificar_novedades_casos`, `notificar_mensajes`, `suscrito_boletin`. No derivar suscripción confirmada solo del checkbox sin reglas de backend. |
| Registro/radicación | La spec presenta aliases de aceptación con `default: true`. Angular debe enviar explícitamente la elección válida de la persona; solicitar aclaración de obligatoriedad/versionado, sin usar ese default como consentimiento real. |
| Radicación | Campos documentados: `titulo`, `descripcion`, `tipo_caso`/`id_tipo_caso`, `comunidad`/`id_comunidad`, prioridad, familias/meses y coordenadas. Elegir aliases canónicos y no enviar simultáneamente valores contradictorios. |
| Tipos/categorías | `CaseCategory` representa tipo con UUID, categoría textual y naturaleza. El selector de texto de la demo debe alimentarse de catálogos reales y mapear relaciones por ID. |
| Evidencias y avances | Audiencias diferentes: evidencia `publico/ciudadano/privado`; seguimiento `publico/ciudadano/interno`. No reutilizar un enum de UI sin adaptación. |
| Noticias | Estado real documentado: `borrador/en_revision/publicada/archivada`, frente a `rechazada` de la simulación. `titulo` hasta 220, categoría UUID; `slug` readOnly en `NewsArticleDetail`, por lo que se trata como generado por backend salvo aclaración. |
| Programas | Publicación `borrador/pendiente/publicada/rechazada`; categoría es texto. `slug` también readOnly. No aplicar el enum de noticias a iniciativas. |
| Ediciones/jornadas/indicadores | Enviar FK `iniciativa` o `edicion`; año `anio`; fechas DATE o date-time según recurso. `InitiativeMetric.valor` es decimal string: conservar precisión y distinguir estimado/real. |
| Postulaciones | Mapear contacto/título/consentimiento a `EventProposal`; revisión con `estado`, `respuesta`, `iniciativa_generada` en campos permitidos de `AdminEventProposal`. Actor debe derivarse de sesión; aclarar uso de `fecha_revision`, que figura editable. |
| Conflictos de demos | No enviar los campos `revision`, `expectedRevision`, historial o etiquetas ficticias de nuestros servicios. El esquema no documenta ese contrato de concurrencia; acordar precondición real si se necesita. |
| Mensajería | `destinatario` aparece como UUID editable, pero la documentación no lo marca requerido; confirmar resolución automática o exigencia según contexto. No inventar destinatario ni canal global por caso. |
| Representación del portal | Cambiar imágenes/cifras/textos de fixture por datos reales solo cuando exista respuesta del servidor; manejar vacío y error sin rellenar resultados con ejemplos. |

## 6. Qué se puede avanzar y qué debe esperar

**Preparación e integración gradual de lecturas:** catálogo territorial, tipos/estados de caso explícitos, categorías de noticias, listados/detalles de noticias y recursos administrativos de territorio, usuarios, programas, ediciones, jornadas e indicadores. Tienen schemas más concretos y se pueden adaptar a las vistas, validando luego con respuestas reales. Aun así, hay que confirmar filtros, nulabilidad, credenciales y despliegue; no se certifica que cada flujo esté cerrado.

**Circuitos que necesitan completar contrato antes de cablear todo el flujo:** sesión/login, acciones administrativas de caso, moderación de comentarios, radicación con anexos, galerías con upload, mapa GeoJSON, lectura de conversaciones, dashboards, informes/exportación y auditoría unificada.

No es necesario pedir de nuevo todos los endpoints de la propuesta. Las operaciones ya están ampliamente cubiertas documentalmente; lo prioritario son **schemas fieles, ejemplos y reglas** en los puntos señalados, además de ajustar nuestro frontend.

## 7. Solicitud concreta de aclaración al backend

1. Respuesta real de login/registro y mecanismo de sesión escogido; semántica de refresh/logout y errores. Ejemplos sin credenciales ni tokens reales reutilizables.
2. Solicitudes/respuestas específicas de asignación, moderación, corrección, progreso, cierre, aportes y moderación de comentarios.
3. Ejemplos multipart de foto, caso con evidencias y medios de noticias/iniciativas, junto con descargas privadas.
4. Schema GeoJSON y tipos de campos calculados, cardinalidad/paginación de mensajes, historial y colecciones.
5. Parámetros de filtros/orden y shape de dashboard, informes, CSV, site-info, home, conversaciones y auditoría.
6. Formato de marca de lectura individual/masiva y límites de lectura para no incluir eventos nuevos concurrentes.
7. Confirmación del estado de migraciones respecto al SQL inicial y políticas de privacidad, consentimiento, permisos por rol/ámbito y concurrencia. No concluir que falta una tabla solo porque no aparece en el DDL antiguo.

No se enviaron estas solicitudes a terceros: quedan documentadas para coordinación del proyecto.

## 8. Evidencia revisada

- Archivo completo analizado como YAML; conteo de paths, operaciones y schemas, referencias a componentes y respuestas de éxito sin schema.
- Inspección de `Login`, `CitizenRegistration`, `UserMe`, `AdminUserCreateUpdate`, preferencias, casos, evidencias, correcciones/aportes, mensajes, comentarios, noticias, iniciativas, ediciones, jornadas, multimedia, indicadores y propuestas.
- Contraste con rutas/formularios/servicios actuales y con `docs/endpoints-integracion-backend.md`.

**No se modificaron `endpoints.md`, el código Angular ni el backend.** Esta entrega es la revisión documental y el mapa de integración; faltan pruebas autorizadas contra el servidor y la implementación de adaptadores HTTP.
