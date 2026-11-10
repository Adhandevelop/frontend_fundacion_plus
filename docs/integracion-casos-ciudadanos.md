# Integración REST de casos ciudadanos

Fecha: 9 de noviembre de 2026. Continúa la integración de acceso/perfil. No modifica el backend ni la base de datos.

## Funciones conectadas

| Vista | Operaciones reales |
|---|---|
| Mis casos | Dashboard ciudadano, listado paginado, búsqueda por título/radicado, filtros de gestión y publicación. |
| Radicación | Catálogos de tipos y territorios, envío JSON del caso, subida individual de anexos y confirmación del radicado real. |
| Expediente propio | Lectura por UUID o código, historial de estados y seguimientos, correcciones solicitadas, evidencias y aportes. |
| Evidencias | Subida multipart y descarga binaria con JWT, sin enlaces públicos para archivos privados. |
| Aportes | Texto adicional y respuesta opcional a una solicitud abierta por su UUID. Los archivos se adjuntan desde Evidencias. |

Las rutas de ciudadano conservan sus guards y no permiten acceder a cuentas administrativas en el frontend. Se retiraron los enlaces del expediente de ejemplo que proponían cambiar al portal del otro rol. El [dashboard y los casos administrativos](integracion-casos-administrativos.md) ya tienen su integración independiente; P01 de [problemas-integracion.md](problemas-integracion.md) registra el ajuste de autorización pendiente en Django.

## Estructura

- `features/citizen/services/citizen-cases.models.ts`: DTO y etiquetas de presentación.
- `features/citizen/services/citizen-cases-api.service.ts`: endpoints de dashboard, casos, catálogos, historial, aportes y archivos.
- `features/citizen/services/case-submission.service.ts`: confirmación y resultado por anexo, asociados al propietario autenticado.
- `features/citizen/services/case-draft.service.ts`: borrador temporal asociado al propietario; no es un borrador persistido en el backend.
- `features/citizen/cases/citizen-case-detail.component.*`: expediente ciudadano conectado. El componente administrativo de demostración no se reutiliza para datos reales.
- `tests/citizen-cases.spec.ts`: pruebas HTTP y de formulario sin servicios externos ni registros en producción.

## Contratos aplicados

Se contrastaron el manual, el OpenAPI y los serializers/views/services locales del backend. Hay diferencias documentales relevantes:

1. **Dashboard:** la respuesta implementada usa `total_cases`, `pendientes_publicacion`, `en_gestion`, `resueltos_o_cerrados`, `open_correction_requests`, etc. Se usan esos nombres, verificados también contra el servidor; no las claves alternativas del ejemplo narrativo.
2. **Filtros propios:** `search`, `estado`, `estado_publicacion`, `page`, `page_size`. La búsqueda por municipio y el filtro por naturaleza no se envían porque el queryset ciudadano revisado no los implementa.
3. **Radicación:** `titulo`, `descripcion`, `id_tipo_caso`, `id_comunidad`, `prioridad`, `familias_afectadas`, `meses_afectacion`, `acepta_tratamiento_datos` y coordenadas opcionales `latitud`/`longitud`. Departamento y municipio permiten seleccionar/validar la comunidad, no se envían como nombres libres. Naturaleza y categoría sirven para seleccionar el tipo; no se inventa una relación adicional.
4. **Anexos iniciales:** el manual describe `files`/`archivos` al crear el caso, pero la implementación local revisada de creación no procesa esos archivos. Se crea el caso por JSON y se usa después `POST /me/cases/{id}/evidence/`, con `file`, en secuencia. No se da por subido un archivo ignorado por el servidor.
5. **Historial:** se consulta `/history/` para los cambios de estado y seguimientos. No se inventan porcentajes de avance ni hitos a partir del estado.
6. **Acciones:** los controles de aportar/subir comprueban `allowed_actions`. El servidor sigue siendo responsable de comprobar propiedad y permisos.

Las coordenadas son opcionales y deben proporcionarse en pareja, dentro de sus rangos. El cliente conserva valores cero. **Pendiente del backend:** el código local de serializer y servicio extrae coordenadas con `a or b`, lo que puede descartar un cero válido; debe usar comprobaciones explícitas contra `None`. No se creó un caso real para probar ese comportamiento ni se modificó Django desde el frontend.

La declaración de veracidad se exige en la interfaz antes del envío; no se presenta como una aceptación independiente persistida porque el contrato de creación revisado solo define la aceptación de tratamiento de datos. Las dos casillas comienzan desmarcadas y no se restauran desde borradores.

## Fallos parciales y duplicados

La confirmación solo aparece después de obtener un caso real del servidor. No usa códigos ficticios ni fechas de validación local como radicados.

Los archivos se envían después de crear el caso y cada resultado se conserva por separado. Si un anexo falla, el caso permanece creado; los demás anexos se intentan y no se vuelve a enviar el POST de creación. Una subida cancelada o no confirmada no se muestra como éxito. El borrador se elimina en cuanto se conoce el caso creado, para que abrir otro formulario no restaure los datos del caso ya radicado.

Si la creación devuelve un error de conexión o de servidor, no se reintenta automáticamente: se muestra que el resultado es incierto y se solicita consultar Mis casos antes de radicar otra vez. El backend no documenta una clave de idempotencia, por lo que el cliente no puede garantizar deduplicación frente a una respuesta perdida tras una escritura exitosa. La confirmación y los resultados por archivo son temporales y están aislados por usuario; tras recargar se consulta Mis casos.

Los anexos de esta interfaz aceptan JPG/JPEG/PNG/WEBP/PDF hasta 15.728.640 bytes por archivo. Es un subconjunto de formatos del backend. No se afirma haber realizado análisis antivirus ni se presentan imágenes de muestra como evidencias enviadas.

## Verificaciones realizadas

- `npm run test:api`: incluye aislamiento de borradores/confirmaciones por usuario, UUID y filtros, campos reales, consentimiento, envío duplicado bloqueado, anexo fallido entre dos exitosos, cancelación, no recreación del caso, descarga JWT, aportes y estado vacío sin datos ficticios.
- `npm run build`: tipos y plantillas de producción.
- Consultas reales con la cuenta ciudadana de prueba autorizada, sin crear casos, aportes ni subir archivos. Se cerró la sesión al terminar; las credenciales no se incluyeron en el código ni en este documento.

Resultado de las consultas reales:

| Endpoint | Resultado |
|---|---|
| Catálogo de departamentos | 200, 0 registros |
| Catálogo de municipios | 200, 0 registros |
| Catálogo de comunidades | 200, 0 registros |
| Catálogo de tipos de caso | 200, 5 registros |
| Catálogo de estados | 200, 5 registros |
| Dashboard ciudadano | 200; campos utilizados presentes |
| Mis casos, página 1 | 200; respuesta paginada, 0 casos |

No se pudo comprobar un expediente real con esa cuenta porque su listado está vacío. Creación, detalle, aportes y archivos se verificaron mediante HTTP simulado y contrato local; siguen pendientes de una prueba real con datos autorizados y territorios cargados. La herramienta de navegador no encontró navegadores habilitados, por lo que no se declara revisión visual en escritorio/móvil ni en ambos temas.

## Antes del despliegue y siguientes módulos

1. El backend debe cargar departamentos, municipios y comunidades válidos para el ámbito de PLUS, con sus relaciones y UUID. No hacen falta tablas nuevas para estos selectores: faltan datos. El frontend no crea territorios ficticios.
2. Subir los cambios del frontend y reconstruir su contenedor. La integración no se despliega por compilar localmente.
3. Probar con una cuenta ciudadana la radicación de un caso autorizado, la persistencia del expediente y una evidencia, y comprobar que un fallo de anexo no crea un segundo caso.
4. [Mensajes y notificaciones ciudadanos ya están conectados](integracion-mensajes-notificaciones.md); continuar después con la gestión administrativa real.
5. Noticias e iniciativas públicas mantienen su contenido estático. Antes de cambiar sus consultas se preparará la carga inicial del contenido existente y sus medios; no se publicaron datos de ejemplo en producción.
