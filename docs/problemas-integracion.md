# Problemas activos de integración PLUS

Actualizado: 13 de noviembre de 2026.

Este documento contiene únicamente problemas técnicos abiertos y comprobados. P23 fue cerrado por el backend en `ee000bc` y adaptado en Angular. El 13 de noviembre se confirmó una nueva respuesta 5xx al consultar envíos de un formulario real.

Los puntos P01–P23 se conservan en [correcciones-backend-historico.md](correcciones-backend-historico.md). Las funcionalidades que esperan adaptación o pruebas del frontend se registran en [estado-integracion-frontend-backend.md](estado-integracion-frontend-backend.md) y no deben presentarse como errores del backend.

## Resumen activo

| Prioridad | Punto | Problema | Acción requerida |
|---|---|---|---|
| Alta | P25 | `GET /api/v1/admin/forms/{id}/submissions/?page=1&page_size=20` responde 5xx para el formulario “arreglo vial”. | Revisar traceback de Django y devolver página vacía o paginada válida, nunca 500. |

## P25 — Error 5xx al listar respuestas de formularios — Abierto

La ficha administrativa del formulario carga correctamente, por lo que autenticación, identificador y acceso a `/admin/forms/{id}/` funcionan. La siguiente solicitud del frontend, `GET /api/v1/admin/forms/{id}/submissions/?page=1&page_size=20`, recibe una respuesta 5xx y Angular muestra el mensaje de indisponibilidad.

El contrato usado por Angular coincide con el acordado: `count`, `next`, `previous` y `results`. Si todavía no existen envíos, la respuesta esperada es `200` con `results: []`. Para cerrar P25 el backend debe entregar el traceback del contenedor, corregir la excepción y probar al menos formularios con cero envíos, con un envío anónimo pendiente de activación y con un envío vinculado.

Angular añadió una acción segura de reintento y conserva la vista sin modificar datos, pero no puede corregir una excepción 5xx del servidor.

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
- El mapa público solo puede incluir expedientes aprobados con geometría `Point`. El 13 de noviembre se observaron seis casos aprobados en administración, pero el GeoJSON devolvió únicamente dos; los cuatro restantes no tienen un punto utilizable. Angular ahora exige seleccionar ubicación al crear nuevos casos administrativos. Para reparar expedientes existentes, el backend debe documentar o incorporar una acción administrativa segura que permita actualizar `ubicacion`/`latitud`/`longitud`, con validación geográfica y auditoría. No se inventarán coordenadas desde el nombre del barrio.

### “Mis casos” para cuentas administrativas

El contrato solicitado ya fue entregado e integrado. `/admin/mis-casos` separa “Creados por mí”, mediante `created_by_me=true`, y “Seguidos”, mediante `/api/v1/admin/followed-cases/`, sin utilizar rutas ciudadanas `/me` ni mezclar expedientes asignados.

Estos puntos son validación, contenido o trabajo del frontend. Solo se abrirá un problema nuevo si una prueba contra la versión desplegada demuestra una respuesta incorrecta del backend.
