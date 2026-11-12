# Administración de iniciativas y ediciones

Actualizado: 11 de noviembre de 2026.

## Integrado con REST

- `/admin/iniciativas`: listado paginado desde `/api/v1/admin/initiatives/`, filtro de publicación en servidor y búsqueda local sobre la página recibida.
- `/admin/iniciativas/nueva` y `/admin/iniciativas/:id/editar`: creación y edición de título, subtítulo, categoría, descripciones y estado operativo.
- `/admin/iniciativas/:id`: ficha real, portada existente, contenido, estado operativo/editorial y ediciones anidadas.
- `/admin/iniciativas/:id/ediciones/nueva` y `/:editionId/editar`: creación y actualización mediante `/api/v1/admin/initiative-editions/`, con relación UUID explícita al programa.
- Transiciones confirmadas entre borrador, pendiente, publicada y rechazada, además del destacado de programas publicados.
- El `slug` lo genera Django y Angular lo trata como solo lectura.
- El guard administrativo conserva el módulo para administrador/moderador según la matriz vigente.

Las pruebas HTTP verifican paginación/filtro, payload de creación sin `slug` inventado y PATCH de publicación/destacado. No se realizaron escrituras en producción.

## Ediciones integradas

Las ediciones recibidas dentro del detalle se muestran con año, nombre, temporada, estado y conteos de indicadores, comunidades y actividades. El editor conectado guarda año, fechas, temporada, descripción y estado operativo; valida localmente el orden de las fechas y deja la unicidad anual definitiva al backend.

## Medios integrados

La galería general y la galería por edición consultan los medios anidados del programa. Permiten subir archivos mediante `FormData`, marcar portada, definir texto alternativo, descripción y orden, previsualizar imágenes o videos, abrir documentos y eliminar un medio. Angular valida los formatos acordados y el límite de 15 MB antes del envío; la validación definitiva permanece en el backend.

## Postulaciones integradas

`/admin/postulaciones` consume el listado paginado real, con búsqueda, estado e iniciativa solicitada como filtros del servidor. El detalle muestra contacto, territorio, consentimiento y resultado de revisión. Las decisiones usan PATCH sobre `/api/v1/admin/proposals/{id}/` con `estado`, `respuesta` e `iniciativa_generada`; el actor y la fecha quedan bajo responsabilidad del backend.

## Actividades integradas

La agenda por edición, el editor y la ficha consumen `/api/v1/admin/initiative-activities/`. Angular envía la edición y comunidad opcional por UUID, título, descripción, fechas convertidas desde hora de Bogotá a UTC, lugar y estado. El listado y detalle presentan `responsable_nombre` y `comunidad_nombre`. Responsable y coordenadas permanecen fuera del payload hasta confirmar elegibilidad, formato de escritura, precisión y reglas de exposición.

## Indicadores integrados

La ficha de edición consulta y administra `/api/v1/admin/initiative-metrics/`. Conserva `valor` como cadena decimal, y permite nombre, unidad, descripción, icono, medición estimada/real, orden y fecha de corte. Crear, editar y eliminar se mantienen asociados al UUID de la edición.

La cobertura territorial consulta y administra `/api/v1/admin/initiative-communities/`. El formulario selecciona una comunidad activa del catálogo administrativo, envía los UUID de edición y comunidad, permite observaciones y exige confirmación antes de retirar el vínculo. No crea comunidades ni altera su geometría desde iniciativas.

Los vínculos con casos consultan `/api/v1/admin/initiative-case-links/?edicion={uuid}` y administran el mismo recurso. La interfaz permite `hallazgo`, `seguimiento`, `resultado` y `otro`, conserva observaciones y usa `/initiative-case-links/candidates/?edicion={uuid}` para recibir casos aprobados todavía no vinculados. El selector incorpora búsqueda y paginación server-side; no depende de `/admin/cases/` ni de sus permisos.

## Aún demostrativo

- Responsable y ubicación geográfica editable de actividades.

Estos campos todavía no se presentan como datos guardados ni como publicación institucional hasta completar su conexión.

## Estado del backend

El backend reportó implementadas la proyección pública, las acciones editoriales y la auditoría de subrecursos. El multipart de medios P21, corregido en `54dd730`, ya está conectado en Angular y solo falta su prueba autenticada contra el servidor. Consultar [correcciones-backend-historico.md](correcciones-backend-historico.md) y [problemas-integracion.md](problemas-integracion.md).

## Verificación

- `npm run build`: correcto.
- `npm run test:api`: correcto, incluida la suite pública y administrativa de iniciativas.
- `npm run content:check`: inventario editorial vigente.
- Pendientes: prueba con una cuenta controlada, revisión responsive/teclado y recorrido real crear → revisar → publicar → consultar en portal.
