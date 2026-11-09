# Expediente administrativo y detalle ciudadano

Rutas nuevas:

- `/admin/casos/:radicado`: expediente administrativo.
- `/ciudadano/casos/:radicado`: expediente del ciudadano.

Los enlaces de las tablas abren estas rutas; los accesos de seguimiento y aporte ciudadano seleccionan la sección correspondiente con `seccion`. Cada ruta conserva su layout y usa un workspace común con componentes de seguimiento, evidencias, mensajes, gestión y aporte.

## Datos y simulación

La identidad de cada caso procede del listado de ejemplo de su área. Los mockups ciudadano y administrativo contienen algunas diferencias de texto para los mismos códigos; se conservan las identidades originales sin presentarlas como datos sincronizados de una API. Solo las acciones de simulación se comparten por código durante la sesión de la aplicación.

Los tipos en `case-workspace.demo.ts` son modelos de presentación, no contratos REST. No hay consultas ni mutaciones HTTP. Los cambios se conservan en memoria y se pierden al recargar. Restablecer requiere confirmación y afecta a ambas vistas del mismo código.

Las rutas desconocidas y los códigos que no pertenecen al listado ciudadano muestran un estado de caso no disponible. Esto no implementa autorización: los controles reales de sesión, pertenencia y permisos deben acordarse con el backend antes de mostrar datos privados.

## Operaciones disponibles

En administración: aprobar/rechazar publicación o solicitar correcciones, asignar responsables, registrar avances con visibilidad, registrar resolución/cierre y marcar la visibilidad de metadatos de evidencias. La moderación de publicación es independiente del estado de gestión.

En la vista ciudadana: consultar resumen y avances visibles, responder correcciones, seleccionar anexos locales y añadir mensajes a la conversación de ejemplo. Las notas internas se filtran al renderizar el seguimiento ciudadano. La demostración pública existente no consume esta información privada.

Los mensajes se añaden a memoria: ninguna herramienta, API ni servicio envía comunicaciones a personas reales. Los anexos se validan localmente por extensión y tamaño de hasta 15 MB, como el diseño previo. Solo se incorporan sus metadatos al expediente; no se suben ni se habilita una descarga ficticia. Las evidencias iniciales son nombres/tamaños de ejemplo.

Las restricciones de edición de casos finalizados son reglas locales de demostración y requieren validación de producto y backend. No representan un contrato de transiciones definitivo.

Las operaciones del workspace incorporan eventos al registro local de auditoría (`/admin/auditoria`), sin copiar el contenido de mensajes, motivos ni archivos. El restablecimiento conserva esos eventos durante la sesión de la aplicación; ver `auditoria-demostracion.md`.

## Verificación

Compilar con `npm run build`. Revisar ambos temas y tamaños, apertura desde tablas, secciones, desconocidos, separación de moderación/gestión, motivos obligatorios, notas internas, mensajes entre vistas, anexos, cierre y restablecimiento.

Se ejecutó una comprobación local del servicio de demostración: códigos disponibles por vista, moderación independiente de gestión, asignación, exclusión de notas internas del historial ciudadano, mensajes, anexos privados, cambio de visibilidad, cierre y restablecimiento. La compilación y estas comprobaciones no sustituyen la revisión visual en navegador.
