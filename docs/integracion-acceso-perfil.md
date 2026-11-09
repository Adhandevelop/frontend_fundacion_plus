# Integración de acceso y perfil

Fecha: 9 de noviembre de 2026. Primera entrega de integración REST. Contratos sincronizados desde `backend_fundacion_plus/endpoints_info.md` y `openapi-schema.yaml` (1.2.0), conservados en la raíz como `endpoints_info.md` y `endpoints.md`.

## Alcance conectado

- Login y registro con `user` y `tokens`; nombres y apellidos separados. Registro crea una cuenta ciudadana; no permite elegir privilegios.
- Almacenamiento de access/refresh en sessionStorage; la opción de recordar sesión usa localStorage. No se guardan contraseñas ni se persiste el perfil/rol como autoridad de acceso.
- Restauración con consulta a `/me/`, renovación compartida ante solicitudes simultáneas con 401 y conservación del refresh rotado. Un 403 no intenta renovar.
- Logout confirma la operación del servidor antes de limpiar la sesión. Si falla la conexión permite reintentar; no informa una revocación inexistente.
- Guards para rutas ciudadanas y administrativas. Administración reconoce los permisos reales por módulo/acción de `/me/`, incluido `all: ['*']`; mantiene compatibilidad con las capacidades booleanas del ejemplo documentado. Los guards no sustituyen los permisos del backend.
- Recuperación por correo, validación de enlace y confirmación. Enlace del frontend: `/restablecer-contrasena?uid=<uid>&token=<token>`, o `?token=<uid>.<token>`.
- Perfil: lectura y edición de nombres, apellidos, correo, teléfono y UUID de residencia. Departamentos, municipios y comunidades provienen de catálogos; las selecciones dependientes se limpian al cambiar de territorio.
- Fotografía JPG/PNG/WEBP, hasta 15.728.640 bytes, con multipart `photo`. Se guarda al seleccionar, mediante `/me/photo/`, y usa la URL pública devuelta por el backend. Eliminación soporta 204.
- Preferencias con `notificar_novedades_casos`, `notificar_mensajes`, `suscrito_boletin`. Se guardan mediante una acción separada de los datos personales para no presentar una operación parcialmente guardada como éxito completo.
- Estados de carga, errores, reintento y bloqueo de envíos duplicados.

El perfil de cuenta se reutiliza desde `shared/account-profile`: `/admin/perfil` permanece dentro del layout y navegación administrativos, mientras `/ciudadano/perfil` conserva los del portal ciudadano. El enlace administrativo apunta a su propia ruta, protegida por el guard de administración. El componente tiene estilos encapsulados para funcionar en ambos layouts y temas, sin depender de haber abierto antes el panel ciudadano. No cambia el contrato de `/me/`.

Los portales son excluyentes: `/ciudadano/**` exige rol ciudadano sin permisos administrativos y `/admin/**` exige rol interno reconocido más permisos administrativos. El acceso cruzado devuelve la vista de acceso denegado, sin redirigir al perfil del otro portal. Los guards se ejecutan al entrar y al navegar entre rutas hijas, comprobando los requisitos de los ancestros incluso cuando una hija tiene sus propios datos de ruta. El retorno después del login solo admite destinos del portal autorizado.

## Configuración

Producción usa el mismo origen del sitio: `/api/v1`, definido en `src/app/core/api/api.config.ts`. El interceptor solo adjunta credenciales al origen y prefijo configurados; no a imágenes ni a terceros. La entrega de imágenes públicas pasa por `/api/v1/public/media/...`, por lo que no hace falta exponer todo `/media/` en Nginx.

En desarrollo, `npm start` usa `proxy.conf.json` hacia `127.0.0.1:8000`. Cambiar únicamente ese destino si Django se ejecuta en otra dirección. No configurar credenciales en ese archivo.

Nginx del contenedor permite cuerpos de 64 MB, conservando el límite de 15 MB por archivo del backend. El Nginx exterior del servidor también debe permitir el tamaño de petición necesario: `client_max_body_size 64m;` dentro del bloque de este dominio, validando con `nginx -t` antes de recargar. La configuración del host no está en este repositorio y no se modificó remotamente.

## Verificación realizada

`npm run build` compila los componentes y plantillas. `npm run test:api` usa HttpTestingController contra los servicios e interceptor reales, sin contactar la API ni crear usuarios. Comprueba almacenamiento, límites de envío de credenciales, renovación concurrente/rotada, permisos, PATCH de perfil y preferencias, multipart, catálogos, errores, restauración y logout. El ejecutor utiliza esbuild instalado con las herramientas de compilación de Angular y limpia su bundle temporal.

Inicialmente la petición GET a `https://fundacionplus.site/api/v1/catalogs/departments/` devolvió **HTTP 400 con HTML**, no el JSON de catálogo esperado. La configuración desplegada solo permitía localhost y 127.0.0.1. El usuario añadió los dominios a `DJANGO_ALLOWED_HOSTS` y recreó el backend; las pruebas posteriores confirman HTTP 200 con JSON.

Con las dos cuentas de prueba autorizadas posteriormente se intentó `POST /api/v1/auth/login/`: tanto ciudadano como administrador recibieron **400 con HTML**. Se repitió el catálogo público en ambos dominios (`fundacionplus.site` y `www.fundacionplus.site`) con el mismo resultado. No se recibieron tokens y no se pudo validar perfil, capacidades ni revocación. No se cambiaron perfiles ni se crearon registros de contenido. Las credenciales no se incluyeron en scripts, informes ni archivos nuevos.

El `settings.py` local del backend lee `DJANGO_ALLOWED_HOSTS` separando por comas. El usuario confirmó que el entorno desplegado ahora incluye ambos dominios. Para consultar únicamente esta configuración, sin imprimir secretos:

```sh
docker compose exec backend python manage.py shell -c "from django.conf import settings; print(settings.ALLOWED_HOSTS)"
```

La lista debe incluir los dominios que realmente reciba Django en la cabecera Host. Revisar también el proxy del host y el log de la solicitud; no activar DEBUG público ni usar `ALLOWED_HOSTS=*` para ocultar el problema.

Para diagnosticar en el servidor, desde `/home/devadhan/practicas`:

```sh
curl -i https://fundacionplus.site/api/v1/catalogs/departments/
docker compose logs --tail=100 backend
```

Revisar el log correspondiente a la solicitud. Si muestra `DisallowedHost`, corregir `DJANGO_ALLOWED_HOSTS` para incluir los dominios usados, según el formato que lea el backend. Si apunta a otro problema, resolver la causa indicada. También verificar que se desplegó la entrega 1.2.0; no imprimir secretos del entorno para diagnosticar.

## Pruebas reales tras corregir ALLOWED_HOSTS

Se usaron únicamente las cuentas de prueba autorizadas. No se modificaron datos personales, contraseñas, preferencias, fotografías ni contenido institucional. Los intentos de acceso y logout pueden generar los registros de auditoría propios del backend. Todas las sesiones creadas en las pruebas se cerraron.

| Operación | Administrador | Ciudadano |
|---|---|---|
| POST auth/login | 200, access y refresh presentes | 200, access y refresh presentes |
| GET me | 200; campos requeridos por la interfaz presentes | 200; campos requeridos por la interfaz presentes |
| GET me/preferences | 200; campos reales disponibles | 200; campos reales disponibles |
| GET admin/dashboard | 200 | 403 |
| POST auth/refresh | 200; access y refresh devueltos | 200; access y refresh devueltos |
| POST auth/logout | 200 | 200 |
| GET me con access tras logout | 401 | 401 |
| POST auth/refresh tras logout | 401 | 401 |

**Diferencia de contrato comprobada:** `permissions` no devuelve las capacidades booleanas del ejemplo del manual. Administrador recibe `all: ['*']` y listas por módulo; ciudadano recibe acciones como `casos: ['crear', 'ver_propios', ...]`. Se corrigieron el tipo y el guard Angular con una función de permisos y pruebas que reproducen ambas respuestas, sin inferir privilegios del nombre del rol. El backend debe actualizar ese ejemplo de la documentación.

Los catálogos de departamentos, municipios y comunidades responden **200 con `[]`**. La conexión funciona, pero los selectores de residencia no tendrán opciones hasta cargar esos registros. No se inventaron territorios ni se crearon registros en producción durante estas comprobaciones.

## Pendiente de extremo a extremo

1. Cargar los catálogos territoriales necesarios para que los selectores tengan opciones.
2. Probar los formularios y la recarga de sesión en navegador después de desplegar el frontend actualizado. Las verificaciones de API anteriores no sustituyen la prueba visual del flujo Angular.
3. Probar perfil, residencia y fotografía con persistencia tras recargar/recrear el contenedor.
4. Comprobar el envío real del correo de recuperación tras desplegar la implementación SMTP. La actualización del backend ya genera y envía el enlace; falta confirmar la entrega y el flujo en el entorno desplegado con un destinatario de prueba autorizado.
5. Comprobar visualmente ambos temas y móvil en navegador. La compilación no sustituye esa revisión.

## Actualización de recuperación por Resend SMTP

Se revisaron los archivos locales actualizados del backend: `config/settings.py`, `apps/accounts/emails.py`, `apps/accounts/views.py` y el compose. Ahora leen la configuración SMTP, generan uid/token, construyen el enlace `/restablecer-contrasena?uid=...&token=...` y envían texto plano más HTML. La ruta y los campos coinciden con el componente Angular existente; esta actualización no requiere modificar el formulario.

La confirmación comprueba el token, aplica validadores de contraseña y elimina el token de sesión del usuario. También se documentan caducidad, respuesta genérica, limitación de solicitudes y registro de fallos SMTP. El informe del backend indica diez pruebas aprobadas; no se volvieron a ejecutar desde el frontend.

No se solicitó ningún envío real ni se cambiaron contraseñas durante esta revisión. Para verificar la entrega, desplegar el backend actualizado con las variables del servidor y utilizar una cuenta de prueba con buzón accesible. Un 200 en la solicitud no prueba que se haya enviado el correo: la respuesta es genérica también cuando SMTP falla. Comprobar la recepción, la actividad de Resend y los logs del backend sin compartir tokens ni la clave.

## Módulos que conservan demostración

Casos, radicación, mensajes, notificaciones y administración siguen usando servicios locales y se identifican como demostración. La sesión real no transforma sus datos de ejemplo en expedientes reales. Los contadores ficticios de mensajes/notificaciones se retiraron de la navegación del perfil conectado.

Noticias e iniciativas públicas conservan su contenido actual. Antes de sustituir sus consultas se debe inventariar el contenido, validar textos/cifras/fotos y preparar una carga inicial repetible con el backend. No se han creado noticias/iniciativas ni datos de demostración en producción.
