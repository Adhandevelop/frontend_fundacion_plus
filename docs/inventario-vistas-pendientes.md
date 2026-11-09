# Inventario de vistas PLUS y continuación del frontend

Revisión del 9 de noviembre de 2026. Basada en `app.routes.ts`, componentes, navegación, controles pendientes y esquema v1.1. «Vista disponible» significa interfaz Angular con datos de demostración: no equivale a integración, permisos efectivos ni validación visual completados.

## 1. Vistas disponibles

| Área | Disponible como demostración | Límites actuales |
|---|---|---|
| Portal | Inicio, mapa, Nosotros, listado de noticias, listado de iniciativas, caso público. | Mapa/datos de referencia; el caso completo disponible es el ejemplo conocido. Noticias muestran resumen y las iniciativas una imagen de galería; faltan sus páginas de detalle completas. |
| Acceso | Login, registro, recuperación, restablecimiento y escenarios de enlace inválido/vencido, sesión vencida, acceso denegado y 404. | Sin cuentas, tokens, correo ni guard de autorización real. |
| Ciudadano | Mis casos, radicación de cinco pasos, confirmación local, expediente, seguimiento, evidencias, aportes, mensajes, notificaciones y perfil. | Estado temporal, sin envío/subida real. Perfil/contratos necesitan las ampliaciones solicitadas al backend. |
| Administración de casos | Dashboard, listado y expediente con moderación, asignación, avances, evidencias, mensajes y cierre simulados. | Estados y responsables locales; faltan flujos específicos de radicado institucional y alerta temprana. |
| Informes y auditoría | Informe filtrable y CSV; registro local de acciones de casos con filtros/detalle. | No son informes o auditoría institucionales. |
| Usuarios | Listado, detalle, creación/edición, estado y referencia de roles. | Demo anterior al DDL: pendiente adaptar nombres/apellidos, un rol y tres estados tras acordar el contrato. |
| Territorio | Directorio de comunidades, detalle, creación/edición y estado, con selección departamento/municipio. | Añadido en esta revisión. Sin geometrías, DANE oficiales, edición de municipios/departamentos ni ámbitos de responsables. |
| Noticias administrativas | Listado, creación/edición de borradores, vista previa, portada local, revisión, rechazo, publicación y destacado simulados. | Añadido tras el catálogo territorial. Independiente del portal, sin programación, galería múltiple ni publicación real. Ver `noticias-administrativas.md`. |
| Iniciativas administrativas | Listado, ficha y editor de programas; revisión/publicación y destacado; ediciones anuales con indicadores y comunidades. | Añadido después de noticias. Jornadas y medios ya tienen vistas propias; faltan vínculos de casos y metadatos adicionales; sin cambios en el portal público. Ver `iniciativas-administrativas.md`. |
| Jornadas y medios | Agenda por edición, creación/edición, ficha de actividad; galería general y anual, metadatos, portada por ámbito, video y PDF locales. | Añadido después de programas/ediciones. Sin vínculo de archivo a actividad concreta ni publicación; pendiente revisión audiovisual y visual. Ver `jornadas-medios-demostracion.md`. |
| Postulaciones | Bandeja, filtros, ficha, contacto ficticio y revisión con respuesta y programa de resultado opcional. | Añadido después de jornadas. Sin envío de respuestas ni creación de programas; formulario público separado. Ver `postulaciones-demostracion.md`. |
| Moderación de comentarios | Cola con filtros/paginación, detalle, aprobación/rechazo/ocultamiento, retorno a revisión e historial de decisiones; proyección pública restringida de ejemplo. | Añadido después de postulaciones. Sin publicación, avisos ni auditoría reales; separado de mensajes/aportes privados. Ver `moderacion-comentarios-demostracion.md`. |

## 2. Vistas que faltan, en orden recomendado

| Prioridad | Vista o recorrido pendiente | Puede adelantarse con datos estáticos | Dependencia para terminarlo |
|---|---|---|---|
| 2 | Ámbitos de responsables: listado/formulario por comunidad y tipo de caso. | Sí. | Semántica de combinación de ámbitos y elegibilidad; no son la asignación efectiva del caso. |
| 3 | Noticia pública completa con URL propia y estado no disponible. | Estructura sí; solo mostrar contenido de ejemplo existente o claramente ficticio, sin inventar comunicados oficiales. | Contrato/noticia completa autorizada. |
| 3 | Iniciativa pública completa: programa, selector de edición, indicadores, cobertura, actividades y galería. | Sí. | Datos separados por edición y reglas de exposición pública. |
| 3 | Casos seguidos: listado personal y estado de suscripción por caso. | Sí, sin activar avisos reales. | AMP-03 y política de novedades públicas. |
| 3 | Resultados de alta/confirmación/baja del boletín y verificación de correo, si se adopta ese circuito. | Estados visuales sí. | Tokens, expiración y estados definidos por backend. |
| 4 | Radicado institucional desde dashboard. | Estructura reutilizable de radicación, una vez fijados remitente/representación. | Reglas de actuación institucional, propietario y aceptación; el botón sigue deshabilitado. |
| 4 | Emisión y consulta de alertas tempranas. | Estructura visual tras definir destinatarios/canales/flujo. | Alcance funcional y AMP-16; no confundir con notificación de caso. |
| 4 | Configuración institucional y documentos legales. | Formulario/previsualización sí, sin dar por válidos textos legales ficticios. | Claves editables y textos/versiones aprobados. |
| 4 | Términos y tratamiento de datos con URL propia. | Layout y estado de contenido pendiente sí. | Contenido institucional aprobado, versiones y aceptaciones; no redactar políticas definitivas como si estuvieran autorizadas. |

La prioridad organiza implementación de interfaces, no autoriza envíos, publicación externa ni contratos de API inventados. Cuando una vista no tiene mockup específico, se reutiliza el sistema visual actual y se documenta esa adaptación.

## 3. Comportamientos incompletos que no son vistas nuevas

- Mapa interactivo real, capas/marcadores, geolocalización opcional y consulta de filtros: la vista existe; falta implementación/integración cartográfica completa.
- Persistencia de casos, mensajes, perfil y borradores; archivos privados/públicos; sesiones, permisos, contadores y notificaciones reales.
- Formulario de postulación: título y aceptación de demostración ya añadidos; falta política/versionado y consentimiento real persistido para integrar envíos.
- Formularios de usuario y registro: nombres/apellidos, límites, rol único y estados reales. Multirrol sigue pendiente de decisión AMP-14.
- Adaptación de catálogos/estados y programa/edición; no reemplazar contratos por textos de fixtures.
- Galerías múltiples, descargas PDF, redes/contactos y documentos: recursos reales pendientes de confirmación, no una pantalla adicional por enlace.
- Visibilidad de evidencias, notas internas, correcciones, agrupación de aportes y resultados: interfaces parciales que requieren persistencia definida en la petición al backend.

## 4. Verificación pendiente común

Revisión visual en navegador de escritorio/móvil y claro/oscuro, navegación por teclado, foco, errores de formulario y estados vacíos. La compilación y las comprobaciones de lógica realizadas no sustituyen esta revisión. Después de conectar API: cargas, errores HTTP, conflictos, permisos por objeto, archivos y recuperación tras recarga.

El siguiente bloque recomendado es **ámbitos de responsables**, seguido de detalles públicos completos de noticias e iniciativas. Quedan ampliaciones de indicadores (descripción/icono/orden), observaciones de cobertura, vínculos con casos y asociación opcional de medios a jornadas. Las tablas faltantes se han solicitado en `endpoints-integracion-backend.md`; su ausencia no impide avanzar con vistas de demostración.
