# Administración de iniciativas y ediciones de demostración

## Vistas y organización

- `/admin/iniciativas`: listado de programas con búsqueda, categoría, operación, publicación, año con edición y paginación de cinco registros.
- `/admin/iniciativas/nueva` y `/admin/iniciativas/:id/editar`: editor de programa permanente.
- `/admin/iniciativas/:id`: ficha, presentación, revisión de publicación, destacado y listado de ediciones.
- `/admin/iniciativas/:programId/ediciones/nueva` y `/admin/iniciativas/:programId/ediciones/:editionId/editar`: editor anual.
- `/admin/iniciativas/:programId/ediciones/:editionId`: indicadores y comunidades de esa ejecución.

Las rutas específicas anteceden al detalle dinámico; el menú administrativo enlaza el listado. `features/administration/initiatives` separa modelos/fixtures, servicio local y componentes de programa y edición. Se reutilizan layout, temas y controles administrativos. No se recibió un mockup específico de este módulo.

## Modelo de demostración

Se conservan separados programa, edición, indicadores y cobertura, siguiendo las relaciones del esquema v1.1. Los DTO REST siguen pendientes; los identificadores locales no son UUID. No hay HTTP, autoría verificada ni permisos reales.

Cuatro programas reutilizan título, descripción e imagen de las iniciativas del diseño. Cada uno tiene una edición de ejemplo 2025. Las ediciones empiezan sin indicadores ni comunidades: no se convierten los textos de impacto/cobertura del mockup en resultados institucionales ni vínculos territoriales inventados. Las fechas vacías se muestran como no definidas.

Operación del programa y edición: planificada, en curso, finalizada, cancelada. Publicación del programa: borrador, pendiente, publicada, rechazada. Los códigos coinciden con las restricciones SQL, pero las transiciones son locales de demostración y requieren contrato de backend.

## Programas

Título hasta 200, subtítulo hasta 250, slug único hasta 220 y categoría de texto hasta 80, según campos del SQL. Descripción corta y descripción se conservan como texto, sin ejecutar HTML. Un borrador puede guardarse sin descripciones; solicitar revisión/publicar requiere ambas como regla local propuesta.

Guardar un programa, incluido uno publicado, vuelve a borrador y quita el destacado sin borrar ediciones. Borrador/rechazado puede pasar a revisión; revisión permite publicación o rechazo con motivo de 10 a 2000 caracteres; publicado puede volver a borrador. Se confirma la transición en pantalla. Solo publicado admite destacado. La operación del programa no cambia por cambiar publicación.

Estas acciones no alteran las iniciativas de Inicio o del portal público. No se simula una publicación externa ni una fecha de publicación institucional. La portada administrativa se obtiene de la galería general del programa; sus medios locales se gestionan como se documenta en `jornadas-medios-demostracion.md`.

## Ediciones

Año entero entre 2000 y 2200, único por programa. Nombre opcional hasta 150 y temporada hasta 100. Fechas opcionales de calendario válidas; si hay ambas, final no anterior a inicial. Cada lectura y escritura comprueba que la edición pertenece al programa indicado; una referencia cruzada muestra no disponible o se rechaza.

Editar la edición mantiene indicadores y comunidades. Editar datos anuales no cambia la publicación del programa ni se propaga al portal. Un programa nuevo puede no tener ediciones; se ofrece estado vacío y alta anual.

## Indicadores

Alta/edición y retirada con confirmación. Nombre con contenido hasta 100, valor decimal no negativo con hasta 12 dígitos enteros y 2 decimales, unidad opcional hasta 50, tipo estimado/real y fecha de corte opcional válida. El valor se conserva como cadena decimal para evitar conversiones innecesarias del NUMERIC(14,2) propuesto; el formato usa punto.

«Real» expresa una selección del ejemplo, no un resultado verificado. No se agregan valores entre unidades o ediciones. La edición puede no tener indicadores, y editar uno conserva su identidad. Descripción, icono y orden configurables del indicador SQL quedan para una ampliación posterior de la interfaz.

## Cobertura

La selección reutiliza el servicio local de Comunidades y territorios. Solo se añaden comunidades activas aún no vinculadas. El vínculo es único por edición/comunidad y no afecta casos ni perfiles. Una comunidad que después quede inactiva conserva el vínculo existente con esa condición visible. Retirar un vínculo requiere confirmación y no borra el catálogo.

El conteo de comunidades no se presenta como beneficiarios. Las comunidades de ediciones diferentes permanecen separadas. Las observaciones por vínculo del modelo SQL todavía no se editan en esta vista.

## Pendientes

Jornadas y medios generales/por edición ya cuentan con vistas locales, documentadas en `jornadas-medios-demostracion.md`. Siguen pendientes vinculación de casos, asociación de medios a jornada concreta, orden de destacados, observaciones de cobertura, más metadatos de indicadores, permisos y contratos REST. El historial/auditoría de casos no se reutiliza para acreditar acciones de iniciativas. La persistencia de los ejemplos es solo en memoria; recargar restaura fixtures y pierde los cambios locales. No hay eliminación de programas/ediciones.

## Verificación

Compilación Angular. Comprobaciones locales de validación, slug único, transiciones, año único por programa, pertenencia de edición, calendario y rangos, precisión decimal, edición de indicadores, cobertura sin duplicados/inactivos nuevos y conservación de hijos al editar. También se verifica que los fixtures públicos permanezcan intactos. Pendiente revisión visual, teclado, navegación y ambos temas en navegador.
