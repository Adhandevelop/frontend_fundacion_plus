# Radicación y casos ciudadanos

Rutas:

- `/ciudadano/casos`: panel con indicadores, tabla de casos, actividad y mensajes de ejemplo.
- `/ciudadano/casos/nuevo`: radicación de cinco pasos con resumen editable.

Ambas pantallas comparten un layout ciudadano con navegación adaptable y el tema persistente. Se distinguen de las vistas públicas y de autenticación. Son demostraciones accesibles sin sesión: no constituyen autorización para acceder a datos reales.

## Diseños recibidos

La radicación incluye diseños claro y oscuro del paso 5. Se conserva el resumen y se añaden formularios para editar los pasos de tipo, información, ubicación y anexos con los campos visibles en ese resumen. Abre en el paso 1, con campos de contenido vacíos y coordenadas sin definir. El botón «Cargar ejemplo del diseño» permite revisar el resumen de referencia; pide confirmar antes de reemplazar datos editados, anexos o un borrador restaurado. Las declaraciones comienzan sin marcar.

Los dos archivos de Mis Casos son idénticos y oscuros; la variante clara se adapta a la paleta del portal. La tabla usa cinco registros locales del mockup, separados en `cases.demo.ts`; no son contratos REST. El código del primer ejemplo se unifica con `PLUS-2025-084` para enlazar al expediente ya implementado. Los demás registros disponen de resumen propio y no reutilizan la información detallada de otro caso.

## Comportamiento

La tabla permite buscar sin distinguir tildes, filtrar por estado y tipo, abrir un resumen y consultar el expediente de ejemplo. La paginación se calcula sobre los registros existentes; no se inventan las páginas adicionales del diseño.

La radicación valida campos requeridos, cantidades no negativas y coordenadas en sus rangos. El resumen refleja los valores editados. La selección de archivos acepta JPG, PNG y PDF de hasta 15 MB por archivo, según el mockup; esos límites se deben confirmar con el backend. Los archivos permanecen en memoria, pueden quitarse y no se suben ni se analizan con antivirus. Las evidencias visuales del diseño se identifican como ejemplos.

Guardar borrador conserva los campos y archivos únicamente en memoria durante la sesión de la aplicación. Se restaura al regresar a la ruta y se pierde al recargar. No hay autoguardado, almacenamiento persistente ni envío. Validar muestra el resultado local: no genera código, no publica y no añade un caso a la tabla.

Mensajes, perfil y notificaciones disponen de vistas locales documentadas en `comunicacion-perfil-ciudadano.md`. Los informes administrativos de casos se documentan en `informes-administrativos.md`. Los datos de identidad, indicadores y actividad son demostrativos.

## Verificación

Ejecutar `npm run build`. Revisar en navegador ambos temas y tamaños, filtros de tabla y estado vacío, navegación al expediente, modificación de los pasos, coordenadas inválidas, selección y eliminación de anexos, restauración temporal del borrador y declaraciones sin marcar.

La integración de sesión, permisos, catálogos territoriales, categorías, moderación, subida de evidencias y radicación requiere los contratos del backend.
