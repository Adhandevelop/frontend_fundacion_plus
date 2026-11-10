# Formularios dinámicos: recorrido de demostración

Fecha: 9 de noviembre de 2026. Implementación exclusiva de frontend Angular/Tailwind con modelos de presentación y almacenamiento en memoria. No define un contrato REST ni implementa la creación de cuentas, activación o envío de correos.

## Vistas y rutas

| Rol / ámbito | Ruta | Recorrido disponible |
|---|---|---|
| Administrador | `/admin/formularios` | Listado, búsqueda por título, filtro de estado, copia de borradores y publicación/cierre simulados con confirmación. |
| Administrador | `/admin/formularios/nuevo` | Constructor de título, descripción, identificación y preguntas. |
| Administrador | `/admin/formularios/:id/editar` | Edición de borrador con comprobación de revisión local. |
| Administrador | `/admin/formularios/:id/vista-previa` | Formulario completo para probar validación sin generar envíos. |
| Administrador | `/admin/formularios/:id/respuestas` | Bandeja de respuestas ficticias o introducidas en la pestaña. |
| Administrador | `/admin/formularios/:id/respuestas/:responseId` | Detalle con el esquema respondido y los datos de ejemplo. |
| Público | `/formularios/:slug` | Cumplimentación y confirmación de envío de demostración; estados cerrado/no disponible. |
| Ciudadano | `/ciudadano/formularios` | “Mis formularios”, con una respuesta ficticia de referencia y los envíos locales realizados durante su sesión. |
| Ciudadano | `/ciudadano/formularios/:id` | Consulta de su respuesta de demostración, conservando la navegación ciudadana. |

Enlace de referencia que existe después de recargar: `/formularios/solicitud-comunitaria-demo`. También hay ejemplos de borrador y cerrado. Los enlaces de formularios creados localmente funcionan durante esa ejecución de la pestaña; no son enlaces publicados en un servidor y no se garantiza que funcionen al compartirlos o recargar.

El permiso `forms` del frontend está reservado a administrador como decisión del prototipo solicitado. Moderador y representante no tienen acceso al constructor, ni por menú ni por URL directa. Debe confirmarse con el contrato de autorización del backend. La separación de portales existente se conserva.

## Organización

- `features/administration/forms/`: listado, editor, vista previa y bandeja/detalle administrativos.
- `features/forms/public-form.component.ts`: vista pública y confirmación local.
- `features/citizen/forms/citizen-forms.component.ts`: listado/detalle ciudadanos.
- `shared/dynamic-forms/`: modelos `.demo`, servicio de demostración, renderer de preguntas y detalle de respuestas.

No se añadieron endpoints, servicios HTTP de formularios ni modificaciones en Django. El único acceso de sesión de la vista pública reutiliza `AuthService.ensureUser()` y el contrato existente de `/me/`, si hay tokens guardados, para reconocer una sesión ciudadana ya autenticada. No busca usuarios por el correo escrito en el formulario.

## Constructor y validación

Preguntas disponibles: respuesta corta, párrafo, selección única, selección múltiple y fecha. Cada pregunta puede ser obligatoria. Se puede añadir, quitar y cambiar su orden mediante botones accesibles. Las opciones se editan una por línea.

Los datos de identificación se mantienen separados de las preguntas: nombres, apellidos, correo y celular; solicitar cédula es configurable. No se verifica identidad ni se consulta un registro oficial de documentos. El consentimiento de demostración se pide explícitamente antes de enviar; no acredita una aceptación legal real/versionada.

Límites de presentación provisionales: título 150 caracteres, descripción 2000, hasta 20 preguntas, enunciado 200 y entre 2–10 opciones distintas de hasta 100 caracteres. Respuestas cortas de hasta 200 y párrafos de hasta 2000. Las identidades reutilizan longitudes del acceso existente. Estos límites deben alinearse con el backend cuando entregue el contrato; no se presentan como validación de API implementada.

El renderer tiene resumen de errores enlazado a controles/grupos, asociación ARIA, validación de fechas y pertenencia de selecciones. La vista previa solo verifica respuestas. El envío público muestra una confirmación de ejemplo y bloquea el doble clic. Los formularios cerrados y borradores no aceptan envíos.

## Estado, versiones y aislamiento

Los cambios no se guardan en `localStorage`, `sessionStorage` ni archivos. Las respuestas se pierden al recargar. No deben introducirse datos personales reales en este prototipo.

Un formulario publicado o cerrado no se edita directamente; se crea una copia como borrador. Cada respuesta captura el esquema, revisión y orden de preguntas para no cambiar el significado de respuestas anteriores. El servicio comprueba revisiones locales para evitar sobrescribir un estado cambiado. No es control de concurrencia de servidor.

Los borradores creados localmente se limitan al administrador que los creó. Los envíos de una sesión ciudadana se limitan al identificador autenticado. El ejemplo ciudadano inicial es ficticio y común a la demostración; no representa una respuesta institucional del usuario. Un envío anónimo queda sin propietario y pendiente de activación simulada: iniciar sesión después con el mismo correo no lo reclama automáticamente. No se registra ninguna cuenta ni se genera un token de activación o contraseña.

## Contrato pendiente del backend

1. Modelos y endpoints para formularios, versiones, preguntas, opciones, envíos y respuestas; permisos de creación, publicación/cierre, consulta y exportación.
2. Campos de identificación fijos frente a preguntas configurables, obligatoriedad de cédula y texto/versionado legal de los consentimientos.
3. Creación automática de cuenta ciudadana pendiente de activación, solo tras aceptación. Reutilizar autenticación existente, sin contraseñas enviadas por correo.
4. Enlace de activación de un solo uso y con vencimiento para verificar correo y establecer contraseña; reenvío y comportamiento ante errores del proveedor.
5. Cuenta existente: autenticar/verificar titularidad antes de vincular; no duplicar, cambiar rol o contraseña, ni revelar públicamente la existencia de cuentas. Definir correos de cuentas administrativas respetando separación de roles.
6. Persistencia e idempotencia, conservación del envío si falla el correo, expiración de pendientes y vinculación posterior comprobada.
7. Listado/detalle de envíos del ciudadano y autorización de respuestas administrativas por formulario. Definir exportación, filtros y paginación antes de integrarlos.

No se han inventado URLs ni payloads para esas operaciones. Los modelos de demostración no deben enviarse directamente como DTO.

## Mapas y otros límites

La referencia visual acordada para cartografía es un mapa base real estilo OpenStreetMap, con atribución. Este bloque no añade aún una pregunta de ubicación ni sustituye los mapas ilustrativos existentes. El campo de ubicación y su dato geográfico deben definirse antes de incorporarlos al constructor. Tampoco se incluyen archivos, lógica condicional, programación de fechas ni exportación de respuestas en esta primera demostración.

## Verificación

- `npm run test:api`: diez suites correctas. La nueva cubre validación, revisiones, copias, esquemas inmutables, cierre/borrador, separación de propietarios, ausencia de reclamación por correo, cinco tipos de pregunta, vista previa sin envío y doble clic sin duplicar.
- `npm run build`: compilación de producción correcta.
- Chrome local con API interceptada: crear borrador, añadir una pregunta múltiple, guardar, vista previa y errores, publicación simulada, envío anónimo pendiente, bloqueo de borrador/cerrado, envío desde sesión ciudadana y consulta de su respuesta. Se verificaron anchos a 360 px y capturas de vista previa clara y respuesta ciudadana oscura. La prueba de permisos cubre también el rechazo a moderadores.
- No se invocaron endpoints nuevos de formularios ni se crearon usuarios, correos o respuestas de backend. Las pruebas de navegador detectaron un desbordamiento del encabezado público con iconos externos bloqueados; se sustituyeron sus iconos de tema por SVG local.

Pendientes: contrato e integración reales, pruebas operativas autorizadas, revisión con lector de pantalla y más pantallas/estados en dispositivos reales. Los cambios son locales, sin despliegue.
