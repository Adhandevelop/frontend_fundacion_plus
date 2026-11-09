# Recuperación, estados de acceso y confirmación local

## Rutas y recorridos

- `/recuperar-contrasena`: accesible desde «¿Olvidaste tu contraseña?» del login. Valida el correo y muestra una confirmación de demostración. No consulta cuentas ni envía correos.
- `/restablecer-contrasena?escenario=valido`: formulario con longitud mínima de 8 caracteres y confirmación coincidente, según la regla visual actual. Limpia los campos al completar. No verifica tokens ni cambia credenciales.
- La misma ruta con `escenario=vencido` o `escenario=invalido` muestra el estado correspondiente y permite volver a solicitar recuperación. Cambiar de escenario limpia los campos y el resultado anterior.
- `/sesion-vencida` y `/acceso-denegado`: estados visuales de demostración. No implementan guards ni comprueban sesiones o permisos.
- `/pagina-no-encontrada`: destino de las rutas desconocidas. Es una vista del router Angular, no una respuesta HTTP 404 del servidor.
- `/ciudadano/casos/confirmacion`: resumen de la validación local del formulario. Su ruta está antes de `casos/:radicado` para evitar interpretarla como un expediente.

## Radicación

Un formulario nuevo comienza vacío en el paso 1, con tipo y prioridad predeterminados y cantidades en cero. Permite cargar expresamente el ejemplo del diseño, reemplazando campos y quitando anexos de ese formulario tras confirmar cuando corresponde.

Al validar campos y marcar ambas declaraciones, se conserva el borrador temporal y se muestra una copia del resumen con nombres y tamaños de anexos. No se envían archivos ni se genera radicado, publicación o registro en Mis Casos. El enlace al expediente de ejemplo identifica que es independiente del formulario.

La confirmación permite continuar editando o empezar un formulario vacío. Al abrir directamente esa ruta o recargar, muestra un estado sin validación disponible. Todo este estado permanece exclusivamente en memoria.

## Integración pendiente

Definir con el backend los contratos de recuperación, token de restablecimiento, política de contraseñas, errores, autenticación, autorización y radicación antes de crear llamadas REST. Estos modelos son de presentación y no constituyen contratos de API.

## Verificación

Compilación de producción con `npm run build`. Comprobaciones locales del validador de contraseñas, campos vacíos y coordenadas obligatorias, copia independiente del resumen, metadatos de anexos y limpieza de borrador y confirmación. Pendiente revisión visual en navegador de ambos temas y tamaños de pantalla.
