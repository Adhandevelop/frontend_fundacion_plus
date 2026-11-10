# Integración ciudadana de mensajes y notificaciones

Fecha: 9 de noviembre de 2026. Continúa la integración de casos ciudadanos. Los portales administrativo y ciudadano conservan sus guards excluyentes.

## Funciones conectadas

- Bandeja real de conversaciones, búsqueda local sobre el listado recibido, filtro de hilos sin leer y actualización manual.
- Vista privada por caso, con autor, fecha, contenido y lectura de los mensajes enviados. Se abre mediante `/ciudadano/mensajes?caso=<uuid-o-codigo>` desde el expediente, una notificación o la bandeja.
- Envío de texto mediante el endpoint REST; el cliente no inventa el destinatario ni envía un UUID de usuario elegido libremente.
- Estados de carga, error, vacío y reintento. No se utilizan mensajes ni participantes de demostración.
- Notificaciones paginadas, filtro de no leídas, lectura individual y lectura de los avisos pendientes de la página cargada.
- Accesos a la conversación o a la sección de historial/aportes de un expediente propio desde los avisos de caso reconocidos.
- Contadores reales de mensajes/notificaciones en la navegación, obtenidos del dashboard ciudadano y asociados al usuario actual.

## Componentes y servicios

- `citizen-communication.models.ts`: conversaciones, mensajes, avisos, paginación y agrupación de hilos.
- `citizen-communication-api.service.ts`: consultas, envío y marcas de lectura por IDs.
- `citizen-inbox-counters.service.ts`: contadores por propietario; no expone datos de una cuenta a otra ni solicita métricas ciudadanas para roles administrativos.
- `citizen-messages.component.*`: conversación conectada, borradores locales por caso y protección ante respuestas de otra selección.
- `citizen-notifications.component.*`: listado, paginación y acciones confirmadas por el servidor.
- `tests/citizen-communication.spec.ts`: pruebas HTTP y de componentes sin servicios externos.

## Contratos comprobados

Se revisaron el manual y las vistas/serializers locales del backend:

| Operación | Contrato usado |
|---|---|
| Bandeja | `GET /me/conversations/`: array con `counterpart`, `last_message`, `unread_count` y referencia al caso. |
| Hilo | `GET /cases/{ref}/messages/`: array de mensajes con `contenido`, remitente/destinatario, fechas y UUID. |
| Envío | `POST /cases/{id}/messages/` con `{contenido}`. El servidor resuelve al destinatario. |
| Lectura de mensajes | `PUT /cases/{id}/messages/read/` con `message_ids` explícitos, recibidos por el usuario y presentes en la respuesta cargada. |
| Notificaciones | `GET /me/notifications/?page=...&page_size=...`, agregando `leida=false` para no leídas. |
| Lectura individual | `PATCH /me/notifications/{id}/` con `{leida:true}`. |
| Lectura de página | `POST /me/notifications/mark-read/` con `{ids:[...]}`; respuesta implementada `marked_read_count`, `unread_remaining`. |

El filtro `unread=true` del manual no lo aplica el queryset local revisado; se usa `leida=false`. La marca masiva devuelve `marked_read_count`, no el `marked_read` del ejemplo narrativo. El esquema inline de conversaciones también difiere del array anidado real; se sigue la implementación y el manual de ese recurso.

El endpoint de bandeja agrupa por caso y contraparte. La interfaz ciudadana reúne esas filas en un único hilo por caso: suma pendientes y toma la última actividad, preservando los autores reales de cada mensaje. Así no presenta un destinatario fijo que pueda contradecir la resolución automática del servidor.

## Lectura y concurrencia

**Comportamiento del backend pendiente de alinear:** `CasePrivateMessageListCreateView.get` ya actualiza `fecha_lectura` al consultar el hilo. El frontend no puede convertir esa consulta en una operación sin efectos. Para que la lectura dependa exclusivamente de la acción explícita con corte, el backend debe retirar ese `update` del GET. El cliente envía únicamente IDs de mensajes recibidos y cargados que todavía figuren sin leer; nunca una selección vacía ni una marca global. Esto no elimina el efecto previo del GET del servidor.

Para notificaciones, el botón indica **Marcar esta página como leída** y captura solo los UUID pendientes de esa página. No alcanza páginas no cargadas ni avisos que lleguen después. El servicio rechaza una lista vacía, porque la implementación del backend la interpretaría como una operación global. El estado de lectura local solo se actualiza tras respuesta de éxito.

Las consultas de hilos anteriores se cancelan y sus respuestas no sustituyen la selección actual. Un envío en curso captura el caso de destino: su respuesta no limpia el borrador de otro caso. Los borradores son temporales por hilo dentro de la vista; no se guardan como mensajes hasta pulsar Enviar.

No hay reenvío automático. Un error de red/servidor deja el resultado incierto y bloquea otro envío del mismo borrador hasta revisarlo y descartarlo. Los errores de validación permiten corregir el texto. El backend no documenta idempotencia de envío, por lo que no puede garantizarse deduplicación si una respuesta se pierde después de una escritura exitosa.

## Límites explícitos

- No hay WebSocket ni consulta periódica. Las vistas se actualizan al abrir, enviar, marcar o pulsar Actualizar; los contadores son la última consulta confirmada.
- Los mensajes de esta vista son texto de hasta 5000 caracteres por decisión de interfaz. No se inventó un contrato para adjuntos de chat, edición o borrado.
- Las conversaciones generales con `id_caso=null` se identifican por su cantidad, pero no se abren: falta una ruta de hilo general en el contrato revisado.
- Los avisos sin caso o de tipos sin destino privado conocido permiten consultar su contenido y marcarlos. Por ejemplo, una moderación de comentario puede referirse a un caso de otra persona y no se enlaza al expediente privado del ciudadano. Su enlace público contextual queda pendiente de integrar ese detalle público.
- Se reutilizan los estilos existentes de conversación y paneles, manteniendo la estructura de bandeja/hilo y las clases de ambos temas. La verificación visual en navegador sigue pendiente porque no había navegadores habilitados en la herramienta disponible.

## Validación realizada

`npm run test:api` incorpora una suite adicional con agrupación por caso, resolución de destinatario en servidor, filtro real de avisos, IDs de lectura limitados, rechazo de listas vacías, avisos llegados después de capturar la página, fallos sin éxito ficticio, borradores entre casos, cancelación de consultas anteriores, respuesta tardía de envío en otro hilo y contadores aislados por usuario/rol. También se compila con `npm run build`.

Se consultaron únicamente las bandejas reales con la cuenta ciudadana de prueba autorizada y se cerró la sesión al terminar:

| Consulta | Resultado |
|---|---|
| `/me/conversations/` | 200, array vacío |
| `/me/notifications/?page=1&page_size=10` | 200, paginado, 0 registros |
| `/me/notifications/?page=1&page_size=10&leida=false` | 200, paginado, 0 registros |

No se enviaron mensajes, no se marcaron avisos, no se solicitaron correos y no se crearon casos en producción. Envíos/lectura con datos se probaron mediante HttpTestingController, no contra destinatarios reales. Sigue pendiente una prueba de extremo a extremo con un caso autorizado y participantes de prueba disponibles.

Los cambios son locales: se deben subir y desplegar para reemplazar la demostración del servidor. El [dashboard y los casos administrativos](integracion-casos-administrativos.md) ya se conectaron en su fase posterior; los demás módulos administrativos siguen en demostración. Noticias e iniciativas conservan su contenido hasta preparar su carga inicial. Los problemas se centralizan en [problemas-integracion.md](problemas-integracion.md).
