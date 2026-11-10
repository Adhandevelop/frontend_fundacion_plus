# Integración administrativa de dashboard y casos

Fecha: 9 de noviembre de 2026. Continúa la integración REST manteniendo los portales excluyentes. Los problemas detectados se registran en [problemas-integracion.md](problemas-integracion.md), sin detener las funciones independientes.

## Alcance conectado

- Dashboard: indicadores reales, agregados de publicación/estado, correcciones abiertas y conteos de contenidos. Se retiraron cifras ficticias, porcentajes de cobertura y plazos que no devuelve la API.
- Listado reutilizable completo/compacto: paginación de servidor, búsqueda, publicación, gestión, prioridad, tipo, departamento y municipio. El endpoint impone el alcance del actor; no se calcula sobre fixtures.
- Expediente administrativo por UUID o código, independiente del componente ciudadano. Incluye solicitante, resultado, seguimientos internos/autorizados, historial, correcciones, aportes y evidencias.
- Publicación/prioridad, solicitud de corrección, asignación de responsable, seguimiento por audiencia y resolución/cierre narrativo.
- Revisión de evidencia: descripción, audiencia y estado de revisión; descarga binaria autenticada desde la ruta administrativa.
- Cada escritura necesita validación y revisión de un resumen antes de Confirmar y guardar. Los botones de gestión dependen de `allowed_actions` del expediente; el backend sigue autorizando la operación.

No están conectados en esta entrega el chat administrativo, la subida de evidencias del equipo, la radicación institucional, alertas tempranas y contenidos administrativos. No se muestran como si sus servicios de demostración editaran los casos reales. Informes y auditoría reciente se conectaron posteriormente: ver [alcance y límites](integracion-informes-auditoria.md). También se integraron el [directorio de comunidades](integracion-territorios.md), la [moderación de comentarios](integracion-moderacion-comentarios.md) y [usuarios y roles](integracion-usuarios.md).

## Arquitectura y contratos

`admin-cases.models.ts` y `admin-cases-api.service.ts` definen los DTO/operaciones; `admin-summary.component.ts` reutiliza indicadores; `admin-case-table.component.*` reutiliza la bandeja y `admin-case-detail.component.*` controla el expediente y la revisión de acciones.

Se revisaron las vistas/serializers/services locales y se contrastaron lecturas en producción:

| Operación | Entrada aplicada |
|---|---|
| Dashboard | GET `/admin/dashboard/`; claves `cases`, `moderation_queues`, `territories`, `content`, `users`. |
| Listado | GET `/admin/cases/`; `search`, `estado`, `prioridad`, `estado_publicacion`, `id_tipo_caso`, `id_departamento`, `id_municipio`, `page`, `page_size`. |
| Detalle | GET `/admin/cases/{uuid-o-codigo}/`; DTO con solicitante, historial, seguimientos, evidencias y `allowed_actions`. |
| Moderación | POST `moderation/`: `estado_publicacion`, `prioridad`, `motivo`. |
| Corrección | POST `correction-requests/`: `motivo`. |
| Asignación | POST `assignments/`: `id_responsable`, `motivo`; candidatos paginados de `/admin/users/?eligible_for_case=<uuid>&estado=activo&search=...`. |
| Seguimiento | POST `progress/`: `titulo`, `descripcion`, `audiencia`, `visible_publicamente`; `estado` opcional para pendiente/revisión/proceso. Los estados finales se gestionan por resolución. |
| Resolución | POST `resolution/`: `estado` (`resuelto` o `cerrado`), `motivo`, `resultado_resumen`. |
| Evidencia | PATCH `evidence/{id}/`: `descripcion`, `audiencia`, `estado_revision`; descarga GET `evidence/{id}/download/?download=1` como blob con JWT. |

Las rutas de acción de la tabla se resuelven bajo `/api/v1/admin/cases/{id}/`. No se envían `id_usuario_asignado`, `estado_final`, `detalle_solicitud`, `es_publica` u otras propiedades de ejemplos anteriores cuando no corresponden a estos serializers.

La lectura del detalle ya incluye los historiales/seguimientos que se muestran, por lo que no se hace una segunda consulta de historial para inventar una línea temporal. No se añaden porcentajes de avance ni vencimientos a partir de etiquetas de estado. Los filtros de cuenca y otros criterios no implementados no se presentan como activos.

## Seguridad y errores

El guard raíz y de rutas hijas sigue bloqueando ciudadanos en administración y roles internos en el portal ciudadano. Esta separación de navegación no resuelve el problema de permiso ciudadano de la API identificado como P01.

El formulario de asignación utiliza solamente candidatos activos y de rol admitido devueltos para el expediente, con búsqueda y paginación. No admite un UUID libre. Si falla esa consulta no se prepara una asignación. Las acciones se asocian al UUID capturado y se vuelve a comprobar el permiso al confirmar; una respuesta tardía no sustituye otro expediente abierto.

El seguimiento comienza con audiencia interna. Hacerlo público requiere seleccionarlo explícitamente y revisar la confirmación. La visibilidad de evidencia usa `privado`, `ciudadano`, `publico` y la revisión `pendiente`, `aprobada`, `rechazada`. Los motivos de publicación, corrección y cierre no se presentan como notas privadas: pueden notificarse al ciudadano. El resultado narrativo también puede aparecer en la ficha pública de un caso aprobado.

No hay reintentos automáticos de escritura. Ante una respuesta incierta, se bloquea otra acción hasta recargar y revisar los datos/historial reales. Esto no constituye idempotencia ni control de concurrencia del servidor. Tras un éxito se vuelve a consultar el expediente en lugar de simular cambios localmente.

## Verificación

`npm run test:api` incorpora la suite `tests/admin-cases.spec.ts`: métricas vacías reales, filtros/paginación, ausencia de escrituras antes de confirmar, candidatos acotados al caso, bloqueo de UUID arbitrario, audiencia interna/pública, resolución narrativa, PATCH de evidencia, descarga JWT, respuesta incierta y respuesta tardía de otro expediente. Se mantiene la suite de aislamiento de portales y las anteriores de acceso/casos/comunicación. `npm run build` compila la ruta administrativa real.

Consultas de producción con la cuenta administrativa de prueba autorizada:

| Consulta | Resultado |
|---|---|
| `/admin/dashboard/` | 200; esquema esperado, 0 casos |
| `/admin/cases/?page=1&page_size=10` | 200; paginado, 0 casos |
| `/admin/cases/?page=1&page_size=5&estado_publicacion=pendiente` | 200; paginado, 0 casos |
| `/me/cases/?page=1&page_size=1` con rol administrativo | 200; confirma P01, respuesta vacía |

Se cerró la sesión al terminar. No se modificaron casos, asignaciones, publicaciones, seguimientos, resoluciones o evidencias reales; tampoco se crearon usuarios ni se enviaron correos. No hubo un expediente real con el que verificar acciones: las escrituras se probaron con HttpTestingController. Sigue pendiente una prueba operativa autorizada tras cargar territorios y un caso de prueba, y la revisión visual en navegador.

Los cambios son locales y requieren subida y despliegue del frontend. Los módulos restantes pueden integrarse mientras el backend atiende los problemas documentados.
