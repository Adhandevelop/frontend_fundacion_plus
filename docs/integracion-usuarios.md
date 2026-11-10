# Integración de usuarios y roles administrativos

Actualizado: 9 de noviembre de 2026. Las rutas `/admin/usuarios`, `/admin/usuarios/nuevo`, `/admin/usuarios/:id`, `/admin/usuarios/:id/editar` y `/admin/roles` usan REST. Se conserva el layout administrativo, sin reutilizar el perfil o la navegación ciudadana.

## Organización y contratos

La carpeta `features/administration/users` mantiene listado, detalle, editor y catálogo de roles. `AdminUsersApiService` reúne tipos y llamadas comprobados con `AdminUserCreateUpdateSerializer`, `AssignUserRoleSerializer`, `AdminUserStatusSerializer`, `RoleSerializer` y `AdminUserViewSet`. El selector anterior de múltiples roles ya no se usa en estas rutas.

| Operación | Endpoint | Datos y alcance |
|---|---|---|
| Listado | `GET /api/v1/admin/users/` | `search`, `id_rol`, `estado`, `page`, `page_size=10`; respuesta paginada. |
| Ficha | `GET /api/v1/admin/users/{id}/` | Identidad, contacto, rol único, estado y fechas. |
| Crear | `POST /api/v1/admin/users/` | Nombres, apellidos, correo, teléfono, `id_rol`, contraseña inicial y estado activo. |
| Editar contacto | `PATCH /api/v1/admin/users/{id}/` | Solo nombres, apellidos, correo y teléfono. |
| Cambiar rol | `PUT /api/v1/admin/users/{id}/role/` | `id_rol` y `motivo`. La respuesta se ignora como DTO general y se vuelve a consultar la ficha. |
| Cambiar estado | `PATCH /api/v1/admin/users/{id}/status/` | `estado` y `motivo`; activo, suspendido o inactivo. |
| Catálogo de roles | `GET /api/v1/admin/roles/?page_size=100` | UUID, nombre, descripción y `assignable`. Si la colección queda incompleta se informa error. |

El listado usa el conteo del servidor. No muestra métricas por estado inferidas desde una página. La búsqueda se anuncia por nombres, apellidos o correo: el código revisado no busca teléfono aunque el manual lo mencione. La referencia de roles muestra las filas reales, sin inventar una matriz de permisos.

## Escrituras y datos sensibles

La interfaz limita todo el módulo a administradores; moderadores y representantes no tienen consulta ni escritura, según la nueva [matriz de navegación](permisos-navegacion-administrativa.md). Las rutas directas también están protegidas. Esta restricción no reemplaza la autorización del backend. Solo se ofrecen los cuatro nombres oficiales de rol que además tengan `assignable=true` en el catálogo. No se ofrecen combinaciones de roles ni permisos granulares.

La edición de contacto no envía contraseña, rol o estado, aunque esos campos pudieran existir en memoria. Rol y estado tienen acciones separadas con motivo y revisión de destinatario/valor anterior/nuevo. Las modificaciones de la propia cuenta se realizan desde `/admin/perfil`; el directorio bloquea su propio rol/estado y su editor de contacto. No se ofrece DELETE.

Crear requiere contraseña inicial de al menos 8 caracteres y confirmación coincidente. La contraseña no aparece en el resumen de revisión ni se guarda en almacenamiento del navegador. Se conserva transitoriamente en memoria para confirmar el envío; se limpia al cancelar, completar, recibir error, cambiar de ruta o destruir el editor. Las pruebas usan contraseñas sintéticas sin registrar datos de cuentas reales. El formulario no implementa invitaciones ni entrega de credenciales.

Cada escritura requiere confirmación explícita. Se captura un resumen estable, se bloquea doble envío, se ignoran respuestas tardías para otro usuario y no hay reintentos automáticos. Ante red/5xx incierto hay que consultar el directorio/ficha antes de repetir. Un alta completada queda bloqueada aunque falle la navegación para impedir crearla otra vez. Las acciones de rol/estado consultan la ficha tras guardar.

El cambio a suspendido/inactivo advierte la pérdida de acceso. El código del servidor elimina el token de sesión y su autenticación JWT revocable consulta ese registro. Esta revocación se comprobó por lectura del código; no se suspendió una cuenta real como prueba. El cambio de rol no presenta la misma invalidación: ver P16.

## Verificación y límites

- `npm run test:api`: ocho suites correctas. La nueva cubre búsqueda/filtros/páginas, catálogo de roles asignables completo, rol único, separación contacto/rol/estado, resumen sin contraseña, limpieza de secretos, bloqueo de acciones propias, restricciones de moderador, respuestas inciertas y aislamiento de respuestas tardías.
- `npm run build`: compilación Angular de producción correcta.
- Consultas HTTPS reales: listado administrativo 200 con cuatro cuentas activas; catálogo 200 con cuatro roles asignables para administrador; ficha de la propia cuenta de prueba 200. La cuenta ciudadana recibió 403 en el listado. Solo se registraron conteos y nombres de campos, sin copiar datos personales.
- No se crearon cuentas, cambiaron contactos/contraseñas/roles/estados ni enviaron invitaciones reales. Las escrituras se probaron con HTTP simulado.

Pendientes: correcciones del backend P15/P16, ámbitos de responsables, prueba funcional autorizada de escrituras, política de entrega de credenciales iniciales y revisión visual en ambos temas/escritorio/móvil. No se afirma despliegue ni prueba real de suspensión o escalamiento de privilegios.
