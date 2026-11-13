# Problemas activos de integración PLUS

Actualizado: 12 de noviembre de 2026.

Este documento contiene únicamente problemas técnicos abiertos y comprobados. En este momento no hay incidencias activas demostradas; P23 fue cerrado por el backend en `ee000bc` y adaptado en Angular.

Los puntos P01–P23 se conservan en [correcciones-backend-historico.md](correcciones-backend-historico.md). Las funcionalidades que esperan adaptación o pruebas del frontend se registran en [estado-integracion-frontend-backend.md](estado-integracion-frontend-backend.md) y no deben presentarse como errores del backend.

## Resumen activo

| Prioridad | Punto | Problema | Acción requerida |
|---|---|---|---|
| — | — | No hay incidencias activas demostradas. | Continuar pruebas funcionales contra el servidor desplegado. |

## Pendientes que no son errores del backend

Prioridad actual del frontend: verificar con datos desplegados el mapa y el expediente público. La ficha ya consume detalle, historial visible, cambios de estado, evidencias aprobadas, comentarios moderados y seguimiento ciudadano; la capa GeoJSON, los marcadores, la búsqueda y los filtros oficiales también están conectados.

- Desplegar y verificar en navegador la corrección de interoperabilidad y renderizado de Leaflet; se implementó encapsulación de estilos, soporte responsive y `ResizeObserver` en `<plus-map-canvas>`, operativo tanto en portada como en rutas completas. El build de producción local compila correctamente.
- Verificar contra el servidor desplegado los selectores y formularios multipart ya conectados: carga válida, formato inválido, archivo mayor de 15 MB y reemplazo de portada.
- Aprobar los textos, cifras e imágenes antes de ejecutar la carga editorial sin `--draft`.
- Realizar pruebas autenticadas controladas de permisos, revocación y último administrador.
- Probar el recorrido completo de formularios con correo y activación.
- El historial de moderación de comentarios continúa sin ruta GET ni DTO documentado; Angular no puede reconstruirlo desde el comentario actual. Solicitar una colección paginada por comentario con actor, decisión, motivo visible/interno y fecha.
- Validar contra el servidor los ámbitos de responsables ya conectados y adaptar el dashboard por alcance cuando exista una representación diferenciada documentada.
- Probar P19 con contenido publicado; la colección pública estaba vacía durante la última verificación.
- Probar con enlaces reales de Resend las nuevas páginas de confirmación y baja del boletín, incluyendo token inválido, vencido y reutilizado.
- Probar con cuentas institucionales reales el selector de responsables y una actividad con/sin coordenadas.
- El listado, alta y baja de casos seguidos están conectados con UUID reales. La ficha pública ya no contiene un expediente demostrativo y también puede abrirse en `/ciudadano/casos-publicos/:radicado`, conservando la sesión y el layout ciudadano.

### “Mis casos” para cuentas administrativas

El contrato solicitado ya fue entregado e integrado. `/admin/mis-casos` separa “Creados por mí”, mediante `created_by_me=true`, y “Seguidos”, mediante `/api/v1/admin/followed-cases/`, sin utilizar rutas ciudadanas `/me` ni mezclar expedientes asignados.

Estos puntos son validación, contenido o trabajo del frontend. Solo se abrirá un problema nuevo si una prueba contra la versión desplegada demuestra una respuesta incorrecta del backend.
