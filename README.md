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

Los casos ciudadanos ya consultan y envían datos por REST: listado, métricas, radicación, expediente, evidencias y aportes. Ver [alcance y pruebas](docs/integracion-casos-ciudadanos.md). La última consulta del servidor confirmó 32 departamentos, 88 municipios y 83 comunidades; queda la prueba funcional controlada de radicación y selección territorial.

El [directorio de comunidades](docs/integracion-territorios.md) consulta REST y permite crear, editar y activar/desactivar con confirmación. Departamentos y municipios son catálogos de consulta, ya disponibles en el servidor. Se conserva la geometría existente al editar.

La [administración de usuarios y roles](docs/integracion-usuarios.md) también usa REST: directorio, ficha, alta, edición de contacto y acciones separadas de rol/estado. Escrituras limitadas a administrador y sobre otras cuentas; ver P15/P16 del registro de problemas para controles del backend pendientes.

Mientras se corrigen esos pendientes, se avanzó con [navegación móvil, teclado y temas](docs/revision-interfaz-accesibilidad.md), comprobados en Chrome local con API simulada. La revisión no modifica datos de producción.

Los formularios de acceso y los editores de usuarios/comunidades muestran resúmenes de errores enlazados a los campos, con validación cruzada de contraseñas accesible. La revisión local no crea cuentas, solicita correos ni restablece contraseñas reales.

El [estado consolidado de integración](docs/estado-integracion-frontend-backend.md) separa lo conectado, lo demostrativo y lo que todavía necesita el backend. La [matriz de navegación administrativa](docs/permisos-navegacion-administrativa.md) se aplica al menú y a las rutas directas: usuarios/roles, comunidades y auditoría son exclusivos de administrador; moderación y contenidos editoriales admiten administrador/moderador. Representantes mantienen casos, informes, mapa y perfil administrativo.

El nuevo [módulo de formularios de demostración](docs/formularios-demostracion.md) incluye listado/editor administrativo, vista previa, formulario público y respuestas administrativas/ciudadanas. Usa datos temporales: no crea cuentas ni envía correos. Ejemplo público: `/formularios/solicitud-comunitaria-demo`.

Mensajes y notificaciones ciudadanos ya usan REST, incluidos lectura y contadores por cuenta. Ver [alcance y pruebas de comunicación](docs/integracion-mensajes-notificaciones.md). El [dashboard y los casos administrativos](docs/integracion-casos-administrativos.md) también están conectados, incluidas las acciones revisadas antes de guardar. Los [informes y la auditoría reciente](docs/integracion-informes-auditoria.md) consultan el backend, con CSV de toda la selección y alcance limitado de eventos explícito. La [moderación de comentarios](docs/integracion-moderacion-comentarios.md) incluye cola, ficha y decisiones confirmadas, con motivos internos por defecto. Los demás módulos administrativos conservan su demostración.

El contenido público de noticias e iniciativas se conserva hasta aprobar y ejecutar su carga inicial e integrar sus consultas. Ya está preparado el [inventario y la guía para el backend](docs/contenido-inicial/preparacion.md), con extracción reproducible de textos e imágenes y sin publicaciones automáticas. Las cifras e imágenes del diseño deben validarse antes de publicarlas como contenido institucional. Los problemas comprobados y el trabajo pendiente del backend se registran en [problemas-integracion.md](docs/problemas-integracion.md).

Ver [estado de integración y despliegue](docs/integracion-acceso-perfil.md), [contratos del backend](endpoints_info.md) y [configuración Docker](docker/README.md).
