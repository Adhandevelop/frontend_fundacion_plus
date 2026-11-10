# Integración del directorio de comunidades

Actualizado: 9 de noviembre de 2026. Sustituye las vistas de comunidades de demostración por consultas y operaciones REST. No modifica Django ni carga registros oficiales desde Angular.

## Arquitectura y alcance

La carpeta `features/administration/territories` conserva listado, ficha y editor en sus rutas actuales. `AdminTerritoriesApiService` reúne los DTO y las llamadas comprobadas con los serializers, viewsets, modelos y manual de endpoints del backend. Se reutilizan layout, estilos, autenticación JWT y manejo común de errores.

| Operación | Contrato utilizado |
|---|---|
| Directorio | `GET /api/v1/admin/communities/` con `municipio`, `tipo`, `activo`, `page`, `page_size`. |
| Ficha | `GET /api/v1/admin/communities/{id}/`. |
| Crear | `POST /api/v1/admin/communities/` con `id_municipio`, `nombre`, `tipo`, `descripcion`. |
| Editar | `PATCH /api/v1/admin/communities/{id}/` con los mismos campos editables. |
| Activar/desactivar | `PATCH /api/v1/admin/communities/{id}/` con únicamente `activo`. |
| Departamentos y municipios | `GET /api/v1/catalogs/departments/` y `/catalogs/municipalities/`, arreglos sin paginar. |

El listado pagina en el servidor, de diez en diez, y usa `count` para el total filtrado. No ofrece búsqueda por texto ni filtro departamental porque `AdminCommunityViewSet` revisado no los procesa. El municipio se selecciona con su departamento visible para distinguir nombres repetidos. Los cambios del formulario se aplican explícitamente; no se calculan métricas globales desde una página.

El editor filtra los municipios del catálogo por departamento y comprueba pertenencia antes de preparar el envío. Tipos reales: barrio, vereda, corregimiento, comuna, sector y otro. El nombre debe contener texto y tener hasta 150 caracteres. Catálogos vacíos o fallidos impiden guardar. No se generan UUID, códigos DANE, territorios o geometrías ficticias.

## Guardado y efectos

Crear y editar requieren revisar un resumen y confirmar. El payload se captura al abrir esa revisión. Se bloquean envíos duplicados; una respuesta incierta no se reintenta automáticamente y obliga a consultar el directorio/ficha. Tras crear, el editor queda completado aunque la navegación falle, para evitar otra creación al pulsar de nuevo.

La edición usa PATCH y omite `ubicacion` y `activo`: conserva la geometría y el estado existentes. La ficha distingue si hay geometría, pero todavía no la representa en un mapa ni la edita. Cambiar el municipio muestra una advertencia para revisar vínculos territoriales.

Activar/desactivar exige confirmación separada y no usa DELETE. El backend solo expone comunidades activas en el catálogo público; el aviso explica ese efecto. La nueva comunidad usa el estado activo predeterminado del modelo. La acción no garantiza que una pantalla pública ya abierta se actualice sin volver a consultar.

Solo el administrador puede consultar y gestionar este módulo con la nueva matriz. Moderador y representante no reciben enlaces ni acceso por URL directa. Ver [permisos-navegacion-administrativa.md](permisos-navegacion-administrativa.md). La autorización definitiva corresponde al backend. Las respuestas tardías de un registro anterior no modifican la nueva ficha/editor ni redirigen desde ellos.

## Verificación y pendientes

- `npm run build`: compilación Angular de producción correcta.
- `npm run test:api`: siete suites correctas. La nueva suite prueba filtros reales, `activo=false`, paginación y página desaparecida, errores, catálogos vacíos, pertenencia departamento/municipio, revisión antes de escribir, PATCH sin geometría/estado, confirmación de activación, respuestas inciertas, navegación fallida, respuestas tardías y permisos de escritura.
- Consultas HTTPS reales de solo lectura: administrador recibió 200 para comunidades inactivas con respuesta paginada vacía; ciudadano recibió 403. Catálogos de departamentos y municipios respondieron 200 con cero registros.
- No se crearon, editaron ni desactivaron comunidades reales para verificar. Las escrituras se cubren con HTTP simulado. No había registros para verificar una ficha real.

P02 sigue abierto: cargar departamentos y municipios oficiales es requisito para crear comunidades y probar radicación ciudadana. P07 sigue aplicando a guardado territorial: el backend no documenta idempotencia o versión esperada. Ver [problemas-integracion.md](problemas-integracion.md).

Quedan fuera: CRUD de departamentos/municipios, importación DANE, edición cartográfica, cuencas oficiales y ámbitos de responsables. El mapa público conserva su integración pendiente. No se afirma revisión visual en navegador ni despliegue de estos cambios locales.
