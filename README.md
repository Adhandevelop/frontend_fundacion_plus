# PLUS · Frontend

Angular 18, TypeScript y Tailwind CSS 3. Requiere Node 20.11 o superior compatible con Angular 18.

```sh
npm ci
npm start
npm run test:api
npm run build
```

La aplicación local abre en http://127.0.0.1:4200. `proxy.conf.json` reenvía `/api` al backend local en `http://127.0.0.1:8000`. En Docker se usa el proxy existente de Nginx hacia `backend:8000`. La base de API es `/api/v1`; no se incluyen credenciales en el código.

Acceso, registro, recuperación/restablecimiento y perfil usan servicios REST. Las rutas de ciudadano y administración requieren sesión, y administración verifica las capacidades devueltas por el servidor. El perfil incluye fotografía, preferencias y ubicación mediante catálogos reales.

Los casos ciudadanos ya consultan y envían datos por REST: listado, métricas, radicación, expediente, evidencias y aportes. Ver [alcance y pruebas](docs/integracion-casos-ciudadanos.md). Después del despliegue `db69f04`, producción quedó configurada exclusivamente para Meta y la consulta confirmó 1 departamento, 29 municipios y 70 comunidades; queda la prueba funcional controlada de radicación y selección territorial.

El ciudadano dispone de un inicio autenticado en `/ciudadano`, con resumen, accesos rápidos y casos recientes. Login, registro, logo e “Inicio” permanecen dentro de ese portal y conservan su navegación lateral; el perfil es una sección independiente.

El [directorio de comunidades](docs/integracion-territorios.md) consulta REST y permite crear, editar y activar/desactivar con confirmación. Departamentos y municipios son catálogos de consulta, ya disponibles en el servidor. Se conserva la geometría existente al editar.

La [administración de usuarios y roles](docs/integracion-usuarios.md) también usa REST: directorio, ficha, alta, edición de contacto y acciones separadas de rol/estado. Escrituras limitadas a administrador y sobre otras cuentas; ver P15/P16 del registro de problemas para controles del backend pendientes.

Mientras se corrigen esos pendientes, se avanzó con [navegación móvil, teclado y temas](docs/revision-interfaz-accesibilidad.md), comprobados en Chrome local con API simulada. La revisión no modifica datos de producción.

Los formularios de acceso y los editores de usuarios/comunidades muestran resúmenes de errores enlazados a los campos, con validación cruzada de contraseñas accesible. La revisión local no crea cuentas, solicita correos ni restablece contraseñas reales.

El [estado consolidado de integración](docs/estado-integracion-frontend-backend.md) separa lo conectado, lo demostrativo y lo que todavía necesita el backend. La [matriz de navegación administrativa](docs/permisos-navegacion-administrativa.md) se aplica al menú y a las rutas directas: usuarios/roles, comunidades y auditoría son exclusivos de administrador; moderación y contenidos editoriales admiten administrador/moderador. Representantes mantienen casos, informes, mapa y perfil administrativo.

El [módulo de formularios dinámicos](docs/formularios-demostracion.md) ya consume `apps.dynamic_forms`: constructor administrativo, ciclo de publicación, vista previa, envío público idempotente, activación por enlace, respuestas administrativas y seguimiento ciudadano. La prueba real de correo y del recorrido completo sigue pendiente en el entorno desplegado.

La portada consulta `/public/home/` para mostrar la fotografía institucional y métricas verificadas. Las cuentas con `can_manage_homepage` tienen un editor protegido en `/admin/portada`, con reemplazo `multipart/form-data`, texto alternativo y validación local de formato/tamaño.

Noticias públicas y administración editorial ya consumen REST. Si la colección pública está vacía se conservan temporalmente los mockups identificados como contenido de diseño. El boletín envía la suscripción real y requiere confirmación por correo. La carga binaria de medios permanece deshabilitada hasta que el backend disponga de un endpoint de archivo validado.

Iniciativas públicas consumen catálogo, categorías y detalle/galería REST. La postulación comunitaria también se registra en el backend con consentimiento; los mockups solo permanecen como respaldo identificado. En administración ya son reales el listado, ficha, creación, edición, publicación y destacado del programa, con ediciones anidadas en lectura. Los subrecursos continúan demostrativos y no se muestran actividades públicas hasta disponer de una proyección mínima (P19/P20).

Mensajes y notificaciones ciudadanos ya usan REST, incluidos lectura y contadores por cuenta. Ver [alcance y pruebas de comunicación](docs/integracion-mensajes-notificaciones.md). El [dashboard y los casos administrativos](docs/integracion-casos-administrativos.md) también están conectados, incluidas las acciones revisadas antes de guardar. Los [informes y la auditoría reciente](docs/integracion-informes-auditoria.md) consultan el backend, con CSV de toda la selección y alcance limitado de eventos explícito. La [moderación de comentarios](docs/integracion-moderacion-comentarios.md) incluye cola, ficha y decisiones confirmadas, con motivos internos por defecto. Los demás módulos administrativos conservan su demostración.

El contenido público de noticias e iniciativas se conserva como respaldo identificado hasta aprobar y ejecutar su carga inicial; sus consultas REST ya están integradas. Está preparado el [inventario y la guía para el backend](docs/contenido-inicial/preparacion.md), con extracción reproducible de textos e imágenes y sin publicaciones automáticas. Las cifras e imágenes del diseño deben validarse antes de publicarlas como contenido institucional. Los problemas comprobados y el trabajo pendiente del backend se registran en [problemas-integracion.md](docs/problemas-integracion.md).

El [catálogo completo de recursos y campos](docs/catalogo-recursos-contenido.md) indica qué textos, imágenes, documentos, relaciones y metadatos debe recopilar el equipo editorial para portada, Nosotros, noticias, iniciativas, ediciones, actividades, postulaciones y documentos legales.

Ver [estado de integración y despliegue](docs/integracion-acceso-perfil.md), [contratos del backend](endpoints_info.md) y [configuración Docker](docker/README.md).
