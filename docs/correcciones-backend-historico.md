# Historial de correcciones del backend PLUS

Actualizado: 12 de noviembre de 2026.

Este documento conserva la trazabilidad de problemas anteriores sin mostrarlos como errores activos. El backend comunicó P01–P20 implementados y desplegados en el commit `8dca085`, cerró P21 mediante `54dd730`, P22 mediante `d5219f3` y P23 mediante `ee000bc`, con 38 pruebas correctas. Algunas garantías todavía requieren una prueba funcional autenticada desde el frontend; eso no reabre el problema mientras no exista evidencia contraria.

| Punto | Corrección reportada | Estado actual |
|---|---|---|
| P01 | Exclusividad ciudadana en rutas `/me` y `/citizen`. | Corregido en backend; guards Angular activos. Prueba autenticada final pendiente. |
| P02 | Catálogos territoriales. | Producción limitada institucionalmente a Meta: 1 departamento, 29 municipios y 70 comunidades. |
| P03 | Conservación de coordenadas `0.0`. | Corregido. |
| P04 | GET de mensajes sin marcar lectura. | Corregido; lectura explícita integrada. |
| P05 | OpenAPI y contratos. | Esquema actualizado disponible en `/api/v1/schema/` y `/api/v1/docs/`. |
| P06 | Anexos iniciales de casos. | Frontend mantiene la secuencia segura crear caso → subir evidencias. |
| P07 | Doble envío/concurrencia. | Mitigaciones del frontend activas; formularios dinámicos usan idempotencia. |
| P08 | Conversaciones generales. | Fuera del flujo activo; mensajes por caso integrados. |
| P09 | Alcance del dashboard. | Backend añadió `scope=assigned` y `assigned_to_me`; Angular lo integra en `/admin/casos-asignados`. Prueba real pendiente. |
| P10 | Candidatos y ámbitos. | UUID inexistente devuelve 400 y asignación valida ámbito. |
| P11 | Carga editorial independiente. | Comando idempotente disponible; ejecución pública depende de aprobación editorial. |
| P12 | Auditoría paginada y filtros. | Corregido e integrado en Angular: paginación real y filtros de fuente, acción, resultado, caso y fechas. Prueba funcional final pendiente. |
| P13 | Parámetros de informes. | Manejo defensivo reportado y probado por backend. |
| P14 | Historial de comentarios. | Endpoint implementado; adaptación Angular pendiente. |
| P15 | Último administrador y contraseñas. | Candado centralizado y validadores Django aplicados. Prueba autenticada final pendiente. |
| P16 | Revocación tras rol/estado. | Backend reporta 401 para tokens anteriores. Prueba conjunta final pendiente. |
| P17 | Versiones históricas de formularios. | Corregido e integrado en la vista previa Angular. |
| P18 | Ciclo editorial de noticias. | Acciones `/publish/` y `/archive/` integradas. La carga binaria se separó como P21. |
| P19 | Proyección pública de iniciativas. | Serializer depurado desplegado; verificación con contenido publicado pendiente. |
| P20 | Iniciativas y subrecursos. | Acciones y auditoría reportadas; publicación/rechazo integrados. La carga binaria se separó como P21. |
| P21 | Carga multipart editorial transparente. | Corregido en `54dd730`: `ruta_archivo` opcional, `file`/`archivo`, validación de formato y 15 MB, inferencia del tipo, sanitización, portada única y respuesta con URL utilizable por Angular. Integración y prueba funcional del frontend pendientes. |
| P22 | Filtro y candidatos de vínculos edición–caso. | Corregido en `d5219f3`: filtro server-side por `edicion`, `caso`, tipo y búsqueda; respuesta enriquecida; candidatos aprobados con exclusión automática, búsqueda, filtros, paginación y permiso propio de iniciativas. Angular usa ambos contratos. |
| P23 | Responsables y GeoPoint de actividades. | Corregido en `ee000bc`: responsables institucionales elegibles bajo permiso de iniciativas, validación de escritura y `GeoPointField` SRID 4326 con límites de Colombia. Angular usa el selector y envía GeoJSON `[longitud, latitud]`. |

## Regla para reabrir un punto

Un punto cerrado se reabre únicamente si una prueba contra la versión desplegada demuestra una respuesta incorrecta, un permiso insuficiente/excesivo, pérdida de datos o contradicción contractual. En ese caso se documentará nuevamente en `problemas-integracion.md` con la evidencia concreta.
