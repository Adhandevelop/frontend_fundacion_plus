# Preparación de noticias e iniciativas para el backend

Fecha de revisión: 9 de noviembre de 2026. Se conserva el contenido actual del frontend hasta cargar y verificar una versión inicial aprobada. Esta entrega no conecta más módulos ni modifica la base de datos.

## Archivos entregados

- [revision.md](revision.md): tabla legible de los títulos y su procedencia.
- [inventario.json](inventario.json): textos existentes, fechas y categorías tal como aparecen, cifras de diseño, referencias de imágenes y hashes de las fuentes. Es un formato de revisión local, **no un contrato REST, fixture Django ni archivo listo para importar**.
- `scripts/export-public-content.mjs`: genera ambos archivos desde los módulos públicos, sin leer documentos de cuentas ni fixtures administrativos. No realiza solicitudes HTTP, descargas, escrituras de base de datos o publicaciones.

Se encontraron siete noticias en el catálogo y tres tarjetas adicionales en el inicio. Hay cuatro programas en el catálogo de iniciativas y cuatro paneles del carrusel con textos distintos. Son **18 apariciones de contenido**, no 18 entidades confirmadas distintas. Se registraron 19 URLs únicas de imágenes y 11 plantillas como contexto de revisión.

Todos los registros generados tienen `approval: pending` y `publication_allowed: false`. Estos campos pertenecen al inventario, no al backend, y no garantizan ninguna restricción de servidor. El JSON no se envía desde Angular ni altera lo que ve el usuario.

## Qué conservar y qué confirmar

| Material de la vista | Preparación realizada | Pendiente antes de cargar/publicar |
|---|---|---|
| Noticias | Título, resumen, categoría visible, fecha textual, imagen y destacado del diseño. | Confirmar hechos, fechas, cifras, nombres y texto completo. Un resumen no debe sustituir automáticamente el cuerpo de una noticia. |
| Iniciativas | Título, resumen, categoría, período, año y etiquetas de impacto/cobertura. | Confirmar programas y ediciones reales. Las etiquetas de ejemplo no se convierten en indicadores, actividades o comunidades oficiales. |
| Inicio | Se conservaron por separado sus tres noticias y cuatro paneles. | Decidir qué tarjetas son otras publicaciones y cuáles son versiones del mismo contenido. No crear ocho programas por duplicar cuatro iniciativas entre vistas. |
| Imágenes | URLs originales, usos y texto alternativo cuando existe. | Validar derechos, autorización de uso, pertinencia y texto alternativo. Migrar medios autorizados al almacenamiento acordado; no descargar automáticamente todas las imágenes de Stitch. |
| Plantillas adicionales | Fragmentos estáticos e imágenes de destacados, tarjetas y secciones de contexto. | Son referencias de diseño, no instrucciones para poblar tablas ni datos institucionales confirmados. |

Las imágenes actuales son referencias externas del diseño. El inventario no prueba su disponibilidad ni acredita permisos para publicarlas. Algunas leyendas alternativas existentes tienen caracteres dañados y se mantienen como evidencia de origen, para corregirlas durante la revisión editorial.

## Correspondencia con los modelos existentes

Los nombres siguientes se contrastaron con serializers y modelos locales; no se propone un nuevo endpoint ni un cambio de contrato.

| Fuente de la vista | Destino potencial ya definido | Condición |
|---|---|---|
| Noticia: título / resumen | `NewsArticle.titulo` / `extracto` | Usar la versión aprobada. |
| Artículo completo | `NewsArticle.contenido` | Falta en el catálogo del frontend; debe entregarse o redactarse y aprobarse aparte. |
| Categoría visible | Relación `NewsArticle.categoria` → `NewsCategory` | Resolver con una categoría real. Las etiquetas del diseño difieren de las creadas por `seed_plus_initial`; no asignarlas por parecido sin revisión. |
| Fecha textual de la noticia | `fecha_publicacion` | Confirmar fecha y hora/zona. No inventar un instante UTC a partir de una etiqueta. |
| Destacado de diseño | `destacada` y orden admitido por cada entidad | Confirmar qué contenidos se destacarán realmente. |
| Imagen de noticia | `NewsMedia`: `noticia`, `tipo_archivo`, `ruta_archivo`, `texto_alternativo`, `orden`, `es_portada` | Usar el medio aprobado y la forma de almacenamiento del backend. |
| Programa: título / resumen | `Initiative.titulo` / `descripcion_corta` | La descripción completa `descripcion` requiere versión aprobada. |
| Categoría de iniciativa | `Initiative.categoria` | Confirmar el texto, sin confundirlo con la tabla de categorías de noticias. |
| Año / período | `InitiativeEdition.anio` / `temporada` | Confirmar edición, fechas y estado. Un período como “Octubre de cada año” no especifica inicio/fin de una edición. |
| Etiqueta de impacto | `InitiativeMetric` de una edición | Solo tras confirmar nombre, valor, unidad, tipo de medición y corte. |
| Cobertura visible | `InitiativeCommunity` de una edición | Resolver UUID de comunidades reales; “12 sectores” no identifica doce relaciones. |
| Imagen de iniciativa | `InitiativeMedia`: programa, edición opcional, tipo, ruta y portada | Definir ámbito y medio autorizado. |

El seed local revisado crea categorías de noticias y otros catálogos, pero no importa los artículos/programas de estas vistas. **No se debe ejecutar un seed general de cuentas o configuración como sustituto de una carga editorial específica.**

## Secuencia de carga propuesta para implementar en el backend

1. Revisar los títulos y asociar variantes del inicio con su noticia o programa, usando las claves locales para dejar trazabilidad. Son referencias de revisión, nunca UUID de base de datos.
2. Entregar por separado las decisiones editoriales y el contenido aprobado. No editar las aprobaciones en el JSON generado: regenerarlo las sobrescribiría. Mantener la correspondencia entre clave de origen y entidad destino en un registro de importación o mecanismo que el backend defina.
3. Preparar un comando específico con modo de simulación y transacción. Que resuelva categorías/autorías válidas y genere los UUID en el servidor. Crear inicialmente borradores con los valores de estado reales del modelo.
4. Hacer la carga repetible sin duplicar entidades ni sobrescribir ediciones manuales. Antes de actualizar una entrada ya cargada, comparar procedencia/hash o una revisión esperada y reportar conflictos. No usar títulos como identidad permanente: pueden corregirse.
5. Crear las ediciones y únicamente los indicadores, coberturas, actividades y medios aprobados. No importar los casos, usuarios o cifras ficticias de otros módulos.
6. Revisar los borradores y publicar explícitamente. Comprobar consultas públicas, portadas, destacados y filtros; contrastar resultados con las apariciones del diseño.
7. Cambiar las consultas del frontend a REST cuando haya contenido publicado verificado. Mantener estados vacíos y errores reales, sin mezclar datos estáticos con respuestas fallidas de API.

Esta secuencia es una propuesta de implementación, no afirma que el comando editorial exista ni que se haya ejecutado. No se necesita cambiar las tablas para inventariar el material; cualquier mecanismo de importación se acuerda en el backend.

## Regeneración y verificación

```powershell
npm run content:inventory
npm run content:check
```

El primer comando actualiza los dos archivos generados. El segundo recalcula y compara sin escribir; falla si cambiaron las fuentes o se alteró el inventario. La salida es determinista, sin timestamps variables; los hashes de fuentes normalizan BOM y saltos de línea para que el checkout de Windows/Linux no genere diferencias artificiales.

Los comandos validan claves únicas, títulos presentes y ausencia de aprobación/publicación en el inventario generado. Esto verifica la extracción y su vigencia, **no la veracidad del contenido ni su autorización editorial**. No se descargaron imágenes ni se invocó la API de producción.
