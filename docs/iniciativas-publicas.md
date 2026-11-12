# Iniciativas públicas

Ruta `/iniciativas`, con carga diferida y layout público compartido. El menú y el carrusel de inicio conducen al módulo; la convocatoria abre el formulario de postulación dentro de la página.

## Integración REST

- El catálogo consulta `/api/v1/public/initiatives/` y las categorías públicas.
- Búsqueda, categoría y año filtran la colección recibida.
- Al abrir un programa se consulta `/api/v1/public/initiatives/{slug}/`.
- La ficha muestra descripción, portada, galería y ediciones publicadas.
- Cada edición presenta indicadores, comunidades de cobertura, actividades y casos aprobados relacionados.
- Los medios priorizan `url` o `url_archivo`; `ruta_archivo` se conserva solo como compatibilidad.
- La postulación comunitaria envía contacto, territorio declarado, iniciativa opcional, título, descripción y consentimiento a `/api/v1/public/initiatives/proposals/`.

No se muestran coordenadas internas ni identificadores de responsables. Cuando una edición no tiene resultados públicos asociados, la interfaz lo indica expresamente.

## Respaldo de diseño

Los cuatro ejemplos de `initiatives.demo.ts` solo se usan cuando el catálogo está vacío o la consulta falla. La página los identifica como contenido de diseño y no los presenta como registros institucionales.

## Pendientes

- Probar la proyección con iniciativas y ediciones realmente publicadas.
- Aprobar y cargar imágenes, textos e indicadores institucionales.
- Decidir si el detalle expandido debe tener una URL propia para compartirlo directamente.
- Revisar accesibilidad y responsive con colecciones extensas.

## Verificación

- `npm run build`: correcto.
- `npm run test:api`: correcto; la suite comprueba catálogo, detalle estructurado, medios, ediciones, indicadores, cobertura, actividades, casos relacionados y postulación.
