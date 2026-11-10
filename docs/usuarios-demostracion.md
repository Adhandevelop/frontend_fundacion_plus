# Usuarios y roles de demostración

## Rutas y organización

> Documento histórico. Las rutas de usuarios y roles ya usan REST con rol único, tres estados y permisos de escritura restringidos. Consultar [integracion-usuarios.md](integracion-usuarios.md) para el comportamiento vigente; el multirrol y los datos temporales descritos abajo no alimentan esas vistas.

- `/admin/usuarios`: directorio con filtros, indicadores y paginación de cinco registros.
- `/admin/usuarios/nuevo`: creación de un registro de ejemplo.
- `/admin/usuarios/:id`: detalle y cambio de estado simulado con confirmación.
- `/admin/usuarios/:id/editar`: edición de nombre, correo y roles de referencia.
- `/admin/roles`: consulta de perfiles y alcance previsto en el contexto general del proyecto.

Las rutas específicas de creación y edición se declaran antes del detalle dinámico. El menú administrativo enlaza al directorio.

`features/administration/users` separa datos de ejemplo, servicio de estado local, listado, formulario reutilizado para crear/editar, detalle y referencia de roles. `RolePickerComponent` permite seleccionar varios roles en el formulario. Se reutilizan los controles y temas del layout administrativo; no se recibió un mockup específico de este módulo.

## Datos y comportamiento

Seis perfiles ficticios iniciales usan correos `example.invalid` y muestran su origen. Los cinco roles asignables son Ciudadano, Responsable, Editor institucional, Administrador y Superadministrador, con las descripciones del contexto general. Visitante se presenta como acceso público y no se asigna a cuentas. Los identificadores y estados son modelos de presentación, no contratos de API.

La búsqueda ignora tildes y combina nombre/correo/identificador con filtros de rol y estado. Los indicadores corresponden a toda la selección filtrada. La paginación y el estado vacío dependen del número real de registros locales.

Crear y editar validan nombre con contenido de hasta 150 caracteres, correo con formato válido de hasta 254 caracteres, duplicados de correo sin distinguir mayúsculas ni espacios exteriores y al menos un rol conocido. Los roles repetidos se eliminan. Estos límites y reglas locales deben confirmarse con el backend.

El formulario de edición reutiliza los datos almacenados. Cancelar abandona sus cambios sin guardarlos. Guardar regresa al detalle y muestra un mensaje de resultado de ejemplo. Activar/desactivar cambia solo el estado simulado tras confirmación y se refleja al regresar al listado. Editar mantiene ese estado. No se incluyen contraseñas, invitaciones, eliminación de cuentas ni edición granular de permisos.

Los cambios se conservan únicamente en memoria durante la sesión de la aplicación y se pierden al recargar. Una URL con un identificador desconocido o un registro local perdido muestra un estado no disponible, tanto en detalle como en edición.

## Límites de integración

El directorio es independiente del perfil ciudadano y de los responsables del módulo de casos. No se sincronizan identidades ni se alteran asignaciones. Los roles no habilitan/restringen rutas u operaciones y los estados no bloquean cuentas ni revocan sesiones. La auditoría de casos sigue limitada a eventos de expedientes; no se incorporan estos usuarios ficticios como identidades autenticadas.

No hay HTTP ni contratos REST inventados. Antes de integrar: acordar identidad de usuario, roles y permisos, combinaciones permitidas, alcance territorial, operaciones de administración, límites de edición, protección de perfiles privilegiados, estados, validaciones, paginación, auditoría y autorización del backend.

## Verificación

Compilación Angular de producción. Comprobaciones locales de campos inválidos, roles desconocidos/vacíos, duplicados, creación, edición, conservación del estado, copia de roles, búsqueda sin tildes, filtros combinados, registros desconocidos y conservación de los fixtures originales. Pendiente revisión visual y de navegación/teclado en navegador en ambos temas y tamaños de pantalla.
