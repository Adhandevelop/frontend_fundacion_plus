# Administración de noticias de demostración

## Rutas y organización

- `/admin/noticias`: listado con búsqueda, categoría, estado, indicadores, vacío y paginación de cinco registros.
- `/admin/noticias/nueva`: crear un borrador temporal.
- `/admin/noticias/:id/editar`: editor reutilizado.
- `/admin/noticias/:id`: revisión, vista previa y transiciones simuladas.

Las rutas específicas se declaran antes del detalle y se enlaza el módulo desde el menú administrativo. `features/administration/news` separa fixtures/modelos, servicio local, listado, editor, revisión y un componente reutilizable de vista previa. Se reutiliza el sistema visual administrativo; no se recibió un mockup específico de este módulo.

## Datos y estados

Los cuatro ejemplos iniciales reutilizan títulos, extractos e imágenes del diseño público; el cuerpo repite el extracto y no se presenta como un artículo completo institucional. El catálogo administrativo es independiente de `NEWS_DEMO`: publicar, rechazar o editar no cambia Inicio ni Noticias públicas.

Los estados locales son borrador, en revisión, publicada y rechazada. No son códigos de API aprobados: el modelo de noticias se ha solicitado en AMP-01 del documento de endpoints y no figura en las 30 tablas del esquema inicial.

Crear/editar guarda un borrador, limpia el rechazo previo y quita el destacado. El borrador puede enviarse a revisión; desde revisión puede publicarse o rechazarse con motivo de entre 10 y 2000 caracteres. Un rechazado puede solicitar revisión otra vez. Un publicado puede volver a borrador; solo publicados pueden destacarse. Las transiciones se comprueban también en el servicio, no solo ocultando botones. Los cambios de estado requieren confirmación en la vista de revisión.

Los límites locales son título 200, slug 220, extracto 1000, cuerpo 30 000 y texto alternativo 250. Son reglas de presentación propuestas pendientes de contrato. Título, categoría, extracto y cuerpo son obligatorios. El slug requiere minúsculas/números/guiones y unicidad; puede generarse desde el título. El contenido se muestra con interpolación de texto, sin `innerHTML` ni ejecución de HTML.

## Portada y vista previa

La portada es opcional. La selección local admite JPG, PNG y WebP hasta 5 MB como límite de demostración. Requiere texto alternativo cuando hay imagen. La URL de objeto queda en el borrador; no hay subida ni almacenamiento remoto.

El editor libera imágenes locales descartadas y las seleccionadas sin guardar al salir. Tras guardar, el servicio conserva la URL para la vista previa y la libera si se reemplaza o retira en otro guardado. Las URLs iniciales del diseño no se revocan. No se guardan URLs `blob:` como supuestos archivos del backend.

La vista previa del formulario refleja cambios sin guardarlos. Cancelar deja el registro anterior. Identificadores desconocidos o borradores perdidos tras recargar muestran un estado no disponible. Los timestamps indican cambios locales, no fechas de publicación institucionales.

## Límites y pendientes

No hay sesión editorial, autoría verificada, correo, publicación externa, programación, archivos PDF, galería múltiple, gestión de categorías ni auditoría real. La auditoría de casos no se reutiliza como si acreditara actuaciones editoriales. Los datos se pierden al recargar.

Conectar API después de acordar AMP-01, campos/estados, permisos, historial, gestión transaccional de medios y fechas reales. Revisión visual pendiente de ambos temas, tamaños, teclado y previsualización de imágenes.

## Verificación

Compilación Angular de producción. Comprobaciones locales de entradas inválidas, slug duplicado, transiciones válidas/denegadas, motivo de rechazo, vuelta a borrador al editar, destacado limitado a publicados, limpieza de portada reemplazada, filtros y aislamiento de fixtures públicos.
