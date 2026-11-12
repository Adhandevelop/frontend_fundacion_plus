# Estado de integración del frontend PLUS

Actualizado: 11 de noviembre de 2026.

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
- Auditoría reciente y detalle seguro de metadatos.
- Gestión exclusiva de la fotografía principal para cuentas con `can_manage_homepage`.

### Portada institucional

- La página principal consulta `/api/v1/public/home/`.
- Fotografía, nombre institucional, representante, misión y métricas verificadas proceden del backend cuando la consulta está disponible.
- Las cifras ficticias del diseño fueron retiradas: ante un error se muestran guiones, no valores inventados.
- `/admin/portada` permite consultar y reemplazar la imagen mediante `multipart/form-data`.
- El frontend valida JPG/PNG/WEBP, límite de 5 MB y texto alternativo; el backend conserva la validación definitiva, versiona el recurso y audita la escritura.
- Menú y ruta exigen administrador activo y capacidad `can_manage_homepage`.

### Noticias públicas y boletín

- `/noticias` consulta `/api/v1/public/news/` y las categorías activas.
- La apertura de una publicación consulta su detalle completo y medios por `slug`.
- Búsqueda, categoría, orden y paginación visual operan sobre la colección recibida.
- Si no existen noticias publicadas o falla la consulta, se conservan los mockups como respaldo marcado explícitamente; no se presentan como información oficial.
- La suscripción al boletín consume `/api/v1/public/newsletter/subscribe/`, envía consentimiento y comunica que debe confirmarse por correo.
- No se implementaron todavía las rutas de confirmación/baja. Los endpoints existen, pero la documentación disponible no fija el nombre/transporte del token ni el DTO de resultado; se evita inventar ese contrato.
- La administración editorial consulta listado, categorías y detalle reales.
- Creación y edición escriben título, categoría, extracto, contenido y destacado.
- La revisión aplica estados `borrador`, `en_revision`, `publicada` y `archivada`, con confirmación antes de cambiar visibilidad.
- Publicar y archivar utilizan las acciones auditadas `POST /publish/` y `POST /archive/` desplegadas en `8dca085`.
- El almacenamiento temporal administrativo fue retirado.
- El backend habilitó en `54dd730` la carga multipart segura de medios mediante `file` o `archivo`, sin exigir `ruta_archivo`, y devuelve `url`/`url_archivo` utilizables por el DOM. Angular ya conecta selección, validación local, subida, portada, orden, previsualización y eliminación en la revisión editorial. Falta ejecutar una prueba funcional autenticada contra el servidor.

### Iniciativas públicas y postulaciones

- `/iniciativas` consulta `/api/v1/public/initiatives/` y `/categories/`.
- Búsqueda, categoría y edición filtran la colección recibida; al abrir un programa se consulta el detalle por `slug` y se muestran descripción, portada y galería pública.
- Si la colección está vacía o la consulta falla, los cuatro mockups se conservan como respaldo marcado como contenido de diseño.
- El formulario comunitario dejó de ser una simulación y envía a `/api/v1/public/initiatives/proposals/` el contacto, territorio declarado, iniciativa opcional, título, descripción y autorización.
- El backend desplegó una proyección pública depurada para ediciones y actividades. Angular mantiene una presentación mínima hasta verificarla con contenido publicado real.
- La administración de programas ya consulta listado y detalle reales, crea/edita contenido y confirma cambios de publicación y destacado.
- El `slug` administrativo es de solo lectura en Angular porque lo genera y garantiza el backend.
- Las ediciones anidadas se muestran desde la ficha real y su creación/edición ya consume `/admin/initiative-editions/`. Los medios generales y por edición también son REST.
- La bandeja de postulaciones consulta `/admin/proposals/`, filtra en servidor, abre el detalle y guarda estado, respuesta e iniciativa generada mediante PATCH. No envía actor ni fecha de revisión desde el cliente.
- Indicadores, cobertura y actividades todavía conservan implementación demostrativa.

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

- Bloques secundarios de la página principal y nosotros.
- Administración de indicadores, cobertura y actividades de iniciativas.
- Inventario inicial reproducible de contenido e imágenes.

Estas pantallas todavía usan contenido de diseño. Falta aprobación institucional, carga inicial en la base de datos y conexión REST. No conviene conectar una colección vacía porque degradaría el sitio publicado.

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

Falta que el backend entregue coordenadas o GeoJSON verificable, visibilidad pública explícita y filtros. No se geocodifican descripciones textuales de casos.

## 4. Limitaciones encontradas durante esta integración

### Formularios

- El detalle de versión histórica desplegado en `8dca085` ya está conectado a la vista previa administrativa.
- El editor cubre los siete tipos y las validaciones frecuentes. La interfaz avanzada para `min_date`, `max_date`, expresión regular y mensaje de expresión regular aún no se expone, aunque el adaptador conserva `configuracion_validacion` recibida.
- La disponibilidad real de correo, migraciones, documento legal y formulario semilla debe comprobarse en el entorno desplegado. Las pruebas locales no envían correos ni crean cuentas reales.
- Se debe realizar una prueba funcional controlada del ciclo completo: crear borrador, publicar, enviar como anónimo, recibir correo, activar, iniciar sesión, consultar “Mis formularios” y exportar desde administración.

### Backend general

No hay problemas técnicos activos demostrados en [problemas-integracion.md](problemas-integracion.md). P01–P21 se conservan como trazabilidad en [correcciones-backend-historico.md](correcciones-backend-historico.md). Angular ya adaptó versiones históricas, acciones editoriales y carga multipart; siguen pendientes pruebas autenticadas y migrar las vistas restantes.

## 5. Próximo trabajo recomendado

1. Probar formularios de extremo a extremo en un entorno controlado y corregir diferencias observadas.
2. Completar los controles avanzados de validación del constructor.
3. Aprobar y cargar el contenido editorial inicial.
4. Probar contra el servidor la carga multipart ya conectada y construir las páginas de confirmación/baja del boletín.
5. Integrar indicadores, cobertura y actividades administrativas; revisar el DTO público de actividades.
6. Integrar casos georreferenciados en el mapa.
7. Probar el reemplazo real de portada con una cuenta superadministradora controlada.
8. Repetir revisión responsive, accesibilidad, temas, Docker y Nginx con datos reales.

## 6. Verificación local actual

- `npm run build`: correcto el 12 de noviembre de 2026.
- `npm run test:api`: trece suites correctas.
- La suite de formularios comprueba listado administrativo, siete tipos de pregunta, validación local, payload público, `Idempotency-Key`, activación/reenvío, historial ciudadano, ciclo de publicación y rutas de exportación.
- La suite de portada comprueba la lectura pública, las métricas verificadas, la consulta administrativa y el reemplazo multipart protegido.
- La suite editorial comprueba catálogo/detalle público, boletín, listado y categorías administrativas, creación y transiciones editoriales.
- La suite de iniciativas comprueba catálogo, categorías, detalle/galería, postulación comunitaria, listado administrativo, creación y transición editorial.
- Las pruebas HTTP son simuladas y no escriben en producción.
- No se realizó despliegue, commit ni prueba con credenciales reales en esta etapa.

## 7. Estimación orientativa

- Vistas generales: aproximadamente 90 % construidas.
- Integración de módulos respaldados por endpoints: aproximadamente 85 %.
- Formularios dinámicos: conexión REST y versión histórica implementadas; falta validación real completa.
- Portada institucional: lectura y administración conectadas; prueba real de archivo pendiente.
- Noticias: lecturas públicas, administración REST y medios binarios conectados; carga editorial inicial y acciones por token pendientes.
- Iniciativas: catálogo, detalle, postulación pública, CRUD textual, ediciones, medios y revisión administrativa de postulaciones conectados; indicadores, cobertura, actividades y carga editorial inicial siguen pendientes.
- Mapa: base real corregida localmente; falta desplegar/verificar el arreglo y siguen pendientes los datos georreferenciados.

Las cifras son orientativas. El estado local no implica que los cambios estén publicados en `fundacionplus.site`.
