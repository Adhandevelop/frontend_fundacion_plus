# Administración: dashboard y gestión general de casos

Rutas:

- `/admin`: dashboard con contexto institucional, indicadores, gráficos de estados, carga territorial, casos recientes, tareas y actividad de ejemplo.
- `/admin/casos`: indicadores y tabla general con filtros y revisión de expedientes.
- `/admin/informes`: indicadores calculados, distribuciones y CSV de los casos de ejemplo filtrados; ver `informes-administrativos.md`.
- `/admin/auditoria`: actividad local de expedientes con filtros y detalle; ver `auditoria-demostracion.md`.
- `/admin/usuarios`: directorio ficticio, creación/edición, detalle y estados locales; `/admin/roles`: referencia de roles. Ver `usuarios-demostracion.md`.
- `/admin/comunidades`: directorio territorial, detalle y creación/edición de comunidades de ejemplo. Ver `territorios-demostracion.md` e `inventario-vistas-pendientes.md`.
- `/admin/noticias`: listado, borradores, vista previa y revisión/publicación simulada. Ver `noticias-administrativas.md`.
- `/admin/iniciativas`: programas, publicación, ediciones anuales, indicadores y cobertura local. Ver `iniciativas-administrativas.md`.
- Desde las fichas de programa/edición: medios generales/anuales y agenda de actividades con creación/edición/detalle. Ver `jornadas-medios-demostracion.md`.
- `/admin/postulaciones`: bandeja REST, filtros, detalle y revisión persistida de propuestas. Ver `iniciativas-administrativas.md`.
- `/admin/comentarios`: cola y decisiones locales de moderación con vista previa e historial. Ver `moderacion-comentarios-demostracion.md`.

Un layout administrativo compartido incorpora barra lateral adaptable, encabezado, selector persistente de tema y navegación al portal. Las rutas y pantallas se cargan de forma diferida. Existe un acceso explícito a la demostración desde el layout de login/registro, sin simular autenticación.

El dashboard conserva las variantes claras y oscuras recibidas. El módulo general se recibió en claro y se adapta también a oscuro. Todos los estilos están limitados a `.admin-shell`.

La tabla se reutiliza en modo compacto y general. Los registros se separan en `admin-cases.demo.ts` como modelos de presentación, no contratos REST. El dashboard conserva sus cuatro registros y términos de ejemplo; la gestión utiliza los ocho registros de su diseño. El primer código de ejemplo se armoniza con `PLUS-2025-084` para acceder a la ficha pública ya construida.

La búsqueda ignora tildes. Los filtros trabajan sobre los campos disponibles de los ejemplos; la cuenca procede del territorio expresado en el diseño. El filtro de tipo permanece desactivado porque ese dato no está especificado en las filas. Paginación y estados vacíos reflejan el número real de ejemplos, sin inventar las páginas adicionales del mockup.

Revisar/Asignar abre una sección con el expediente, responsable propuesto y nota. La validación solo comprueba el formulario local; no guarda ni aplica asignaciones, cambios de estado, decisiones de publicación o actuaciones institucionales. El ejemplo conocido enlaza con su ficha pública; no se atribuyen esos detalles a los otros registros.

Indicadores, gráficos, tareas, plazos y actividad son demostrativos. Los informes disponen de una vista calculada sobre ocho registros y sus cambios temporales, con descarga CSV local. Auditoría dispone de una vista del registro temporal de acciones de los expedientes. Usuarios dispone de un directorio y edición locales sin modificar cuentas ni permisos reales. Alertas, territorios y noticias no ejecutan operaciones reales.

No hay datos administrativos reales ni autorización implementada: antes de consumir la API se deben definir contratos de sesión y permisos, y agregar la protección de rutas junto con las autorizaciones del backend. Los estados del mockup se conservan como etiquetas de presentación y no se establecen como estados canónicos de gestión o moderación.

Verificar con `npm run build`. Revisar visualmente ambos temas, escritorio/móvil, menú, búsqueda, filtros, páginas, estado vacío y formulario de revisión. La compilación no sustituye esa revisión en navegador.
