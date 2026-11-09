# Auditoría local de casos

Ruta: `/admin/auditoria`. Acceso desde el menú administrativo y desde cada expediente administrativo con búsqueda por código (`?caso=...`).

## Organización

- `core/demo/audit-demo.model.ts`: tipos y filtros de presentación, sin contratos REST.
- `core/demo/audit-demo.service.ts`: lista de eventos en memoria compartida por los módulos de demostración.
- `features/administration/audit`: vista de consulta, filtros, indicadores, paginación y detalle.

La pantalla reutiliza el layout, la paleta clara/oscura y los controles administrativos. No se recibió un mockup específico de auditoría; se sigue el sistema visual existente.

## Eventos

Al iniciar hay un único evento de muestra, identificado como ejemplo inicial, relacionado con `PLUS-2025-084`. No se deriva del historial del expediente ni se presenta como una acción efectuada por una persona real.

Las acciones posteriores del workspace generan eventos con origen local: revisión de publicación, solicitud de corrección, asignación, avances, resolución/cierre, aportes, mensajes, visibilidad de evidencias y restablecimiento. Se distingue el perfil administrativo o ciudadano de ejemplo. Los perfiles se derivan del recorrido de demostración, no de autenticación ni de identidad verificada.

Se registran campos operativos acotados: gestión, publicación, responsable, visibilidad, cantidad de anexos del aporte y restablecimiento. No se copian motivos, títulos/descripciones libres de avances, resultados narrativos, textos de mensajes, nombres de archivos ni archivos. Abrir una pantalla, filtrar o consultar detalles no añade eventos. Seleccionar una evidencia inexistente y restablecer un ejemplo sin cambios tampoco añade eventos.

Restablecer un caso conserva la actividad anterior y añade el evento de restablecimiento cuando había cambios. La aplicación no ofrece edición o borrado de eventos. Toda la actividad local se pierde al recargar, quedando de nuevo el único evento inicial de muestra.

## Consulta

Búsqueda sin distinguir tildes por código, acción y perfil; filtros combinables de acción, perfil, origen y fechas. Las fechas y horas se muestran en UTC. Los extremos del intervalo incluyen ambos días; un intervalo invertido muestra un error y no produce resultados. Restablecer limpia únicamente los filtros.

La tabla presenta diez eventos por página en orden de incorporación, con los nuevos primero. Los indicadores reflejan toda la selección filtrada. El detalle muestra antes/después cuando corresponde y un enlace al expediente de ejemplo. Los filtros y la paginación cierran el detalle anterior; al abrirlo el foco se mueve al panel para facilitar su consulta.

## Verificación y backend pendiente

Compilación Angular de producción. Comprobaciones locales de cada acción, perfil emisor, cambios de campos, identificadores únicos, exclusión de texto privado, filtros combinados, búsqueda sin tildes, límites de fecha, resultados vacíos y restablecimiento sin borrado. Se revisa también que los informes sigan reflejando la gestión y que el historial ciudadano excluya notas internas.

Pendiente revisión visual de temas, móvil/escritorio, teclado y paginación en navegador.

Este registro no constituye una auditoría institucional: no verifica usuarios, permisos, integridad, retención ni persistencia. La auditoría definitiva debe originarse y protegerse en el backend. Antes de conectarla, definir el contrato de eventos, campos permitidos, identidad, fechas, filtros, paginación y autorización de consulta.
