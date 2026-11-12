# Problemas activos de integración PLUS

Actualizado: 12 de noviembre de 2026.

Este documento contiene únicamente problemas técnicos abiertos y comprobados. En este momento no hay incidencias activas demostradas; P23 fue cerrado por el backend en `ee000bc` y adaptado en Angular.

Los puntos P01–P23 se conservan en [correcciones-backend-historico.md](correcciones-backend-historico.md). Las funcionalidades que esperan adaptación o pruebas del frontend se registran en [estado-integracion-frontend-backend.md](estado-integracion-frontend-backend.md) y no deben presentarse como errores del backend.

## Resumen activo

| Prioridad | Punto | Problema | Acción requerida |
|---|---|---|---|
| — | — | No hay incidencias activas demostradas. | Continuar pruebas funcionales contra el servidor desplegado. |

## Pendientes que no son errores del backend

Prioridad actual del frontend: completar primero el mapa público, ciudadano y administrativo con la capa GeoJSON real, filtros de servidor, marcadores, lista sincronizada y navegación al expediente.

- Desplegar y verificar en navegador la corrección de interoperabilidad de Leaflet; el build de producción local ya compila correctamente.
- Verificar contra el servidor desplegado los selectores y formularios multipart ya conectados: carga válida, formato inválido, archivo mayor de 15 MB y reemplazo de portada.
- Aprobar los textos, cifras e imágenes antes de ejecutar la carga editorial sin `--draft`.
- Realizar pruebas autenticadas controladas de permisos, revocación y último administrador.
- Probar el recorrido completo de formularios con correo y activación.
- El historial de moderación de comentarios continúa sin ruta GET ni DTO documentado; Angular no puede reconstruirlo desde el comentario actual. Solicitar una colección paginada por comentario con actor, decisión, motivo visible/interno y fecha.
- Validar contra el servidor los ámbitos de responsables ya conectados y adaptar el dashboard por alcance cuando exista una representación diferenciada documentada.
- Probar P19 con contenido publicado; la colección pública estaba vacía durante la última verificación.
- Probar con enlaces reales de Resend las nuevas páginas de confirmación y baja del boletín, incluyendo token inválido, vencido y reutilizado.
- Probar con cuentas institucionales reales el selector de responsables y una actividad con/sin coordenadas.
- El listado y la baja de casos seguidos ya están conectados. Falta exponer la acción de seguir desde un detalle público real; la ficha `/casos/:radicado` todavía conserva el caso demostrativo y no debe enviar su código ficticio al backend.

### Contrato requerido: “Mis casos” para cuentas administrativas

El módulo solicitado no equivale a los casos asignados. Debe reunir, en secciones separadas, los casos creados por el administrador y los casos públicos que decidió seguir. El contrato actual no permite construirlo correctamente:

- `AdminCaseDetailSerializer` expone `usuario`, pero no un campo inequívoco `creado_por`/`creado_por_nombre` ni un filtro `created_by_me`.
- Las rutas de seguimiento están bajo `/api/v1/me/followed-cases/`, mientras P01 reserva `/me` y `/citizen` para cuentas ciudadanas.

Solicitud recomendada al backend:

1. Registrar `creado_por` al ejecutar `POST /api/v1/admin/cases/` y devolver su UUID/nombre como campos de solo lectura.
2. Aceptar `GET /api/v1/admin/cases/?created_by_me=true`, conservando paginación y filtros existentes.
3. Añadir `GET /api/v1/admin/followed-cases/` y `GET|PUT|DELETE /api/v1/admin/followed-cases/{case_id}/`, con el mismo DTO de `FollowedCase`, sin abrir las rutas ciudadanas `/me` a roles internos.
4. Documentar si eliminar un caso seguido desactiva el registro y si solo se pueden seguir casos aprobados.

Cuando estas rutas estén disponibles, Angular puede construir `/admin/mis-casos` con pestañas “Creados por mí” y “Seguidos”, sin mezclarlo con `/admin/casos-asignados`.

Estos puntos son validación, contenido o trabajo del frontend. Solo se abrirá un problema nuevo si una prueba contra la versión desplegada demuestra una respuesta incorrecta del backend.
