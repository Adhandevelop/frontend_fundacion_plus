# Problemas y pendientes de integración PLUS

Actualizado: 11 de noviembre de 2026. Este registro separa problemas comprobados, mitigaciones del frontend y trabajo pendiente del backend. Se continúa con los módulos que no dependen de cada problema. No se modificó Django ni la base de datos desde este repositorio.

## Entrega actual para el equipo de backend

**Este es el documento vigente para enviar al backend.** Incorpora su informe de correcciones, una nueva lectura del código local y comprobaciones HTTPS del 9 de noviembre de 2026. Una corrección local no se considera desplegada por existir en el repositorio. Las pruebas de escritura del frontend usan HTTP simulado; no se cambiaron roles, contraseñas o casos reales para preparar esta entrega.

### Orden de trabajo y estado comprobado

| Prioridad | Punto | Estado actual | Acción concreta del backend |
|---|---|---|---|
| 1 · Alta | P01 · Exclusividad ciudadana | **Corregido en las vistas locales, sigue abierto en producción.** Las cuatro consultas ciudadanas aceptaron al administrador con 200. | Desplegar la versión que usa `IsCitizenOnly` y verificar 403 para roles internos en rutas y aliases. |
| 1 · Alta | P15 · Último administrador y edición general | **Corrección parcial local.** Usuarios/roles son exclusivos de administrador y las acciones específicas tienen `last_admin_lock`; falta esa garantía visible en PATCH/PUT general. | Centralizar la protección o retirar rol/estado de edición general. Revisar también los validadores de contraseña administrativos. |
| 2 · Alta | P16 · Sesiones tras cambiar rol/estado | **Implementado localmente; pendiente verificar despliegue y efecto.** | Probar revocación de access y refresh mediante todas las rutas admitidas, con cuentas controladas. No rehacer lo ya implementado. |
| Desbloqueado | P02 · Catálogos territoriales | **Despliegue `db69f04`:** alcance exclusivo del Meta con 1 departamento, 29 municipios y 70 comunidades. | Confirmar que ese alcance es la decisión institucional y acompañar una prueba funcional de radicación. |
| 2 · Siguiente bloque | P11 · Contenido inicial y pruebas reales | **Inventario listo; contenido sin aprobación/importación.** | Preparar carga editorial específica, repetible y de borradores aprobados; definir datos de prueba operativos y comprobar correo. |
| 3 · Media | P03 | Serializer corregido; el servicio conserva el fallback con `or`. | Unificar tratamiento de coordenadas cero y probar el recorrido completo. |
| 3 · Media | P04 | GET de mensajes sigue marcando lectura. | Definir/documentar el efecto o trasladarlo a lectura explícita. |
| 3 · Media | P05 | Hay diferencias entre manual, OpenAPI y respuestas. | Alinear ejemplos, filtros, permisos y DTO con la versión desplegada. |
| 3 · Media | P06 | Anexos iniciales resueltos por el frontend en dos operaciones. | Documentar esa secuencia o implementar el multipart inicial prometido. |
| 3 · Media | P07 | Sin garantía acordada de idempotencia/concurrencia. | Definir el contrato y las garantías para escrituras sensibles. |
| 4 · Alcance | P08 | Conversaciones generales sin hilo definido. | Confirmar si entran en alcance y, en ese caso, definir su contrato. |
| 3 · Decisión | P09 | Dashboard global frente a casos asignados. | Confirmar el alcance autorizado de los agregados para representantes. |
| 3 · Media | P10 | Caso inexistente en candidatos puede dejar el listado general. | Responder error y validar elegibilidad en el servidor. |
| 3 · Media | P12 | Auditoría recortada, sin paginación completa ni filtros uniformes. | Paginar el conjunto y unificar filtros/conteos y detalle autorizado. |
| 3 · Verificación | P13 | **Corrección local nueva:** manejo de valores no numéricos y límites de tamaño. | Verificar despliegue y documentar normalización frente a rechazo de valores. |
| 3 · Función pendiente | P14 | Comentarios sin historial específico de decisiones. | Exponer historial autorizado por comentario y definir control de versión. |
| 3 · Formularios | P17 | Versiones históricas sin preguntas en el detalle administrativo. | Exponer detalle de versión con las preguntas congeladas para vista previa y auditoría. |
| 3 · Noticias | P18 | Medios por ruta y transiciones editoriales sin operación especializada. | Definir carga binaria validada y auditar/validar las transiciones de publicación. |
| 2 · Privacidad | P19 | El detalle público de iniciativas anida actividades con responsable, ubicación y casos vinculados. | Crear una proyección pública mínima y autorizar explícitamente cada campo territorial/vinculado. |
| 3 · Iniciativas | P20 | Medios por ruta y transiciones editoriales genéricas; auditoría desigual en subrecursos. | Definir carga binaria, reglas de transición y auditoría uniforme para ediciones, actividades y relaciones. |

### Qué entregar para poder cerrar los puntos

1. Identificador de la versión desplegada y confirmación de que usa la base de datos/configuración esperadas, sin compartir secretos.
2. Resultados de la matriz de permisos por rol, incluidos aliases y edición general de usuarios; no basta con probar solo `/role/` y `/status/`.
3. Pruebas de revocación y del último administrador en un entorno controlado, con estado inicial/final y códigos HTTP esperados.
4. Manual/OpenAPI de esa misma versión y explicación de cambios de contratos que deba adaptar Angular.
5. Para contenido inicial, un mecanismo específico de importación y una lista aprobada de contenidos/medios. No ejecutar un seed general que también crea cuentas como sustituto de la carga editorial.

**No se solicita crear todos los endpoints de nuevo.** Las secciones siguientes identifican el comportamiento concreto que debe corregirse, acordarse o verificarse. El documento histórico `endpoints-integracion-backend.md` no representa el estado actual de implementación.

## P01 — Alta: exclusividad ciudadana corregida localmente, pendiente en producción

**Evidencia actualizada:** el código local ya usa `IsCitizenOnly` (alias de `IsClientOnly`) en `CitizenCaseViewSet` y `CitizenDashboardView`. `IsCitizen` sigue siendo un permiso amplio, pero ya no es el permiso de esas dos vistas. Sin embargo, en la nueva consulta del servidor el administrador recibió **200** en `GET /api/v1/me/cases/`, `/me/dashboard/`, `/citizen/cases/` y `/citizen/dashboard/`. La cuenta ciudadana recibió 200 en las cuatro rutas. No se demostró acceso a casos de otras personas: el problema comprobado es la exclusividad de rol, no un acceso cruzado a expedientes ajenos.

**Frontend:** guards excluyentes bloquean `/ciudadano/**` para roles internos y `/admin/**` para ciudadanos. Esto protege la navegación, pero no sustituye autorización de API.

**Backend requerido:** desplegar/verificar la corrección local sobre todos los recursos exclusivamente ciudadanos, incluidos aliases. Criterio: ciudadano activo 200; administrador, moderador y representante 403 en las cuatro consultas anteriores y en las operaciones ciudadanas que correspondan. Comprobar que un rechazo de escritura no deje registros. No restringir indiscriminadamente `/me/`: perfil propio, autenticación y otros recursos compartidos también se usan desde administración. Las API comunes de mensajes necesitan conservar autorización por caso y participante.

**Estado:** corrección local comprobada; **abierto en el servidor publicado** hasta repetir satisfactoriamente la matriz. Las sesiones de prueba de esta revisión se cerraron al terminar.

## P02 — Catálogos territoriales disponibles; validación funcional pendiente

**Evidencia actualizada:** tras desplegar `db69f04`, el arranque declaró configuración exclusiva del Meta y sincronizó **1 departamento, 29 municipios y 70 comunidades**. `GET /api/v1/catalogs/departments/` respondió 200 con Meta y sus 29 municipios. Los conteos anteriores de 32/88/83 pertenecen al despliegue previo y ya no describen producción. La existencia de datos está comprobada; esta revisión no certifica la corrección de cada comunidad ni que el alcance exclusivo haya recibido aprobación institucional.

**Frontend:** muestra el estado vacío y exige seleccionar UUID reales y relaciones válidas; no envía nombres o territorios ficticios. Listados, perfil sin residencia y consultas independientes pueden continuar.

**Backend requerido:** confirmar formalmente el alcance exclusivo del Meta, la fuente DANE y las relaciones de las 70 comunidades. Verificar que filtrar municipios por departamento y comunidades activas por municipio devuelve relaciones válidas. No duplicar la carga ni crear tablas nuevas para resolver un vacío que ya desapareció.

**Estado:** **desbloqueado por disponibilidad de catálogos en producción**. Falta una prueba funcional controlada de selección territorial y radicación. Ver [integracion-territorios.md](integracion-territorios.md); sus conteos iniciales vacíos describen la entrega anterior.

## P03 — Media: coordenadas cero descartadas por `or`

**Evidencia actualizada:** `CitizenCaseCreateUpdateSerializer` ya comprueba `is None` y construye la ubicación conservando cero. `CaseService.register_case` todavía usa `pop('latitud', None) or pop('exact_latitude', None)` y lo mismo para longitud. El serializer puede proteger el recorrido HTTP habitual al entregar `ubicacion`; no se afirma que el fallo siga reproduciéndose en ese recorrido. La inconsistencia permanece para caminos que invoquen el servicio con coordenadas sin esa normalización.

**Frontend:** conserva cero y valida rangos y pareja de coordenadas; las pruebas HTTP verifican el envío de ambos ceros. No se creó un caso real para comprobar el fallo.

**Backend requerido:** completar las comprobaciones explícitas contra `None` en el servicio y probar cero tanto mediante serializer/API como mediante servicio directo. Evitar duplicar o contradecir la normalización ya corregida.

**Estado:** corregido en serializer; consistencia del servicio y pruebas completas pendientes.

## P04 — Media: GET de mensajes ya modifica la lectura

**Evidencia de código local:** `CasePrivateMessageListCreateView.get` ejecuta una actualización de `fecha_lectura` antes de devolver el hilo.

**Frontend:** consulta únicamente un hilo elegido por el usuario y limita las marcas explícitas a IDs recibidos/cargados. Cancela consultas anteriores al cambiar de selección. No puede eliminar el efecto que ya realiza el servidor.

**Backend requerido:** si el corte de lectura debe depender exclusivamente de la acción explícita, retirar esa escritura del GET y dejarla en `/messages/read/`. Actualizar la documentación y probar llegadas concurrentes.

**Estado:** abierto; no bloquea envío y consulta del hilo, pero limita la garantía de lectura explícita.

## P05 — Media: divergencias entre manual, OpenAPI y respuestas implementadas

**Comprobaciones:** permisos por módulo/acción en vez del ejemplo booleano; dashboards con claves inglesas; filtro de avisos `leida=false`; respuesta masiva `marked_read_count`; acciones administrativas con `motivo`, `id_responsable`, `estado`, `audiencia` y `estado_revision`. El dashboard administrativo real tiene `cases`, `moderation_queues`, `territories`, `content`, `users`.

**Frontend:** usa las formas comprobadas en código y, cuando había datos disponibles, en consultas reales. No genera contratos a partir de los ejemplos contradictorios. Las suites HTTP cubren las entradas utilizadas.

**Backend requerido:** regenerar y revisar esquemas y ejemplos a partir de serializers/vistas reales; conservar consistencia entre entrega y despliegue.

**Estado:** mitigado para los módulos conectados; alineación documental pendiente. Ver las guías específicas de acceso, casos, comunicación y administración.

## P06 — Media: anexos iniciales no procesados en la creación local revisada

**Evidencia de código local:** el manual ofrece `files`/`archivos` al crear un caso, pero `perform_create`/`register_case` revisados no procesan esos archivos. No se hizo una escritura real para demostrarlo en producción.

**Frontend:** crea el caso por JSON y después sube cada archivo con el endpoint de evidencia. Conserva resultados parciales y nunca recrea automáticamente el radicado por un anexo fallido.

**Backend requerido:** implementar y probar el contrato de archivos iniciales si se mantiene en el manual, o documentar la secuencia de dos operaciones.

**Estado:** mitigado mediante endpoints existentes.

## P07 — Media: escrituras sin contrato de idempotencia/concurrencia

**Evidencia contractual:** no se documenta una clave de idempotencia ni control de versión para creación, mensajes o acciones del expediente. Una respuesta perdida puede ocultar una operación guardada.

**Frontend:** bloquea doble envío, no reintenta automáticamente estas escrituras y exige revisar el estado real ante respuestas inciertas. Las acciones administrativas requieren revisar un resumen antes de confirmar. Se aíslan respuestas tardías de otro expediente.

**Backend requerido:** definir idempotencia/versionado si se necesita garantía frente a duplicados y actualizaciones concurrentes. No se inventaron cabeceras o campos sin contrato.

**Estado:** mitigación local; garantía de extremo a extremo pendiente.

## P08 — Baja: conversaciones generales sin endpoint de hilo definido

**Evidencia:** la bandeja puede incluir `id_caso=null`; solo se documentan hilos privados por caso.

**Frontend:** informa su cantidad sin inventar una ruta para abrirlas. Los hilos de caso funcionan por separado.

**Backend requerido:** definir el contrato y autorización del hilo general si forma parte del alcance.

**Estado:** pendiente de contrato; no bloquea comunicación por caso.

## P09 — Media: dashboard global y listado territorial con alcances diferentes

**Evidencia de código local:** `AdminMetricsDashboardView` agrega toda la plataforma. El listado administrativo sí filtra las asignaciones del representante. La API de dashboard admite representante, moderador y administrador.

**Frontend:** etiqueta esas cifras como **Resumen de plataforma**, no como casos asignados al despacho. La tabla conserva el alcance impuesto por su endpoint.

**Backend requerido:** confirmar si representantes deben ver agregados globales o métricas limitadas a sus ámbitos y aplicar ese criterio en la consulta si corresponde.

**Estado:** alcance etiquetado correctamente; decisión de autorización/negocio pendiente en backend.

## P10 — Media: filtro de candidatos ignora un caso inexistente

**Evidencia de código local:** `AdminUserViewSet.get_queryset` aplica la elegibilidad solo si encuentra el caso; si el UUID no corresponde a uno existente deja el queryset general con los otros filtros. No se consultaron usuarios reales usando un UUID inválido.

**Frontend:** obtiene el UUID del expediente cargado, envía `eligible_for_case`, exige estado activo y un candidato de la página obtenida con rol representante/administrador; no ofrece entrada libre de UUID. Un error de candidatos bloquea la preparación de la asignación.

**Backend requerido:** responder error para un caso inexistente en ese filtro y validar también los ámbitos en la acción de asignar, sin confiar en el selector del cliente.

**Estado:** mitigado en el flujo normal; validación del servidor pendiente.

## P11 — Preparación de contenido y pruebas reales pendientes

Noticias e iniciativas conservan el contenido estático existente como respaldo identificado cuando sus colecciones públicas están vacías o no disponibles. Sus consultas públicas ya están conectadas, pero antes de retirar el respaldo se debe preparar una carga inicial repetible de textos y medios aprobados. Los casos, cifras y usuarios ficticios no se publican como datos institucionales.

**Avance de preparación:** se generó un [inventario reproducible y guía de carga editorial](contenido-inicial/preparacion.md): siete noticias de catálogo, tres tarjetas de inicio, cuatro iniciativas y cuatro paneles del carrusel, con 16 imágenes únicas referenciadas en las fuentes actuales. Las apariciones se mantienen separadas para revisar duplicados. Falta aprobación de textos completos, hechos, fechas, cifras y medios, e implementar/ejecutar la carga editorial del backend. El portal consulta las colecciones reales sin importar automáticamente este inventario en producción.

La verificación anterior encontró bandejas de prueba vacías. No se han creado casos, enviado mensajes ni publicado evidencias reales desde esta integración para verificar formularios. Las acciones se cubren con HTTP simulado y requieren una prueba operativa controlada. Posteriormente sí se realizaron comprobaciones de navegador y revisión de capturas en Chrome local con API simulada: navegación, algunos formularios, temas y anchos. No equivalen a validación visual completa ni a pruebas contra producción. Ver [revision-interfaz-accesibilidad.md](revision-interfaz-accesibilidad.md).

El correo de recuperación tiene implementación local de Resend SMTP y pruebas comunicadas por el backend. La entrega real y el restablecimiento con un buzón accesible siguen pendientes de verificación independiente. No se solicitaron correos ni se cambiaron contraseñas durante la integración.

## P12 — Media: auditoría recortada y filtros no uniformes

**Evidencia de código local:** `AdminAuditEventListView` lee hasta 100 eventos por fuente y entrega hasta 200 combinados, sin paginación. `count` cuenta la selección intermedia, no todo el historial. `source` sí selecciona la fuente; otros filtros documentados no están implementados o se aplican solo a algunas fuentes. Acción se filtra en eventos generales y actor no se filtra en seguridad. Caso, módulo, resultado y fechas no tienen aplicación uniforme en la consulta.

**Frontend:** conectado como vista limitada de eventos recientes. Solo envía `source`; los demás filtros y la paginación trabajan sobre los registros recibidos y se etiquetan como locales. No muestra conteos globales como coincidencias ni promete búsqueda exhaustiva. El detalle permite únicamente metadatos estructurales conocidos, sin mostrar los objetos completos de cambios ni información técnica sensible.

**Backend requerido:** unificar filtros y permisos por fuente, ordenar y paginar el conjunto completo con conteo coherente. Definir un DTO de detalle estable y depurado en el servidor; ocultar campos en Angular no elimina su presencia en una respuesta HTTP autorizada. Añadir pruebas de filtros cruzados, paginación y datos sensibles.

**Estado:** lectura limitada integrada; búsqueda e historial exhaustivos pendientes. Las consultas reales de listado y detalle respondieron 200.

## P13 — Paginación de informes: corrección local por verificar

**Evidencia actualizada:** la vista local ya captura `ValueError`/`TypeError` y devuelve 400 con `invalid_parameter`; limita `page_size` al rango 1–100 y normaliza `page` a un mínimo de 1. Los valores numéricos fuera de rango se ajustan, no se rechazan todos con 400. No se enviaron parámetros inválidos al servidor de producción en esta revisión.

**Frontend:** usa páginas positivas y tamaño fijo de 10. CSV emplea el endpoint específico de exportación sin intentar obtener todos los casos mediante un `page_size` excesivo. Los agregados de `totals` conservan el alcance completo de los filtros.

**Backend requerido:** verificar despliegue y documentar la decisión real: no numéricos → 400; valores numéricos fuera de rango → normalización, o cambiar a rechazo explícito si ese es el contrato acordado. Probar `page=abc`, `page_size=abc`, cero, negativos y tamaños superiores a 100 sin producir 500. No implementar de nuevo el manejo ya presente.

**Estado:** corrección local comprobada; despliegue y alineación contractual pendientes.

## P14 — Media: ficha de comentario sin historial de moderación ni control de versión

**Evidencia de código local:** `CaseCommentSerializer` devuelve contenido y estado actual, sin revisor, motivo ni decisiones anteriores. La acción de moderación guarda el estado, registra la nota en auditoría y genera una notificación, pero no recibe versión esperada o clave de idempotencia. La auditoría unificada no ofrece un filtro completo y paginado por comentario (P12).

**Frontend:** elimina el historial de ejemplo. Antes de guardar muestra el estado, el motivo y si se compartirá con el autor. Consulta la ficha tras guardar, bloquea el doble envío y exige revisión ante respuestas inciertas. No simula protección contra cambios concurrentes ni afirma que auditoría reciente sea un historial íntegro de decisiones. Ver también P07.

**Backend requerido:** exponer una consulta autorizada de decisiones por comentario con actor, fecha, estado anterior/nuevo y motivo; registrar además si se compartió el motivo. Definir control de versión y operaciones atómicas/idempotentes para evitar notificaciones duplicadas o resultados parciales. Mantener las notas internas fuera de las proyecciones públicas.

**Estado:** cola y moderación integradas. Historial y garantías de concurrencia pendientes; sin escrituras de prueba en producción.

## P15 — Alta: controles de privilegios no uniformes en administración de usuarios

**Evidencia actualizada:** `AdminUserViewSet` y el catálogo de roles ya usan un permiso exclusivo de administrador. Las acciones específicas de rol y estado incorporan `last_admin_lock`. La edición general sigue aceptando `rol`, `id_rol`, `rol_nombre` y `estado`; en el serializer y `perform_update` revisados no aparece la misma protección del último administrador. El serializer administrativo de contraseña mantiene un mínimo de longitud, pero no se observa la llamada a los validadores de contraseña de Django que sí usan otros flujos. No se intentó explotar estos caminos con cuentas reales.

**Frontend:** todo el módulo, incluida consulta, está reservado a administrador en menú y rutas directas. Rol único desde catálogo real asignable, edición general limitada a contacto y acciones dedicadas para rol/estado. Bloqueo de cambios de la propia cuenta desde este módulo; perfil propio conserva su ruta administrativa. Ver [permisos-navegacion-administrativa.md](permisos-navegacion-administrativa.md).

**Backend requerido:** conservar la restricción administrativa ya implementada y centralizar la protección del último administrador para **todos** los caminos: PATCH/PUT general, `/role/`, `/roles/` y `/status/`, incluyendo campos alternativos. Como alternativa, retirar rol/estado del serializer general y documentar que solo se cambian mediante acciones específicas. Revisar también la eliminación si sigue expuesta. Aplicar validadores de contraseña al alta/edición administrativa. Probar rechazo sin modificación parcial, no solo el código HTTP.

**Estado:** exclusividad de administrador corregida localmente; **protección integral y pruebas pendientes**. El frontend ya aplica la matriz nueva. No se afirma un ataque demostrado en producción.

## P16 — Revocación de sesiones tras cambiar rol: implementación local por verificar

**Evidencia actualizada:** la acción de rol, la acción de estado y `perform_update` general ya eliminan el token de sesión al cambiar rol/estado. La autenticación revocable comprueba `sid`. El backend comunicó pruebas locales correctas; no se repitieron aquí ni se cambiaron cuentas reales para certificar la revocación en producción. El frontend conserva el perfil en memoria hasta consultar/renovar la sesión, por lo que la invalidación efectiva sigue siendo necesaria.

**Frontend:** rol/estado se gestionan desde fichas independientes del perfil propio. No se prueba un cambio de rol real que altere otras sesiones. El aviso de confirmación explica que las pantallas abiertas pueden necesitar un nuevo inicio de sesión. Los portales conservan sus guards excluyentes, con la limitación de perfil en memoria indicada.

**Backend requerido:** desplegar y verificar la implementación existente. En un entorno controlado, obtener access/refresh, cambiar el rol por cada ruta admitida y comprobar que los tokens anteriores reciben 401; volver a iniciar sesión debe devolver el rol/permisos nuevos. Repetir para suspensión/inactivación y probar transiciones ciudadano ↔ rol interno. Mantener activo el token cuando solo se cambie un dato de contacto, salvo política documentada distinta.

**Estado:** **implementado en código local; pendiente de verificación desplegada**, no una implementación aún ausente. No repetir una corrección ya hecha; entregar evidencia de funcionamiento.

## P17 — Media: no se pueden reconstruir versiones históricas de formularios

**Evidencia de código local:** `AdminFormularioDetailSerializer` entrega `preguntas_borrador`. La colección `versiones` solo contiene identificador, número, vigencia, fecha y conteos. El endpoint público sí entrega las preguntas de la versión vigente, pero únicamente mientras el formulario está publicado. No existe una consulta administrativa de una versión concreta con sus preguntas congeladas.

**Frontend:** usa el borrador cuando está disponible y, para un formulario publicado sin borrador, consulta la versión pública vigente. Si el formulario está cerrado o archivado y no conserva borrador, muestra una limitación explícita en lugar de inventar o mezclar el esquema. Las respuestas históricas individuales sí conservan enunciado, tipo y valor respondido.

**Backend requerido:** añadir una ruta administrativa como `GET /api/v1/admin/forms/{id}/versions/{numero}/` o incorporar en cada versión un detalle autorizado con preguntas, opciones, orden y configuración de validación congelados. Debe mantener `CanManageForms`, evitar modificar la versión y documentarse en OpenAPI. Añadir pruebas para publicado, cerrado, archivado y versión inexistente.

**Estado:** integración principal de formularios completada; vista previa histórica y auditoría íntegra del esquema pendientes de este contrato.

## P18 — Media: medios y ciclo editorial de noticias incompletos

**Evidencia de código local:** `AdminNewsMediaViewSet` usa `NewsMediaSerializer`, cuyo campo editable es `ruta_archivo`; no se observa un parser multipart ni una operación que reciba, valide y almacene el binario. `AdminNewsArticleViewSet` audita `perform_create`, pero no define acciones especializadas para solicitar revisión, publicar o archivar, ni una auditoría explícita de actualización. El serializer permite escribir directamente `estado_publicacion` mediante PATCH.

**Frontend:** listado, detalle, categorías, creación, edición, destacado y cambios de estado ya consumen REST. Confirma los cambios de visibilidad y limita la secuencia mostrada en la interfaz. Muestra medios existentes en lectura, pero no permite introducir rutas de servidor ni simula una subida. Los guards mantienen el módulo para administrador/moderador y la API conserva `IsEditorOrAdmin`.

**Backend requerido:** crear una carga `multipart/form-data` que valide tipo real, tamaño, extensión, nombre, almacenamiento y pertenencia a la noticia; devolver URL autorizada y texto alternativo. Definir acciones o validaciones atómicas para las transiciones editoriales, registrar actor/estado anterior/nuevo en auditoría y aclarar si se necesita rechazo con motivo. Probar que un PATCH directo no omita las reglas ni genere publicaciones parciales.

**Estado:** CRUD textual integrado; carga de medios y garantías del ciclo editorial pendientes.

## P19 — Alta: el detalle público de iniciativas expone una proyección administrativa amplia

**Evidencia de código local:** el detalle público de iniciativa anida ediciones completas. Cada edición incorpora actividades con identificador/nombre del responsable y ubicación, además de casos vinculados con identificadores o códigos. Aunque la intención sea mostrar agenda y cobertura, estos campos no necesitan viajar al navegador para representar el catálogo público y no existe una señal de visibilidad individual en ese DTO.

**Frontend:** consulta el detalle para descripción, años y galería, pero descarta responsables, ubicación, actividades y casos vinculados. Esto evita mostrarlos en la interfaz, pero no elimina los datos de la respuesta HTTP recibida.

**Backend requerido:** definir serializers públicos específicos y mínimos para edición/actividad. Exponer solamente campos aprobados; convertir ubicación exacta en una referencia territorial general cuando corresponda y publicar casos vinculados únicamente si el caso es público y esa relación está autorizada. No confiar en que Angular oculte propiedades. Añadir pruebas anónimas que aseguren la ausencia de UUID de usuarios, datos internos y vínculos no publicables.

**Estado:** catálogo, detalle visual y postulación pública integrados; proyección anidada pendiente de endurecimiento antes de mostrar actividades o vínculos.

## P20 — Media: ciclo administrativo y medios de iniciativas necesitan garantías uniformes

**Evidencia de código local:** el programa acepta cambios directos de `estado_publicacion` mediante PATCH y registra una auditoría genérica de actualización, pero no tiene acciones especializadas ni motivo de rechazo. Los medios reciben `ruta_archivo`, no un binario validado. Ediciones y actividades establecen actor de sesión únicamente al crear; en los viewsets revisados no hay un registro de auditoría equivalente y explícito para todas las actualizaciones y eliminaciones. Indicadores, comunidades, casos vinculados y medios tampoco presentan una política uniforme visible en sus viewsets.

**Frontend:** listado, ficha, creación, edición, publicación y destacado del programa consumen REST. Confirma cambios de visibilidad y no inventa un campo de motivo que el serializer no acepta. Las ediciones reales se muestran solo en lectura; los editores demostrativos de subrecursos no se enlazan desde la ficha integrada. La carga de medios permanece deshabilitada.

**Backend requerido:** definir transiciones permitidas y, si aplica, motivo/revisor; impedir que un PATCH genérico evada sus reglas. Crear carga multipart con validación y almacenamiento controlado. Auditar de forma uniforme altas, cambios y eliminaciones de ediciones, actividades, indicadores, coberturas, casos vinculados y medios, incluyendo estado anterior/nuevo y objeto padre. Añadir pruebas de permisos y pertenencia entre programa, edición y subrecursos.

**Estado:** CRUD textual y lectura de ediciones integrados; subrecursos, medios y garantías editoriales pendientes.
