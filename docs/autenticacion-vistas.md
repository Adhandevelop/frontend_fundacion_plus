# Vistas de acceso ciudadano

- `/login`: formulario de correo, contraseña y opción de recordar sesión.
- `/registro`: nombre, correo, contraseña y confirmación, vinculación comunitaria, consentimiento y notificaciones opcionales.

Las rutas usan un layout de autenticación con navegación al inicio, selector persistente de tema y pie compacto. Los enlaces del encabezado público y los enlaces entre ambos formularios utilizan el router de Angular.

Los diseños claros y oscuros se integran en una sola plantilla por pantalla. Las reglas de color están limitadas a `.auth-shell`, sin afectar las otras vistas. El control de visibilidad de contraseña y los errores de campos son componentes compartidos.

Los formularios son reactivos. El registro valida campos requeridos, formato de correo, coincidencia de contraseñas y consentimiento. El mínimo visual de ocho caracteres procede del diseño y debe contrastarse con la política del backend antes de integrar el registro. La barra refleja longitud, no garantiza fortaleza de contraseña. La vinculación seleccionada no concede permisos.

La entrega es exclusivamente visual: no hay solicitudes HTTP, cuentas creadas, sesiones simuladas, correos de verificación ni credenciales almacenadas. La recuperación informa que todavía no está disponible. Recordar sesión y notificaciones son opciones de formulario sin efectos persistentes.

Pendientes de contrato: endpoints, campos de registro, política de contraseñas, verificación de correo, errores, entrega/renovación de JWT y almacenamiento de sesión.

Validar con `npm run build`. Revisar ambos temas y tamaños de pantalla, navegación, errores por campo, contraseñas diferentes, consentimiento y controles de visibilidad en navegador.
