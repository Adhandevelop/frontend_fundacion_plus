# Histórico del prototipo de postulaciones

> Este documento describe la primera versión local. La bandeja, el detalle y la revisión actualmente consumen `/api/v1/admin/proposals/`; consultar [iniciativas-administrativas.md](iniciativas-administrativas.md) para el estado vigente.

## Vistas y organización

- `/admin/postulaciones`: bandeja con búsqueda, estado, iniciativa solicitada, indicadores, paginación de cinco filas y estado vacío.
- `/admin/postulaciones/:id`: ficha de datos recibidos, contacto ficticio, iniciativa solicitada y resultado de revisión.
- `?programa=<id>` filtra la bandeja al llegar desde una ficha administrativa de programa.

El menú administrativo y las fichas de programa incorporan enlaces. `features/administration/proposals` separa fixtures/modelos, servicio local, listado y detalle. Se reutiliza el layout de ambos temas; no se recibió mockup específico de la bandeja.

## Datos y revisión

Cuatro fixtures cubren pendiente, en revisión, aprobada y rechazada, valores del CHECK SQL. Los contactos están identificados como ficticios, con teléfono de ceros sin enlaces de llamada, WhatsApp o correo. Fechas, revisión y aceptación de los fixtures no acreditan hechos ni consentimientos reales.

Las fichas recibidas se consultan sin editar contacto, título, iniciativa solicitada o territorio. El flujo de demostración permite pendiente → en revisión → aprobada/rechazada. No ofrece reapertura, eliminación ni retorno al estado anterior. Son transiciones locales propuestas: el CHECK SQL enumera estados, pero no define esas transiciones.

Iniciar revisión requiere confirmación. Aprobar/rechazar requiere una respuesta de entre 10 y 2000 caracteres, regla visual pendiente de contrato para el campo TEXT. La simulación fija la etiqueta de revisor y la fecha al aplicar cambios; no permite elegir una identidad autenticada. En la API real el actor y la fecha deben proceder del servidor.

La aprobación puede vincular un programa existente de ejemplo como resultado, o quedar sin vínculo. Ese programa se conserva separado de la iniciativa solicitada; no se reemplaza la petición original. La simulación no crea una iniciativa, edición o actividad, ni cambia la publicación de un programa. El uso exacto de `id_iniciativa_generada` para resultado existente/nuevo debe confirmarse con backend antes de integrar.

La acción captura una revisión local de la fila y el servicio rechaza escrituras con una revisión anterior. Esto demuestra el estado de conflicto sin prometer que el SQL tenga columna de versión o que ese sea el contrato HTTP definitivo. Los estados finales permanecen en lectura.

Los indicadores de bandeja usan toda la selección filtrada, no solo la página. Búsqueda sin tildes por título, descripción, territorio o contacto. Los datos permanecen en memoria; recargar restaura los cuatro fixtures. Una referencia desconocida muestra no disponible.

## Formulario público

El formulario de participación de `/iniciativas` ahora incluye título obligatorio hasta 200 y una casilla de aceptación de demostración obligatoria. Se ajustan nombre a 150, territorio declarado a 200 y teléfono a un máximo de 25 según las columnas de propuesta. La descripción conserva el límite visual de 2000 pendiente de contrato.

La casilla confirma el uso de datos ficticios en esta demostración: no sustituye una política aprobada ni registra consentimiento real. Antes de envíos reales deben mostrarse aviso/versiones acordados y persistir la aceptación conforme al contrato. Las opciones de dinámica del mockup todavía necesitan mapearse a IDs/catálogos reales.

El botón valida únicamente el ejemplo. No incorpora los campos a la bandeja administrativa, no envía solicitudes y no notifica al equipo. Este aislamiento evita presentar datos introducidos en el formulario como una solicitud recibida realmente. Los fixtures administrativos son independientes.

## Límites e integración pendiente

No hay autenticación, permisos efectivos, aceptación legal registrada, mensajes salientes, envío de respuestas, auditoría institucional ni API. En producción, contacto y respuestas se sirven solo a personal autorizado y con políticas de retención acordadas; no deben aparecer en consultas públicas.

Antes de integrar `propuestas_iniciativas`: acordar campos, vínculo con usuario/comunidad, iniciativa solicitada frente a generada, revisores, transiciones, motivos/respuestas, concurrencia y notificaciones. Si aprobar crea un programa nuevo, debe ser una operación distinta o explícitamente transaccional; no inferirlo del cambio de estado.

## Verificación

Compilación Angular. Comprobaciones locales de transiciones, revisión obsoleta, respuestas inválidas, referencia a programa inexistente, conservación de iniciativa solicitada, filtros, separación del portal y ausencia de creación automática de programas. Se verifica el formulario público con título/aceptación requeridos y límite telefónico, sin efectos en la bandeja.

Pendiente revisión visual de ambos temas/tamaños, teclado, foco, navegación y formularios en navegador.
