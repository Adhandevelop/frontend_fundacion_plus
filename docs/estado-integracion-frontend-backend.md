# Estado de integración del frontend PLUS

Actualizado: 13 de noviembre de 2026.

Este es el registro consolidado del frontend Angular. “Integrado” significa que existe un servicio HTTP, una vista conectada y pruebas aisladas del contrato; no significa que el cambio local ya esté desplegado en `fundacionplus.site`. Este repositorio no modifica Django ni la base de datos.

## 1. Integrado con la API REST

### Autenticación, cuenta y permisos

- Inicio de sesión, registro ciudadano, cierre de sesión y restauración mediante `/me/`.
- JWT con almacenamiento temporal/recordado, renovación, rotación y tratamiento de sesión vencida.
- Recuperación, validación y cambio de contraseña.
- Perfil, preferencias, foto por `multipart/form-data` y catálogos territoriales.
- Separación estricta de portales: ciudadano no entra a administración y un rol interno no entra al portal ciudadano.
- Guards en rutas padre e hijas y menú administrativo filtrado por rol/capacidades.

### Portal ciudadano

- Inicio ciudadano propio en `/ciudadano`, con resumen real, accesos rápidos y casos recientes dentro del layout autenticado.
- Login y registro ciudadano aterrizan en ese inicio, no directamente en el perfil.
- Logo y enlace “Inicio” conservan cabecera, menú lateral, identidad y sesión del portal ciudadano.
- Dashboard, listado, radicación, detalle e historial de casos propios.
- Evidencias, aportes, solicitudes de corrección y descargas protegidas.
- Conversaciones, mensajes, notificaciones, lectura explícita y contadores por cuenta.
- “Mis formularios”: listado paginado y detalle histórico de respuestas vinculadas.

### Administración

- Dashboard, listado, filtros, detalle y acciones de casos según `allowed_actions`.
- Responsables elegibles, asignación, estados, corrección, publicación y revisión de evidencias.
- Usuarios: listado, alta, contacto, rol y estado.
- Comunidades: listado, creación, edición y activación/desactivación.
- Comentarios: cola, detalle y decisión de moderación.
- Informes de casos y exportación CSV.
- Auditoría paginada con filtros server-side y detalle seguro de metadatos.
- Gestión exclusiva de la fotografía principal para cuentas con `can_manage_homepage`.
- Edición conjunta del nombre, sigla, representante, cargo y misión mediante las claves oficiales de `SiteSetting`.

### Portada institucional

- La página principal consulta `/api/v1/public/home/`.
- Fotografía, nombre institucional, representante, misión y métricas verificadas proceden del backend cuando la consulta está disponible. El frontend aplica normalización institucional y respaldo seguro al nombre oficial "JUAN DAVID MARTINEZ BOLAÑO".
- Las cifras ficticias del diseño fueron retiradas: ante un error se muestran guiones, no valores inventados.
- `/admin/portada` permite consultar y reemplazar la imagen mediante `multipart/form-data`.
- El frontend valida JPG/PNG/WEBP, límite de 5 MB y texto alternativo; el backend conserva la validación definitiva, versiona el recurso y audita la escritura.
- Menú y ruta exigen administrador activo y capacidad `can_manage_homepage`.
- `/admin/configuracion-institucional` consulta `/admin/settings/` y actualiza o crea exclusivamente `institucion.nombre`, `institucion.sigla`, `institucion.representante_nombre`, `institucion.representante_cargo` e `institucion.mision`.
- “Nosotros” reutiliza desde `/public/home/` el nombre, sigla, misión, representante, cargo y fotografía institucional, sin mantener una segunda copia de esos datos en Angular.
- `/legal/:tipo` consulta `/public/site/` y presenta la versión pública vigente de tratamiento de datos, términos de uso, consentimiento de radicación o boletín. El pie genera sus vínculos desde `documentos_legales` y dejó de enlazar destinos vacíos.
- El pie retiró el correo, teléfono y dirección de demostración; mientras el backend no publique canales institucionales aprobados, ofrece únicamente accesos funcionales a registro, mapa e iniciativas.

### Noticias públicas y boletín

- `/noticias` consulta `/api/v1/public/news/` y las categorías activas.
- La apertura de una publicación consulta su detalle completo y medios por `slug`.
- Cada publicación puede abrirse directamente en `/noticias/:slug`; abrir y cerrar la ficha mantiene sincronizada la URL.
- Búsqueda, categoría, orden y paginación visual operan sobre la colección recibida.
- Si no existen noticias publicadas o falla la consulta, se conservan los mockups como respaldo marcado explícitamente; no se presentan como información oficial.
- La suscripción al boletín consume `/api/v1/public/newsletter/subscribe/`, envía consentimiento y comunica que debe confirmarse por correo.
- `/boletin/confirmar?token=...` confirma mediante `POST /api/v1/public/newsletter-subscriptions/confirm/`; `/boletin/baja?token=...&correo=...` solicita el correo y ejecuta la baja mediante el contrato documentado.
- Las rutas `/boletin/confirmar` y `/boletin/baja` consumen los contratos documentados por token y muestran el resultado devuelto por el backend.
- La administración editorial consulta listado, categorías y detalle reales.
- Creación y edición escriben título, categoría, extracto, contenido y destacado.
- La revisión aplica estados `borrador`, `en_revision`, `publicada` y `archivada`, con confirmación antes de cambiar visibilidad.
- Publicar y archivar utilizan las acciones auditadas `POST /publish/` y `POST /archive/` desplegadas en `8dca085`.
- El almacenamiento temporal administrativo fue retirado.
- El backend habilitó en `54dd730` la carga multipart segura de medios mediante `file` o `archivo`, sin exigir `ruta_archivo`, y devuelve `url`/`url_archivo` utilizables por el DOM. Angular ya conecta selección, validación local, subida, portada, orden, previsualización y eliminación en la revisión editorial. Falta ejecutar una prueba funcional autenticada contra el servidor.

### Iniciativas públicas y postulaciones

- `/iniciativas` consulta `/api/v1/public/initiatives/` y `/categories/`.
- Cada programa publicado puede abrirse directamente en `/iniciativas/:slug`, conservando catálogo, ficha, ediciones y galería en una URL compartible.
- Búsqueda, categoría y edición filtran la colección recibida; al abrir un programa se consulta el detalle por `slug` y se muestran descripción, portada y galería pública.
- Si la colección está vacía o la consulta falla, los cuatro mockups se conservan como respaldo marcado como contenido de diseño.
- El formulario comunitario dejó de ser una simulación y envía a `/api/v1/public/initiatives/proposals/` el contacto, territorio declarado, iniciativa opcional, título, descripción y autorización.
- La ficha pública interpreta la proyección depurada de ediciones: indicadores, comunidades de cobertura, actividades y casos aprobados relacionados. Cada edición se presenta de forma desplegable y muestra un estado vacío explícito cuando no tiene resultados asociados.
- Los adaptadores públicos aceptan `metrics` resumido o estructurado, priorizan `url`/`url_archivo` para medios y no exponen identificadores de responsables ni coordenadas internas.
- La administración de programas ya consulta listado y detalle reales, crea/edita contenido y confirma cambios de publicación y destacado.
- El `slug` administrativo es de solo lectura en Angular porque lo genera y garantiza el backend.
- Las ediciones anidadas se muestran desde la ficha real y su creación/edición ya consume `/admin/initiative-editions/`. Los medios generales y por edición también son REST.
- La bandeja de postulaciones consulta `/admin/proposals/`, filtra en servidor, abre el detalle y guarda estado, respuesta e iniciativa generada mediante PATCH. No envía actor ni fecha de revisión desde el cliente.
- Las actividades administrativas ya consultan, crean y actualizan `/admin/initiative-activities/` con edición, comunidad activa y responsable institucional opcionales, fechas UTC, lugar, estado y GeoJSON Point SRID 4326. Angular valida coordenadas dentro de Colombia y conserva el orden `[longitud, latitud]`.
- Los indicadores por edición ya consultan y escriben `/admin/initiative-metrics/`: valor decimal como texto, unidad, descripción, icono, tipo de medición, orden y fecha de corte.
- La cobertura por edición ya consulta, crea, edita y elimina vínculos de `/admin/initiative-communities/`; el selector usa comunidades administrativas activas y conserva las observaciones territoriales.
- Los casos vinculados ya se consultan por `?edicion=` y se administran mediante `/admin/initiative-case-links/`, con los tipos `hallazgo`, `seguimiento`, `resultado` y `otro`. El selector usa `/candidates/`, recibe únicamente casos aprobados no vinculados, permite búsqueda y paginación y ya no depende del permiso general de administración de casos.

### Formularios dinámicos

El prototipo en memoria fue retirado. El módulo consume `apps.dynamic_forms`:

- capacidad `can_manage_forms` aplicada en menú y rutas;
- listado administrativo con búsqueda, estado y paginación;
- creación y actualización de borradores con `revision_esperada`;
- constructor para `texto_corto`, `texto_largo`, `numero`, `fecha`, `booleano`, `seleccion_unica` y `seleccion_multiple`;
- obligatoriedad, orden, opciones y configuración básica de límites;
- publicación, cierre, reapertura, archivo, duplicación y borrador desde versión;
- vista previa sin guardar respuestas;
- vista previa de versiones históricas mediante `/admin/forms/{id}/versions/{numero}/`, incluidas preguntas y opciones congeladas;
- formulario público desde `/api/v1/public/forms/{slug}/`;
- envío con política legal vigente e `Idempotency-Key` estable durante el intento;
- confirmación neutral de recepción;
- activación/reivindicación mediante `/activar-cuenta?token=...`, contraseña elegida por el usuario y reenvío neutral;
- bandeja y detalle administrativo de envíos;
- exportación CSV de respuestas;
- listado y detalle ciudadano de envíos vinculados.

No se envían contraseñas por correo. El backend genera un enlace de un solo uso para que la persona establezca la suya.

## 2. Construido, pero aún demostrativo o estático

### Contenido editorial pendiente

- Bloques secundarios de “Nosotros”, canales sociales, contacto, visión, acreditaciones y documentos oficiales.
- Imágenes editoriales aprobadas para las noticias e iniciativas cargadas.

La portada y los catálogos ya consultan noticias e iniciativas publicadas y enlazan sus fichas por `slug`. Los respaldos demostrativos fueron retirados: una colección vacía muestra un estado vacío real y un fallo de API muestra su error. Los bloques institucionales restantes requieren aprobación y fuente REST antes de retirar su contenido de diseño.

### Otros límites

- Algunos bloques secundarios del expediente conservan información ilustrativa donde no existe contrato suficiente.
- Algunas cifras públicas carecen de una fuente real.
- Las vistas administrativas de iniciativas siguen esperando su siguiente etapa de servicios REST y la carga editorial aprobada.

## 3. Mapa territorial

- Leaflet 1.9.4 y cartografía real de OpenStreetMap con atribución.
- Centrado inicial en Villavicencio y encuadre general del Meta.
- Rutas `/mapa`, `/ciudadano/mapa` y `/admin/mapa`, conservando el layout del portal.
- Cartografía legible también en tema oscuro.
- Sin marcadores ni coordenadas inventadas.
- Corregida la interoperabilidad del import dinámico de Leaflet en producción: se admite la API como exportación directa o dentro de `default`. El fallo anterior generaba `TypeError: map is not a function` y dejaba el lienzo vacío.

El backend entrega GeoJSON con coordenadas públicas generalizadas, visibilidad aprobada y filtros de servidor. Angular no geocodifica descripciones textuales ni usa ubicaciones privadas.

## 4. Limitaciones encontradas durante esta integración

### Formularios

- El 13 de noviembre se confirmó P25: la ficha del formulario “arreglo vial” carga, pero su listado de respuestas recibe 5xx desde `/admin/forms/{id}/submissions/`. El frontend usa la ruta y paginación acordadas y ahora permite reintentar; falta corregir el traceback en Django.
- El detalle de versión histórica desplegado en `8dca085` ya está conectado a la vista previa administrativa.
- El editor cubre los siete tipos y las validaciones frecuentes. La interfaz avanzada para `min_date`, `max_date`, expresión regular y mensaje de expresión regular aún no se expone, aunque el adaptador conserva `configuracion_validacion` recibida.
- La disponibilidad real de correo, migraciones, documento legal y formulario semilla debe comprobarse en el entorno desplegado. Las pruebas locales no envían correos ni crean cuentas reales.
- Se debe realizar una prueba funcional controlada del ciclo completo: crear borrador, publicar, enviar como anónimo, recibir correo, activar, iniciar sesión, consultar “Mis formularios” y exportar desde administración.

### Backend general

No hay problemas técnicos activos demostrados en [problemas-integracion.md](problemas-integracion.md). P01–P23 se conservan como trazabilidad en [correcciones-backend-historico.md](correcciones-backend-historico.md). Angular ya adaptó versiones históricas, acciones editoriales, carga multipart y subrecursos principales de iniciativas; siguen pendientes pruebas autenticadas y migrar las vistas restantes.

La administración también puede registrar expedientes desde el botón amarillo “Añadir caso” del dashboard. El formulario `/admin/casos/nuevo` usa catálogos oficiales y `POST /api/v1/admin/cases/`, sin entrar al módulo ciudadano.

El módulo `/admin/casos-asignados` muestra los expedientes asignados al usuario administrativo autenticado mediante los filtros P09 del backend. Está separado del listado general. `/admin/mis-casos` ya utiliza el contrato específico del backend y separa los casos creados por la cuenta administrativa de los casos públicos que decidió seguir.

## 5. Próximo trabajo recomendado

1. Asignar una ubicación pública al caso aprobado `PLUS-2026-00001` y repetir la verificación de GeoJSON y mapa.
2. Verificar con una cuenta ciudadana el seguimiento por UUID y el envío de comentarios a moderación desde la ficha pública.
3. Probar formularios de extremo a extremo con un buzón controlado y corregir diferencias observadas.
4. Aprobar y cargar imágenes para el contenido editorial inicial ya publicado.
6. Probar contra el servidor la carga multipart, responsables, actividades y enlaces del boletín.
7. Probar el reemplazo real de portada y la edición institucional con una cuenta autorizada mediante `can_manage_homepage`.
8. Repetir revisión responsive, accesibilidad, temas, Docker y Nginx con datos reales.

## 6. Verificación local actual

- `npm run build`: correcto el 13 de noviembre de 2026 después de integrar la pantalla administrativa de información institucional y reutilizar sus datos en “Nosotros”.
- `npm run test:api`: trece suites correctas; iniciativas incluye la proyección pública y el contrato P22 de filtro, respuesta enriquecida, búsqueda y paginación de candidatos.
- La suite de formularios comprueba listado administrativo, siete tipos de pregunta, validación local, payload público, `Idempotency-Key`, activación/reenvío, historial ciudadano, ciclo de publicación y rutas de exportación.
- La suite de portada comprueba la lectura pública, las métricas verificadas, la consulta administrativa y el reemplazo multipart protegido.
- La suite editorial comprueba catálogo/detalle público, boletín, listado y categorías administrativas, creación y transiciones editoriales.
- La suite de iniciativas comprueba catálogo, categorías, detalle/galería, postulación comunitaria, listado administrativo, creación y transición editorial.
- Las pruebas HTTP son simuladas y no escriben en producción.
- No se realizó despliegue, commit ni prueba con credenciales reales en esta etapa.

### Verificación controlada del 12 de noviembre de 2026

- `GET /api/v1/public/cases/` devolvió un caso aprobado real y su detalle, historial, evidencias y comentarios respondieron correctamente.
- `GET /api/v1/public/cases/geojson/` devolvió una colección válida con cero elementos porque el caso aprobado tiene `public_location: null`. La ausencia del marcador es coherente con el contrato y no constituye un fallo de Leaflet.
- La portada configurada respondió `200` desde `/api/v1/public/media/site/hero/...`.
- Existe un formulario publicado, `censo-comunitario-meta`, con versión activa y política legal 1.0. No se realizó el envío porque falta designar un buzón de prueba accesible para verificar realmente el enlace de activación y Resend.
- El constructor ya expone y valida longitud, rangos numéricos, cantidad de selecciones, fechas mínima/máxima, expresión regular y su mensaje de error.
- Los catálogos públicos dejaron de utilizar noticias e iniciativas demostrativas como respaldo.

## 7. Estimación orientativa

- Vistas generales: aproximadamente 90 % construidas.
- Integración de módulos respaldados por endpoints: aproximadamente 85 %.
- Formularios dinámicos: conexión REST y versión histórica implementadas; falta validación real completa.
- Portada institucional: lectura y administración conectadas; prueba real de archivo pendiente.
- Noticias: lecturas públicas, ciclo del boletín, administración REST y medios binarios conectados; carga editorial inicial y pruebas reales pendientes.
- Iniciativas: catálogo, detalle, postulación pública, CRUD textual, ediciones, medios, indicadores, cobertura, vínculos con casos, actividades con comunidad/responsable/GeoPoint y revisión administrativa de postulaciones conectados; carga editorial inicial y pruebas reales siguen pendientes.
- Mapa: base real corregida, capa `GeoJSON`, portada, búsqueda, lista y filtros oficiales por UUID integrados; falta desplegar y verificar con datos georreferenciados del servidor.

Las cifras son orientativas. El estado local no implica que los cambios estén publicados en `fundacionplus.site`.

### Ámbitos de responsables

- Se añadió `/admin/ambitos-responsables` con paginación REST sobre `GET /api/v1/admin/scope-assignments/`.
- Permite crear ámbitos combinando responsable activo, comunidad opcional y tipo de caso opcional, y activar o desactivar una asignación mediante `PATCH`.
- Los selectores consultan usuarios activos, comunidades activas y el catálogo oficial de tipos de caso. La pantalla también está enlazada desde Usuarios y desde la navegación administrativa.
- Queda pendiente la prueba autenticada contra producción y confirmar si el backend desea impedir explícitamente el ámbito completamente global; el frontend exige actualmente al menos comunidad o tipo para evitar asignaciones accidentales demasiado amplias.

El portal ciudadano incluye `/ciudadano/casos-seguidos`, consulta `GET /api/v1/me/followed-cases/` y permite dejar de seguir con `DELETE`. El servicio también implementa `PUT` para activar seguimiento; el botón público se incorporará cuando el detalle público deje de ser la demostración estática y entregue un UUID real.
