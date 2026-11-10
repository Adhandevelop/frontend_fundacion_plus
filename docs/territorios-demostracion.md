# Comunidades y territorios de demostración

## Vistas y arquitectura

> Documento histórico de la demostración. El listado, la ficha y el editor de comunidades ya usan REST. Consultar [integracion-territorios.md](integracion-territorios.md) para el alcance vigente, permisos y pruebas. Los ejemplos temporales descritos aquí no alimentan esas rutas administrativas.

- `/admin/comunidades`: directorio con búsqueda, filtros dependientes, indicadores, estado vacío y paginación de cinco registros.
- `/admin/comunidades/nueva`: creación de comunidad de ejemplo.
- `/admin/comunidades/:id`: detalle y activación/desactivación simulada con confirmación.
- `/admin/comunidades/:id/editar`: formulario reutilizado para editar.

Las rutas específicas se declaran antes del detalle dinámico. La navegación está conectada al menú administrativo. `features/administration/territories` separa modelos de presentación/fixtures, servicio local, listado, editor y detalle; reutiliza layout y controles administrativos. No se recibió un mockup específico del catálogo: se sigue el sistema visual existente.

## Datos y relación con el esquema

Los tipos proceden del CHECK de `comunidades` en `base de datos.md`: barrio, vereda, corregimiento, comuna, sector y otro. Las comunidades se relacionan con un municipio, del cual se obtiene el departamento; no se guarda un segundo departamento independiente en el registro.

Hay cuatro comunidades, cuatro municipios y dos departamentos de ejemplo. Nombres conocidos del diseño se usan como referencia, con tipos y descripciones identificados como demostrativos. Los identificadores son locales: no representan UUID ni códigos DANE. No hay geometrías oficiales ni se generan puntos/polígonos ficticios.

El nombre requiere contenido y hasta 150 caracteres. Municipio y tipo deben pertenecer al catálogo local. La descripción es opcional y no se inventa un límite SQL para el campo TEXT. Se comprueba la combinación municipio, tipo y nombre exacto tras quitar espacios exteriores, correspondiente a la clave única del SQL. La búsqueda ignora tildes, pero esa búsqueda no cambia las reglas de unicidad.

## Recorridos

Cambiar el departamento limpia el municipio en filtros y formulario para evitar combinaciones anteriores incoherentes. Guardar valida también la pertenencia del municipio al departamento seleccionado. El servicio guarda solo el municipio canónico y valida su existencia.

Los filtros se combinan por texto, departamento, municipio, tipo y estado. Indicadores y paginación usan toda la selección filtrada. Las opciones territoriales se obtienen del catálogo completo de ejemplos, no solo de las filas de una página.

Crear/editar regresa al detalle. Cancelar no guarda. Activar/desactivar conserva el registro y solo cambia su estado local; editar no modifica ese estado. No hay eliminación, edición de DANE ni alta de departamentos/municipios. Una referencia desconocida o perdida tras recargar muestra un estado no disponible.

Todo permanece en memoria y es independiente de casos, perfiles y formularios de radicación. No modifica sus catálogos ni representa cambios oficiales, permisos o asignaciones. El registro de auditoría de casos no incorpora automáticamente estos cambios territoriales.

## Pendientes

Integración REST, catálogos oficiales, permisos, consulta de casos asociados, gestión de ámbitos de responsables y definición de si se permite administrar departamentos/municipios. La geometría de comunidad es MultiPolygon 4326 según SQL; su visualización/edición requiere datos reales y un contrato específico. No se sustituye por el punto de un caso.

## Verificación

Compilación Angular de producción. Comprobaciones locales de validación, unicidad compuesta, creación/edición, conservación del estado, jerarquía, filtros sin tildes, resultados vacíos y fixtures intactos. Pendiente revisión visual y de navegación/teclado en navegador para ambos temas y tamaños.
