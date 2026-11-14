# Problemas activos de integración PLUS

Actualizado: 13 de noviembre de 2026.

Este documento contiene únicamente problemas técnicos abiertos y comprobados. P25 y P26 quedaron cerrados y verificados en producción con el backend `621aa08`. En este momento no hay incidencias técnicas activas demostradas.

Los puntos P01–P23 se conservan en [correcciones-backend-historico.md](correcciones-backend-historico.md). Las funcionalidades que esperan adaptación o pruebas del frontend se registran en [estado-integracion-frontend-backend.md](estado-integracion-frontend-backend.md) y no deben presentarse como errores del backend.

## Resumen activo

| Prioridad | Punto | Problema | Acción requerida |
|---|---|---|---|
| — | — | No hay incidencias técnicas activas demostradas. | Continuar las pruebas funcionales y de aceptación. |

> P26 quedó cerrado y verificado en producción con `621aa08`: el detalle expone las coordenadas y la reparación geográfica utiliza el endpoint auditado `PATCH /api/v1/admin/cases/{id}/location/`.

## P25 — Error 5xx al listar respuestas de formularios — Cerrado y verificado

El backend corrigió el manejo de teléfonos nulos, la resolución por UUID o slug, los consentimientos legales y la paginación estándar. En `621aa08` se verificaron en producción tanto el listado como el detalle de cada respuesta.

El contrato usado por Angular se mantiene en `count`, `next`, `previous` y `results`; un formulario sin envíos responde `200` con `results: []`.

Angular conserva la acción segura de reintento ante fallos de red.

## P26 — Reparación administrativa de coordenadas — Integrado

El backend consolidó en `621aa08` `PATCH /api/v1/admin/cases/{id}/location/` con validación geográfica y auditoría, además de exponer las coordenadas guardadas en el detalle. Angular incorporó en “Gestión del caso” un editor cartográfico que restaura el punto actual, permite usar la geolocalización o ajustar manualmente, solicita confirmación y recarga el expediente después de guardar.

## P24 — Documentos asociados a respuestas y seguimientos — Resuelto

El backend cerró P24 en `bdc2cfa`. `POST /admin/cases/{id}/progress/` acepta multipart con `files`, o JSON con `evidence_ids`, persiste `id_seguimiento` y devuelve `evidencias` dentro de cada avance. Angular ya envía documentos en la misma operación de seguimiento y los muestra bajo la respuesta correspondiente en administración y ciudadanía.

Se conserva la regla de seguridad: un seguimiento público no publica automáticamente sus documentos; cada evidencia requiere audiencia pública y revisión aprobada.

## Pendientes que no son errores del backend

Prioridad actual del frontend: verificar con datos desplegados el mapa y el expediente público. La ficha ya consume detalle, historial visible, cambios de estado, evidencias aprobadas, comentarios moderados y seguimiento ciudadano; la capa GeoJSON, los marcadores, la búsqueda y los filtros oficiales también están conectados.

- Desplegar y verificar en navegador la corrección de interoperabilidad y renderizado de Leaflet; se implementó encapsulación de estilos, soporte responsive y `ResizeObserver` en `<plus-map-canvas>`, operativo tanto en portada como en rutas completas. El build de producción local compila correctamente.
- Verificar contra el servidor desplegado los selectores y formularios multipart ya conectados: carga válida, formato inválido, archivo mayor de 15 MB y reemplazo de portada.
- Aprobar los textos, cifras e imágenes antes de ejecutar la carga editorial sin `--draft`.
- Realizar pruebas autenticadas controladas de permisos, revocación y último administrador.
- Probar el recorrido completo de formularios con correo y activación.
- El historial de moderación de comentarios está conectado mediante `GET /admin/comments/{id}/history/`; el backend confirmó también el alias `/moderation-history/` y su DTO detallado.
- Validar contra el servidor los ámbitos de responsables ya conectados y adaptar el dashboard por alcance cuando exista una representación diferenciada documentada.
- Probar P19 con contenido publicado; la colección pública estaba vacía durante la última verificación.
- Definir claves públicas y administrables para correo, teléfono, dirección/sede, horario, cobertura territorial y redes oficiales. `/public/site/` ya permite integrar documentos legales, pero esos canales institucionales todavía no forman parte de su contrato.
- Probar con enlaces reales de Resend las nuevas páginas de confirmación y baja del boletín, incluyendo token inválido, vencido y reutilizado.
- Probar con cuentas institucionales reales el selector de responsables y una actividad con/sin coordenadas.
- El listado, alta y baja de casos seguidos están conectados con UUID reales. La ficha pública ya no contiene un expediente demostrativo y también puede abrirse en `/ciudadano/casos-publicos/:radicado`, conservando la sesión y el layout ciudadano.
- El mapa público solo incluye expedientes aprobados con geometría `Point`. Angular exige seleccionar ubicación al crear nuevos casos administrativos y permite reparar expedientes existentes mediante el endpoint auditado de P26. No se inventan coordenadas desde el nombre del barrio.

### “Mis casos” para cuentas administrativas

El contrato solicitado ya fue entregado e integrado. `/admin/mis-casos` separa “Creados por mí”, mediante `created_by_me=true`, y “Seguidos”, mediante `/api/v1/admin/followed-cases/`, sin utilizar rutas ciudadanas `/me` ni mezclar expedientes asignados.

Estos puntos son validación, contenido o trabajo del frontend. Solo se abrirá un problema nuevo si una prueba contra la versión desplegada demuestra una respuesta incorrecta del backend.
