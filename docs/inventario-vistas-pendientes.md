# Inventario de vistas PLUS y continuación del frontend

> **Administración conectada:** dashboard, listado y expediente de casos usan REST, con publicación, correcciones, asignaciones, seguimiento, cierre y revisión/descarga de evidencias. Ver [integracion-casos-administrativos.md](integracion-casos-administrativos.md). Los problemas y trabajos que no bloquean otros avances se registran en [problemas-integracion.md](problemas-integracion.md).

> **Permisos actualizados:** menú y guards de rutas aplican la [matriz por rol](permisos-navegacion-administrativa.md), incluyendo URLs directas y editores. Usuarios, comunidades y auditoría son exclusivos de administrador. Esto no cierra los pendientes de autorización y despliegue del backend.

> **Contenido inicial inventariado:** [textos, imágenes y guía para la carga editorial](contenido-inicial/preparacion.md) extraídos del frontend. No equivale a aprobación ni importación. Noticias e iniciativas públicas ya consultan REST y solo muestran estos datos como respaldo marcado cuando la colección real está vacía o no disponible.

> **Iniciativas conectadas parcialmente:** catálogo, categorías, panel de detalle/galería y postulación comunitaria consumen REST. En administración, listado, ficha, creación, edición y publicación del programa ya son reales; las ediciones se leen desde el detalle. El backend ya redujo el DTO público; los editores de subrecursos continúan en adaptación.

> **Noticias conectadas:** listado, categorías, detalle y medios públicos consumen `/public/news`; el boletín envía suscripciones reales. La administración ya usa CRUD y estados del backend. Confirmación/baja por token, carga binaria segura de medios y contenido inicial aprobado permanecen pendientes.

> **Portada institucional conectada:** el inicio consulta fotografía, institución y métricas verificadas desde `/public/home/`. Solo una cuenta con `can_manage_homepage` puede abrir `/admin/portada` y reemplazar la imagen. La escritura real con un archivo controlado sigue pendiente de prueba en el servidor.

> **Formularios dinámicos conectados:** listado/editor, ciclo de vida, vista previa, envío público idempotente, activación, respuestas administrativas y seguimiento ciudadano consumen `apps.dynamic_forms`. Falta la prueba real completa y el detalle de versiones históricas. Ver [formularios-demostracion.md](formularios-demostracion.md).

> **Informes y auditoría reciente conectados:** agregados de toda la selección, tabla paginada y CSV del backend; consulta de eventos recientes con filtros locales y detalle restringido. La auditoría no representa un historial exhaustivo. Ver [integracion-informes-auditoria.md](integracion-informes-auditoria.md).

> **Comunidades conectadas:** directorio/ficha, creación, edición y activación/desactivación consultan REST. No incluyen CRUD departamental/municipal ni edición cartográfica. Los catálogos del servidor ya devuelven datos; falta la prueba funcional controlada. Ver [integracion-territorios.md](integracion-territorios.md) y el estado actualizado P02 en [problemas-integracion.md](problemas-integracion.md).

> **Usuarios y roles conectados:** directorio paginado, ficha, catálogo de roles, creación y edición de contacto; acciones separadas de rol único y estado con revisión. El frontend limita las escrituras a administrador sobre otras cuentas; ámbitos y correcciones del servidor P15/P16 pendientes. Ver [integracion-usuarios.md](integracion-usuarios.md).

> **Moderación de comentarios conectada:** cola paginada y filtros reales, ficha, aprobación/rechazo/ocultamiento/retorno a pendiente con confirmación y motivo interno por defecto. El formulario público sigue pendiente; no hay historial específico de decisiones en el contrato actual. Ver [integracion-moderacion-comentarios.md](integracion-moderacion-comentarios.md).

> **Comunicación ciudadana conectada:** mensajes y notificaciones ya consultan REST, con estados de lectura, paginación de avisos y contadores por cuenta. Ver [integracion-mensajes-notificaciones.md](integracion-mensajes-notificaciones.md).

> **Casos ciudadanos conectados:** listado/métricas, radicación, confirmación, expediente, historial, evidencias y aportes usan servicios REST. La carga territorial está disponible; la radicación real sigue pendiente de prueba controlada. Consultar [integracion-casos-ciudadanos.md](integracion-casos-ciudadanos.md) y el estado P02 actualizado. Las filas de demostración siguientes conservan el inventario anterior.

> **Inicio de integración REST:** acceso y perfil ya llaman al backend, con JWT, guards, fotografía, preferencias y catálogos de residencia. Los escenarios de recuperación ahora validan tokens reales. Las filas originales siguientes conservan el inventario de demostración previo; para el alcance integrado y la verificación pendiente en producción consultar [integracion-acceso-perfil.md](integracion-acceso-perfil.md).

Revisión consolidada el 11 de noviembre de 2026. Basada en `app.routes.ts`, componentes, navegación, controles pendientes y contratos implementados. Las tablas históricas siguientes conservan parte del inventario inicial; el estado vigente de integración está en [estado-integracion-frontend-backend.md](estado-integracion-frontend-backend.md).

## 1. Vistas disponibles

| Área | Disponible como demostración | Límites actuales |
|---|---|---|
| Portal | Inicio, mapa, Nosotros, noticias, iniciativas y caso público. | Noticias e iniciativas consultan catálogo y detalle REST; no tienen todavía URL individual propia. El mapa espera datos territoriales y el caso público conserva límites de contrato. |
| Acceso | Login, registro, recuperación, restablecimiento y escenarios de enlace inválido/vencido, sesión vencida, acceso denegado y 404. | Sin cuentas, tokens, correo ni guard de autorización real. |
| Ciudadano | Mis casos, radicación de cinco pasos, confirmación local, expediente, seguimiento, evidencias, aportes, mensajes, notificaciones y perfil. | Estado temporal, sin envío/subida real. Perfil/contratos necesitan las ampliaciones solicitadas al backend. |
| Administración de casos | Dashboard, listado y expediente con moderación, asignación, avances, evidencias, mensajes y cierre simulados. | Estados y responsables locales; faltan flujos específicos de radicado institucional y alerta temprana. |
| Informes y auditoría | Informe filtrable y CSV; registro local de acciones de casos con filtros/detalle. | No son informes o auditoría institucionales. |
| Usuarios | Listado, detalle, creación/edición, estado y referencia de roles. | Demo anterior al DDL: pendiente adaptar nombres/apellidos, un rol y tres estados tras acordar el contrato. |
| Territorio | Directorio de comunidades, detalle, creación/edición y estado, con selección departamento/municipio. | Añadido en esta revisión. Sin geometrías, DANE oficiales, edición de municipios/departamentos ni ámbitos de responsables. |
| Noticias administrativas | Listado, creación/edición de borradores, vista previa, portada local, revisión, rechazo, publicación y destacado simulados. | Añadido tras el catálogo territorial. Independiente del portal, sin programación, galería múltiple ni publicación real. Ver `noticias-administrativas.md`. |
| Iniciativas administrativas | Listado, ficha y editor de programas; revisión/publicación y destacado conectados. Ediciones reales visibles en lectura. | Editores de ediciones, indicadores, comunidades, jornadas, medios y vínculos continúan demostrativos. Ver `iniciativas-administrativas.md`. |
| Jornadas y medios | Agenda por edición, creación/edición, ficha de actividad; galería general y anual, metadatos, portada por ámbito, video y PDF locales. | Añadido después de programas/ediciones. Sin vínculo de archivo a actividad concreta ni publicación; pendiente revisión audiovisual y visual. Ver `jornadas-medios-demostracion.md`. |
| Postulaciones | Bandeja, filtros, ficha y revisión con respuesta e iniciativa de resultado. | Integrado con `/api/v1/admin/proposals/`; falta prueba autenticada con solicitudes controladas. |
| Moderación de comentarios | Cola con filtros/paginación, detalle, aprobación/rechazo/ocultamiento, retorno a revisión e historial de decisiones; proyección pública restringida de ejemplo. | Añadido después de postulaciones. Sin publicación, avisos ni auditoría reales; separado de mensajes/aportes privados. Ver `moderacion-comentarios-demostracion.md`. |

## 2. Vistas que faltan, en orden recomendado

| Prioridad | Vista o recorrido pendiente | Puede adelantarse con datos estáticos | Dependencia para terminarlo |
|---|---|---|---|
| 2 | Ámbitos de responsables: listado/formulario por comunidad y tipo de caso. | Sí. | Semántica de combinación de ámbitos y elegibilidad; no son la asignación efectiva del caso. |
| 3 | Noticia pública completa con URL propia y estado no disponible. | Estructura sí; solo mostrar contenido de ejemplo existente o claramente ficticio, sin inventar comunicados oficiales. | Contrato/noticia completa autorizada. |
| 3 | Ampliar iniciativa pública: URL propia, selector de edición, indicadores, cobertura y actividades públicas. | La base y galería ya están conectadas. | Verificar la proyección depurada desplegada con contenido real y acordar reglas de exposición territorial. |
| 3 | Casos seguidos: listado personal y estado de suscripción por caso. | Sí, sin activar avisos reales. | AMP-03 y política de novedades públicas. |
| 3 | Resultados de alta/confirmación/baja del boletín y verificación de correo. | Estados visuales sí. | Definir nombre/transporte del token, expiración y DTO de resultado. |
| 4 | Radicado institucional desde dashboard. | Estructura reutilizable de radicación, una vez fijados remitente/representación. | Reglas de actuación institucional, propietario y aceptación; el botón sigue deshabilitado. |
| 4 | Emisión y consulta de alertas tempranas. | Estructura visual tras definir destinatarios/canales/flujo. | Alcance funcional y AMP-16; no confundir con notificación de caso. |
| 4 | Configuración institucional y documentos legales. | Formulario/previsualización sí, sin dar por válidos textos legales ficticios. | Claves editables y textos/versiones aprobados. |
| 4 | Términos y tratamiento de datos con URL propia. | Layout y estado de contenido pendiente sí. | Contenido institucional aprobado, versiones y aceptaciones; no redactar políticas definitivas como si estuvieran autorizadas. |

La prioridad organiza implementación de interfaces, no autoriza envíos, publicación externa ni contratos de API inventados. Cuando una vista no tiene mockup específico, se reutiliza el sistema visual actual y se documenta esa adaptación.

## 3. Comportamientos incompletos que no son vistas nuevas

- Mapa interactivo real, capas/marcadores, geolocalización opcional y consulta de filtros: la vista existe; falta implementación/integración cartográfica completa.
- Persistencia de casos, mensajes, perfil y borradores; archivos privados/públicos; sesiones, permisos, contadores y notificaciones reales.
- Formulario de postulación: envío REST y consentimiento ya conectados; falta prueba real controlada y confirmar el versionado/retención legal en backend.
- Formularios de usuario y registro: nombres/apellidos, límites, rol único y estados reales. Multirrol sigue pendiente de decisión AMP-14.
- Adaptación de catálogos/estados y programa/edición; no reemplazar contratos por textos de fixtures.
- Galerías múltiples, descargas PDF, redes/contactos y documentos: recursos reales pendientes de confirmación, no una pantalla adicional por enlace.
- Visibilidad de evidencias, notas internas, correcciones, agrupación de aportes y resultados: interfaces parciales que requieren persistencia definida en la petición al backend.

## 4. Verificación pendiente común

Se realizó una primera [revisión de navegación y temas en Chrome local](revision-interfaz-accesibilidad.md) con datos sintéticos: menú móvil, teclado/foco, restauración en escritorio y anchos de vistas administrativas/perfil. No sustituye la revisión completa de todas las pantallas ni las pruebas de datos reales descritas a continuación.

Revisión visual en navegador de escritorio/móvil y claro/oscuro, navegación por teclado, foco, errores de formulario y estados vacíos. La compilación y las comprobaciones de lógica realizadas no sustituyen esta revisión. Después de conectar API: cargas, errores HTTP, conflictos, permisos por objeto, archivos y recuperación tras recarga.

El siguiente bloque recomendado es **ámbitos de responsables**, seguido de detalles públicos completos de noticias e iniciativas. Quedan ampliaciones de indicadores (descripción/icono/orden), observaciones de cobertura, vínculos con casos y asociación opcional de medios a jornadas. Las tablas faltantes se han solicitado en `endpoints-integracion-backend.md`; su ausencia no impide avanzar con vistas de demostración.
