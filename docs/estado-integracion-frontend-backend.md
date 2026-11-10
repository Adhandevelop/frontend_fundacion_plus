# Estado de integración del frontend PLUS

Actualizado: 9 de noviembre de 2026.

Este documento resume qué partes del frontend Angular ya consumen la API REST, cuáles continúan como demostraciones locales y qué necesita entregar o corregir el backend. “Integrado” significa que existe una implementación HTTP en Angular y pruebas automatizadas del contrato; no significa necesariamente que la versión local ya se encuentre desplegada en producción.

## 1. Ya integrado con el backend

### Autenticación y sesiones

- Inicio de sesión mediante REST.
- Registro de ciudadanos.
- Almacenamiento separado de sesión recordada y sesión temporal.
- Renovación y rotación de JWT ante respuestas `401`.
- Restauración de la cuenta mediante `/api/v1/me/`.
- Cierre de sesión y limpieza local de credenciales.
- Solicitud, validación y restablecimiento de contraseña.
- Tratamiento diferenciado de errores de autenticación, permisos y sesión vencida.

### Separación de roles y navegación

- Un ciudadano no puede ingresar a rutas administrativas.
- Administradores, moderadores y representantes no reciben acceso al portal ciudadano.
- Las rutas hijas vuelven a comprobar los permisos; no se protege únicamente el menú.
- La navegación administrativa se filtra mediante una matriz de módulos y roles.
- Usuarios, roles, comunidades, auditoría y formularios están reservados al administrador según la política actual del frontend.
- Noticias, iniciativas, postulaciones y comentarios admiten administrador y moderador.
- Dashboard, casos, informes, perfil y mapa interno admiten los roles internos autorizados.
- Perfil y mapa conservan el layout correspondiente en lugar de sacar al usuario de su portal.

### Perfil y catálogos territoriales

- Consulta y actualización del perfil.
- Actualización de preferencias de notificación.
- Carga y eliminación de fotografía mediante `multipart/form-data`.
- Consulta de departamentos, municipios y comunidades.
- Selección territorial dependiente y validación de relaciones.
- El servidor consultado devolvió 32 departamentos, 88 municipios y 83 comunidades; aún debe validarse funcionalmente la cobertura y procedencia completa de esos datos.

### Portal ciudadano

- Dashboard ciudadano.
- Listado paginado de casos propios.
- Radicación de casos.
- Detalle e historial de un caso propio.
- Carga individual de evidencias.
- Aportes y respuestas a solicitudes de corrección.
- Conversaciones privadas y envío de mensajes.
- Marcado explícito de mensajes como leídos.
- Listado paginado de notificaciones.
- Marcado individual y múltiple de notificaciones como leídas.
- Contadores de mensajes y notificaciones aislados por cuenta.

### Administración de casos

- Dashboard administrativo.
- Listado, filtros, paginación y detalle de casos.
- Revisión previa de acciones antes de enviarlas.
- Acciones permitidas según `allowed_actions` entregado por el backend.
- Búsqueda paginada de responsables elegibles.
- Asignación, cambios de estado, solicitudes de corrección y decisiones de publicación según el contrato existente.
- Revisión administrativa de evidencias.
- Protección frente a respuestas tardías al cambiar rápidamente de expediente.

### Usuarios, roles y estados

- Directorio paginado y filtrado de usuarios.
- Consulta de ficha administrativa.
- Creación de usuarios internos.
- Actualización de datos de contacto.
- Consulta de roles asignables.
- Acciones separadas para cambio de rol y cambio de estado.
- Confirmación antes de escrituras sensibles.
- Bloqueo de acciones administrativas sobre la propia cuenta desde la interfaz.

### Comunidades y territorios

- Listado paginado de comunidades.
- Filtros y consulta de detalle.
- Creación y edición.
- Activación y desactivación con confirmación.
- Conservación de geometría existente cuando la interfaz no la modifica.
- Departamentos y municipios tratados como catálogos de consulta.

### Moderación, informes y auditoría

- Cola paginada de comentarios.
- Consulta individual y decisión de moderación.
- Separación entre motivo interno y explicación compartida.
- Informes de casos con filtros y paginación.
- Exportación CSV de toda la selección cargada por el servicio de informes.
- Consulta de auditoría reciente y detalle de eventos.
- Presentación segura de metadatos, sin interpretar HTML recibido.

## 2. Construido, pero todavía con datos demostrativos

### Formularios dinámicos

La interfaz completa inicial ya existe:

- Listado administrativo de formularios.
- Creación y edición de borradores.
- Preguntas de texto corto, texto largo, selección única, selección múltiple y fecha en la demostración actual.
- Opciones, obligatoriedad, orden y validación local.
- Vista previa administrativa.
- Publicación, cierre y duplicación simuladas.
- Formulario público con identificación y consentimiento.
- Confirmación neutral de recepción.
- Listado y detalle de respuestas administrativas.
- “Mis formularios” y detalle histórico en el portal ciudadano.
- Separación de datos temporales por propietario.

Actualmente este módulo usa memoria local. No persiste formularios, no crea cuentas, no envía correos y no invoca los endpoints nuevos. El backend entregó un contrato 1.0 para `apps.dynamic_forms`, pero falta confirmar que sus migraciones, endpoints, permisos, correo y pruebas ya estén implementados y desplegados.

### Noticias e iniciativas

- Noticias públicas y administración editorial.
- Iniciativas públicas.
- Programas, ediciones, actividades y medios administrativos.
- Postulaciones y propuestas.
- Contenido inicial preparado en un inventario reproducible.

Los textos, imágenes y cifras proceden de los diseños y no deben considerarse información institucional aprobada. Antes de sustituirlos se necesita carga inicial controlada en la base de datos, aprobación editorial y conexión de los servicios REST.

### Otros espacios demostrativos

- Algunos componentes internos del expediente conservan datos ilustrativos donde el backend todavía no ofrece el contrato requerido.
- Algunas métricas de las vistas públicas continúan pendientes de una fuente real.
- No se ejecutan escrituras de demostración contra producción.

## 3. Mapa territorial

El mapa ya no es un SVG ficticio:

- Usa Leaflet 1.9.4.
- Usa cartografía real de OpenStreetMap con atribución visible.
- Abre centrado en Villavicencio, Meta.
- Incluye un control para volver a Villavicencio.
- Incluye un encuadre general aproximado para explorar el departamento del Meta.
- Está disponible en `/mapa`, `/ciudadano/mapa` y `/admin/mapa` sin abandonar el layout correspondiente.
- Conserva el mapa claro cuando la interfaz está en tema oscuro.
- No muestra marcadores, conteos ni coordenadas ficticias.

Todavía falta integrar casos reales. El backend debe entregar coordenadas o geometrías GeoJSON verificadas, visibilidad pública explícita y filtros territoriales. No se deben calcular ni inventar coordenadas a partir de la descripción textual de un caso.

## 4. Pendientes del backend que condicionan la integración

El seguimiento detallado se encuentra en `docs/problemas-integracion.md`. Los puntos de mayor impacto son:

- Desplegar y comprobar las correcciones de separación entre endpoints ciudadanos y administrativos.
- Comprobar en el servidor la revocación de sesiones después de cambiar rol o estado.
- Restringir completamente los campos sensibles en las actualizaciones generales de usuarios.
- Aplicar la protección del último administrador en todos los métodos de escritura.
- Evitar efectos secundarios en peticiones `GET`, especialmente el marcado de mensajes como leídos.
- Normalizar claves, errores, filtros y paginación donde todavía existen diferencias de contrato.
- Definir y verificar idempotencia y concurrencia en escrituras críticas.
- Completar pruebas de publicación, moderación, correo y operaciones editoriales.
- Acordar el alcance de dashboard y listados para representantes.
- Completar historial o versionado de comentarios si se requiere trazabilidad detallada.

## 5. Requisitos antes de conectar formularios dinámicos

Para sustituir el servicio demostrativo se necesita confirmar:

- Aplicación `apps.dynamic_forms` instalada y migraciones aplicadas.
- Rutas registradas bajo `/api/v1/`.
- Capacidad `can_manage_forms` incluida en `/api/v1/me/`.
- Separación entre número de versión publicada y revisión de edición para concurrencia optimista.
- Enumeraciones definitivas de estado del formulario y vinculación del envío.
- JSON completo del detalle administrativo de formulario.
- JSON completo del listado y detalle ciudadano.
- `Idempotency-Key` obligatorio o una regla definitiva equivalente.
- Respuestas neutrales que no permitan enumerar cuentas o envíos previos.
- Política legal vigente disponible y validada por el servidor.
- Tokens de activación y reivindicación de un solo uso, con hash y vencimiento.
- Reenvío con límite por correo e IP.
- Plantilla de correo y proveedor SMTP probados.
- Listado, detalle y exportación administrativa auditados.
- Datos de prueba que no contengan información personal real.

Después de esa confirmación, el orden de integración será:

1. Modelos TypeScript y adaptadores del contrato definitivo.
2. Listado y detalle administrativo.
3. Creación, edición, publicación y control de conflictos.
4. Consulta y envío público.
5. Activación o reivindicación mediante enlace.
6. Reenvío de enlace.
7. “Mis formularios” ciudadano.
8. Consulta administrativa de respuestas y exportación CSV.
9. Eliminación del servicio temporal en memoria.

## 6. Pendientes del frontend

- Conectar formularios dinámicos cuando el backend confirme su disponibilidad.
- Conectar noticias, iniciativas, actividades, medios y postulaciones.
- Cargar contenido inicial aprobado en lugar de trasladar directamente los datos de diseño.
- Conectar el mapa a casos reales y filtros territoriales.
- Incorporar el editor de imagen principal únicamente cuando exista el permiso separado para superadministración y su endpoint de medios.
- Sustituir los últimos bloques demostrativos de expedientes por contratos reales.
- Ejecutar pruebas funcionales controladas contra un entorno de pruebas del backend.
- Repetir revisión responsive, accesibilidad y temas con datos reales.
- Verificar Docker y Nginx después de cada integración que introduzca nuevos tamaños de carga o rutas.

## 7. Verificación actual

La revisión local más reciente incluye:

- `npm run build`: correcto.
- `npm run test:api`: diez suites aprobadas.
- Pruebas de autenticación, permisos, casos ciudadanos, comunicaciones, casos administrativos, informes, auditoría, comentarios, territorios, usuarios y formularios demostrativos.
- Revisión visual del mapa real en Chrome a 1440 × 1200 píxeles.
- Revisión de espacios y formato del diff sin errores.

Las pruebas utilizan HTTP simulado y datos no sensibles; no crean cuentas, casos, mensajes, formularios ni contenido en producción.

## 8. Estimación orientativa

- Vistas generales: aproximadamente 90 % construidas.
- Integración de módulos respaldados por endpoints existentes: aproximadamente 75–80 %.
- Formularios dinámicos: recorrido visual construido, conexión REST pendiente.
- Noticias e iniciativas: interfaz construida, integración REST y carga editorial pendientes.
- Mapa base: implementado; integración de casos georreferenciados pendiente.

Estas cifras son orientativas y deben actualizarse cuando el backend despliegue los contratos pendientes. El estado local tampoco implica que los cambios se encuentren desplegados en `fundacionplus.site`.
