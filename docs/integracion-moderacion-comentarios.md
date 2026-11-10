# Integración de moderación de comentarios

Actualizado: 9 de noviembre de 2026. Sustituye la demostración en `/admin/comentarios` y `/admin/comentarios/:id`. No conecta todavía el formulario público de comentarios ni modifica el contenido estático del portal.

## Organización y contrato comprobado

Se conserva la carpeta `features/administration/comments`: `AdminCommentsApiService` contiene DTO y llamadas REST; listado y detalle mantienen sus rutas y estilos del layout administrativo. Los datos proceden de `CaseCommentSerializer` y `CommentModerationActionSerializer`, contrastados con el código de Django y `endpoints_info.md`.

| Operación | Endpoint | Comportamiento |
|---|---|---|
| Cola | `GET /api/v1/admin/comments/` | Paginación de servidor de 10 filas, `count`, filtros `estado_moderacion` y `caso` UUID. |
| Ficha | `GET /api/v1/admin/comments/{id}/` | Autor, caso, texto original, fecha y estado. |
| Decisión | `POST /api/v1/admin/comments/{id}/moderation/` | `estado_moderacion`, `motivo`, `notificar_motivo`. |

Se puede abrir la cola desde el expediente con el filtro del caso ya cargado. No se inventan opciones de casos ni totales por estado calculados desde una sola página. No se ofrece búsqueda de texto porque la implementación revisada no la procesa. Los UUID de filtro inválidos no se envían. Una página que dejó de existir vuelve a la primera; errores y vacíos tienen representación propia.

## Decisiones y efectos

- Estados: pendiente, aprobado, rechazado y oculto. Se ofrecen los otros estados conocidos, porque el servidor admite esos destinos. Un estado desconocido no habilita acciones.
- Acciones habilitadas para administrador/moderador; el backend conserva la autorización definitiva. Representantes y ciudadanos no obtienen permisos de moderación por compartir el layout.
- El motivo es opcional al aprobar y se exige de 10 a 2000 caracteres en las otras decisiones como validación del frontend. El backend no impone actualmente ese mínimo.
- `notificar_motivo` es falso inicialmente y tras guardar. Compartir el motivo requiere seleccionar la casilla; la revisión muestra la elección y el texto exactos antes de confirmar.
- El servidor genera una notificación del nuevo estado incluso si el motivo permanece interno. Esto se indica antes de guardar. No se añade un envío de correo o mensaje desde Angular.
- Aprobar un comentario puede incorporarlo a la salida pública de un caso publicado; no aprueba el caso. No se muestra una vista previa fabricada como prueba de publicación real.
- Se conserva el texto original y no se ofrecen borrado, cambios de autor ni edición de contenido.

La confirmación captura el identificador, estado y payload. Se bloquean dobles envíos y no hay reintentos automáticos. Una respuesta de red perdida o 5xx obliga a actualizar y revisar el resultado antes de otra acción. Navegar a otro comentario invalida los efectos visuales de respuestas antiguas. Tras guardar se consulta de nuevo la ficha real.

## Límites y pruebas

El detalle no devuelve motivos, revisor, fecha de decisión ni historial. Se retiró el historial local de ejemplo. Se ofrece un enlace a auditoría reciente del caso con la advertencia de que está limitada; no acredita un historial completo de ese comentario. Ver P07, P12 y P14 en [problemas-integracion.md](problemas-integracion.md).

`npm run test:api`: seis suites correctas, incluyendo filtros/paginación de comentarios, UUID inválido, páginas desaparecidas, revisión antes de escribir, motivo interno frente a compartido, bloqueo de doble envío, errores 400/500, aislamiento al navegar y restricciones por rol. Datos de prueba exclusivamente en memoria.

`npm run build`: compilación de producción correcta. Consultas reales de solo lectura: listado administrativo 200 con estructura paginada y cero comentarios pendientes; cuenta ciudadana 403. No se moderaron comentarios reales, enviaron notificaciones de moderación ni publicaron contenidos para probar. No había registros para comprobar un detalle real. La sesión de prueba genera los accesos habituales del backend.

Pendientes: prueba autorizada con comentarios reales, historial específico de decisiones, control de concurrencia/idempotencia del servidor y revisión visual de escritorio/móvil y ambos temas. Cambios locales, sin despliegue.
