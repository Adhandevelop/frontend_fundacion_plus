# Moderación de comentarios de demostración

## Vistas y organización

> Documento histórico de la demostración. Las rutas administrativas ya se sustituyeron por REST: consultar [integracion-moderacion-comentarios.md](integracion-moderacion-comentarios.md) para el comportamiento vigente. El historial local y la vista previa ficticia descritos aquí no se presentan en esas rutas.

- `/admin/comentarios`: cola con búsqueda, caso, estado, indicadores, paginación de cinco filas y estado vacío.
- `/admin/comentarios/:id`: texto recibido, decisiones, motivo interno, vista previa pública e historial local.
- `?caso=<radicado>` filtra la cola desde un expediente administrativo.

El menú y las fichas administrativas de casos enlazan el módulo. `features/administration/comments` separa modelos/fixtures, servicio de moderación, listado y detalle. Reutiliza el sistema visual administrativo; no se recibió un mockup específico.

## Datos y decisiones

Seis fixtures de autoría ficticia incluyen los cuatro estados del CHECK de `comentarios`: pendiente, aprobado, rechazado y oculto. Los textos son neutros; sus estados no representan infracciones ni actuaciones de personas reales. La fecha del fixture no acredita un envío real.

Transiciones locales propuestas:

| Estado actual | Acciones de ejemplo |
|---|---|
| Pendiente | Aprobar o rechazar. |
| Aprobado | Ocultar. |
| Rechazado u oculto | Volver a pendiente para otra revisión. |

Las transiciones se comprueban también en el servicio. Rechazo, ocultamiento y retorno a pendiente requieren motivo interno de 10 a 2000 caracteres; aprobar admite nota opcional hasta 2000. Son reglas locales por acordar: el SQL enumera estados, pero no contiene esas restricciones de transición o longitud de motivo.

Cada decisión exige confirmación y conserva estado previo/nuevo, nota, fecha y etiqueta de perfil moderador ficticio. No permite editar contenido, autor o caso ni eliminar comentarios. La revisión local capturada al abrir la acción evita sobrescribir una decisión posterior; un conflicto exige cancelar y abrir de nuevo. No presupone que exista una columna de versión en el SQL ni un contrato HTTP confirmado.

Los filtros ignoran tildes y combinan texto/alias/código con caso y estado. Los indicadores cubren toda la selección, no solo la página. Consultar, filtrar o previsualizar no añade decisiones.

## Vista previa pública y aislamiento

El detalle incluye una proyección separada con ID/referencia pública, alias ficticio, fecha y texto. No incluye motivos, etiqueta moderadora, revisión ni historial. Solo admite comentarios aprobados asociados a `PLUS-2025-084`, la única ficha pública detallada implementada como ejemplo en el prototipo. Esta condición local no es una política de publicación para la API.

Ocultar o rechazar excluye el comentario de la proyección. Volver a pendiente tampoco lo publica. Aprobar un comentario de otro caso no lo introduce en esa salida. En producción, el servidor debe comprobar tanto aprobación del comentario como publicación del caso y datos autorizados de autoría.

La proyección se muestra solo dentro de la revisión administrativa. Las decisiones no cambian los comentarios estáticos del portal, la moderación de casos, el seguimiento privado, las evidencias ni las conversaciones. El formulario de aporte público continúa validando sin guardar ni añadir filas a esta cola.

## Persistencia y backend pendiente

Todo es estado en memoria y se pierde al recargar. No hay correo, notificación al autor, sanción de cuenta, publicación externa, autorización real ni auditoría institucional. Identificadores desconocidos muestran un estado no disponible.

`comentarios` no almacena motivos, revisor ni historial de moderación. Antes de integrar, acordar si esas decisiones se conservan mediante auditoría autorizada u otra persistencia específica; no descartar motivos silenciosamente. El servidor fija actor/fecha, permisos, visibilidad y transacciones. La auditoría general de casos del prototipo no se reutiliza como si acreditara estas acciones.

Los DTO, las acciones permitidas, el retorno a revisión, la concurrencia y las reglas de publicación deben definirse en los contratos de comentarios. Los textos se renderizan mediante interpolación, sin ejecutar HTML.

## Verificación

Compilación Angular de producción. Comprobaciones locales de estados/transiciones, límites de motivos, revisión obsoleta, historial acumulado, identificadores únicos de decisiones, conservación del texto, filtros y representación pública sin notas internas. Se verifica que comentarios de otro caso no entren en la proyección del ejemplo.

Pendiente revisión visual y de teclado en navegador: ambos temas/tamaños, foco, formularios, filtros y navegación. Las comprobaciones de lógica no sustituyen esa revisión.
