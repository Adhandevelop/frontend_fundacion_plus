# Jornadas y medios de iniciativas de demostración

## Rutas y organización

Bajo `/admin/iniciativas/:programId/ediciones/:editionId`:

- `/actividades`: agenda con búsqueda, estado, orden cronológico, estado vacío y paginación de cinco registros.
- `/actividades/nueva` y `/actividades/:activityId/editar`: formulario reutilizado.
- `/actividades/:activityId`: ficha de actividad.
- `/medios`: galería y documentos de esa edición.

`/admin/iniciativas/:programId/medios` gestiona medios generales del programa con el mismo componente de galería. Los accesos están en las fichas de programa y edición; las actividades enlazan a los medios compartidos de su edición.

Los modelos y servicios locales de actividades y medios viven en `features/administration/initiatives`, separados de los programas/ediciones. Reutilizan layout, controles y paleta administrativa. No se recibió un mockup específico de estas vistas; siguen el sistema visual existente.

## Actividades

La agenda comienza vacía: no se inventan jornadas realizadas ni fechas institucionales. Cada registro pertenece a una edición del programa indicado; lectura y escritura rechazan referencias cruzadas. Se conserva ese vínculo al editar.

Título obligatorio hasta 200, descripción opcional, lugar hasta 200, inicio obligatorio y fin opcional. Las fechas se introducen y muestran en hora de Bogotá (UTC−5); el estado en memoria conserva ISO UTC. Se valida calendario, hora y fin no anterior al inicio. No se usa la zona horaria del equipo para transformar estas entradas.

Los estados programada, realizada y cancelada proceden del CHECK SQL. Son selecciones de demostración; no generan indicadores, entregas, notificaciones ni cambios en el portal. No se limita la actividad automáticamente al año/periodo de la edición porque esa restricción no está en el esquema: requiere una regla de producto acordada con backend.

Responsable y comunidad son opcionales. Se reutilizan los directorios locales de usuarios y territorios; solo se crean vínculos nuevos con registros activos. Un vínculo existente que después quede inactivo se conserva y puede permanecer mientras se editan otros campos. La lista de usuarios no acredita elegibilidad ni concede permisos: eso requiere contrato y autorización del backend.

Comunidad de actividad y comunidades beneficiadas de la edición son relaciones diferentes; no se añaden entre sí automáticamente. La ubicación es opcional, con ambas coordenadas o ninguna y rangos válidos. No se inventan puntos ni se pide geolocalización; todavía no se presenta un mapa cartográfico.

No hay eliminación de actividades. Descripción permite documentar el ejemplo sin crear una entidad adicional de resultados ni interpretar el texto como un indicador verificado.

## Medios: programa y edición

La relación sigue `iniciativa_multimedia`: programa obligatorio y edición opcional. No se inventa una FK a actividad. Las fichas de jornada lo explican al enlazar a medios de edición; relacionar un archivo con una jornada concreta queda sujeto a AMP-17.

Inicialmente hay una imagen general por programa del diseño, identificada como referencia y sin tamaño inventado. Las ediciones comienzan sin medios. Los nuevos programas tampoco reciben una portada ficticia.

La galería permite añadir archivos locales, filtrar por texto/tipo, editar texto alternativo/descripción/orden, elegir portada y retirar con confirmación. Solo una imagen puede ser portada por ámbito: elegir otra limpia la anterior dentro del mismo programa/edición, sin afectar portadas de otros ámbitos. No se permite portada de video o PDF. Retirar la portada deja el ámbito sin portada hasta elegir otra.

Las fichas administrativas muestran las portadas seleccionadas desde la galería, incluida la de edición cuando existe. El servicio público de iniciativas conserva sus fixtures; estas selecciones no lo modifican.

## Archivos y metadatos

Límites locales propuestos, pendientes del contrato REST:

| Tipo | Formatos | Máximo por archivo |
|---|---|---:|
| Imagen | JPG, PNG, WebP | 5 MB |
| Video | MP4, WebM | 25 MB |
| Documento | PDF | 10 MB |

La selección comprueba tamaño no vacío, extensión y MIME entre los admitidos. No analiza contenido ni sustituye validación del backend, antivirus, autorización de imagen o revisión editorial. No hay subidas ni publicación.

Texto alternativo obligatorio para imágenes, con límite visual propuesto de 250. Descripción opcional. Orden entero de cero a 2147483647; los empates tienen un desempate estable local, sin fingir una restricción de orden único que no existe en SQL. Los medios no se trasladan entre ámbitos desde este editor.

Las imágenes muestran previsualización, los videos controles nativos sin reproducción automática y los PDF un enlace para abrir el archivo local seleccionado. La compatibilidad del video depende del navegador. Subtítulos y accesibilidad del contenido audiovisual real requieren el contrato/recursos correspondientes.

Una URL de objeto se crea solo después de validar y añadir el archivo. Editar metadatos no duplica el archivo. Al retirarlo se revoca su URL; al destruir el servicio se liberan las URLs locales restantes, sin revocar URLs del diseño. Archivos seleccionados pero no añadidos no generan URLs. Cambiar de ámbito limpia el formulario sin alterar registros guardados del ámbito anterior.

## Persistencia e integración pendiente

Todo permanece en memoria y se pierde al recargar. No hay invitaciones, envíos, PDF institucional generado, publicación externa, permisos reales ni auditoría institucional de estas acciones.

Antes de conectar: acordar endpoints de actividades y multimedia, elegibilidad de responsables, zonas horarias, fechas, validación de coordenadas, almacenamiento, límites/tamaño total, política de publicación, precisión geográfica, permisos por objeto, metadatos y unicidad transaccional de portadas. La URL `blob:` no se guarda como ruta de backend.

Pendientes: relación opcional medio–jornada si se aprueba, subtítulos/medios accesibles, portada general integrada al contrato real, vinculación de casos, permisos e historial.

## Verificación

Compilación Angular de producción. Comprobaciones locales de fechas Bogotá/UTC, calendario inválido, fin anterior, coordenadas parciales/fuera de rango, pertenencia programa/edición/actividad, usuarios/comunidades inactivos, formatos/tamaños de archivos, metadatos, portada solo de imagen y única por ámbito, retirada y liberación de URLs. Se verifica también que los fixtures del portal y los indicadores de edición no cambien por estas acciones.

Pendiente revisión visual y de teclado en navegador, ambos temas/tamaños, reproducción de videos y apertura de PDF. Las verificaciones locales no sustituyen esta revisión.
