# Catálogo de recursos y campos necesarios para PLUS

Actualizado: 13 de noviembre de 2026.

Este documento sirve para recopilar el contenido que debe entregarse antes de poblar el sitio. Los nombres técnicos corresponden a modelos y serializers actuales del backend. Los campos generados por el servidor no deben diligenciarse manualmente. Las recomendaciones de dimensiones y calidad de imágenes son editoriales; todavía no sustituyen la validación binaria que debe implementar el backend para noticias e iniciativas.

## 1. Fotografía principal del inicio

Endpoint existente: `/api/v1/admin/site/home-hero/`.

| Campo | Requerido | Contenido |
|---|---:|---|
| `image` | Sí para reemplazarla | Archivo JPG, PNG o WEBP, máximo 5 MB. |
| `alt_text` | Sí editorialmente | Descripción objetiva para lectores de pantalla. |

Recurso recomendado: fotografía horizontal de al menos 1920×1080 px, sin texto incrustado, con sujeto principal visible tanto en escritorio como en recorte móvil. Debe existir autorización de uso y registro de procedencia.

El backend genera `image_url`, `relative_url`, `api_media_url`, `version` y `updated_at`. No deben enviarse como datos editoriales.

## 2. Información institucional del inicio

Actualmente se lee mediante `/api/v1/public/home/` y `SiteSetting`. El backend parametrizó nombre, sigla, representante, cargo y misión en `44e62a5`; la fotografía mantiene su editor especializado. Angular ya incorpora `/admin/configuracion-institucional` para consultar y editar conjuntamente los cinco textos mediante `/api/v1/admin/settings/`.

| Campo esperado | Requerido | Observación |
|---|---:|---|
| `corporation_name` | Sí | Nombre legal completo. |
| `acronym` | Sí | Sigla institucional, actualmente PLUS. |
| `representative_name` | Sí | Nombre aprobado del representante. |
| `representative_role` | Sí | Cargo institucional. |
| `mission` | Sí | Misión aprobada, no texto provisional. |
| `contact_email` | Recomendado | Correo público institucional. |
| `contact_phone` | Recomendado | Teléfono público, si se autoriza. |
| `address` | Recomendado | Dirección o referencia pública. |
| `service_area` | Recomendado | Territorios de actuación. |
| `social_links` | Opcional | URLs oficiales por red. |

Los seis indicadores del inicio se calculan en el backend y **no se cargan como cifras manuales**: casos publicados, casos resueltos/cerrados, municipios, comunidades activas, iniciativas publicadas y actividades realizadas.

La edición de los cinco campos institucionales existentes ya está conectada. Siguen sin contrato público y administrativo `contact_email`, `contact_phone`, `address`, `service_area` y `social_links`; el frontend no debe inventarlos.

## 3. Página “Nosotros”

La vista existe, pero no hay un recurso editorial dedicado en el backend. Para volverla administrable se necesita definir:

| Campo propuesto | Requerido | Recurso asociado |
|---|---:|---|
| `titulo` | Sí | — |
| `introduccion` | Sí | — |
| `historia` | Sí | — |
| `mision` | Sí | — |
| `vision` | Sí | — |
| `principios` | Sí | Lista ordenada de título y descripción. |
| `enfoques_trabajo` | Opcional | Lista ordenada. |
| `representante_nombre` | Sí | — |
| `representante_cargo` | Sí | — |
| `representante_biografia` | Opcional | — |
| `imagen_principal` | Recomendado | Horizontal, al menos 1600×900 px. |
| `imagen_principal_alt` | Sí si hay imagen | Texto alternativo. |
| `galeria` | Opcional | Fotografías con alt, descripción, orden y autorización. |
| `documentos` | Opcional | Estatutos, certificados u otros PDF aprobados. |

No debe cargarse este contenido en claves JSON arbitrarias sin acordar antes el contrato de lectura y administración.

## 4. Categorías de noticias

Recurso existente: `NewsCategory`.

| Campo técnico | Requerido | Regla |
|---|---:|---|
| `nombre` | Sí | Único, máximo 120 caracteres. |
| `descripcion` | Opcional | Explica el alcance editorial. |
| `activa` | Sí | Define si puede utilizarse. |

Generados: `id`, `slug`, `fecha_creacion`, `fecha_actualizacion` y `articles_count`.

## 5. Noticias

Recurso existente: `NewsArticle`.

| Campo técnico | Requerido | Regla o contenido |
|---|---:|---|
| `titulo` | Sí | Máximo 220 caracteres. |
| `categoria` | Sí | UUID de una categoría real. |
| `extracto` | Sí | Resumen breve para tarjetas y resultados. |
| `contenido` | Sí | Cuerpo completo aprobado. No sustituirlo por el extracto. |
| `iniciativa_relacionada` | Opcional | UUID de una iniciativa cuando exista relación editorial. |
| `estado_publicacion` | Sí | `borrador`, `en_revision`, `publicada` o `archivada`. |
| `destacada` | Sí | Booleano; confirmar cuántas pueden destacarse. |

Generados o asignados por servidor: `id`, `autor`, `slug`, `fecha_publicacion`, `fecha_creacion`, `fecha_actualizacion`.

### Multimedia de noticia

Recurso existente: `NewsMedia`. Una noticia solo puede tener una portada.

| Campo técnico | Requerido | Regla |
|---|---:|---|
| `noticia` | Sí | UUID de la noticia. |
| `tipo_archivo` | Sí | `imagen`, `video` o `documento`. |
| `ruta_archivo` | Actualmente sí | Ruta de almacenamiento; debe reemplazarse en la interfaz por subida segura. |
| `texto_alternativo` | Sí para imagen | Máximo 250 caracteres. |
| `descripcion` | Opcional | Pie de foto o contexto. |
| `orden` | Sí | Entero para la galería. |
| `es_portada` | Sí | Booleano; una sola portada por noticia. |

Recursos recomendados por noticia:

- Una portada horizontal, idealmente 1600×900 px, JPG/WEBP, con texto alternativo.
- Entre cero y ocho imágenes de galería, con autorización, procedencia, alt y pie.
- PDF solo si es institucional, revisado y apto para publicación.
- Para video: archivo o URL de proveedor autorizado, miniatura y transcripción/resumen accesible.

Disponible desde `54dd730`: los endpoints administrativos de medios reciben `file` o `archivo`, validan formato y tamaño, almacenan de forma segura y devuelven una URL consumible. Falta conectar y probar la interfaz Angular.

## 6. Programas o iniciativas

Recurso existente: `Initiative`.

| Campo técnico | Requerido | Regla o contenido |
|---|---:|---|
| `titulo` | Sí | Máximo 200 caracteres. |
| `subtitulo` | Opcional | Máximo 250 caracteres. |
| `descripcion_corta` | Recomendado | Resumen para catálogo y portada. |
| `descripcion` | Recomendado | Explicación completa del programa. |
| `categoria` | Sí | Texto controlado, máximo 80 caracteres. |
| `estado` | Sí | `planificada`, `en_curso`, `finalizada` o `cancelada`. |
| `estado_publicacion` | Sí | `borrador`, `pendiente`, `publicada` o `rechazada`. |
| `destacada` | Sí | Booleano. |
| `orden_destacado` | Opcional | Entero para ordenar destacados. |

Generados: `id`, `creador`, `slug`, `fecha_publicacion`, `fecha_creacion`, `fecha_actualizacion`.

## 7. Ediciones de una iniciativa

Recurso existente: `InitiativeEdition`. Cada programa admite una edición por año.

| Campo técnico | Requerido | Regla |
|---|---:|---|
| `iniciativa` | Sí | UUID del programa padre. |
| `anio` | Sí | Entero entre 2000 y 2200. |
| `nombre_edicion` | Opcional | Máximo 150 caracteres. |
| `temporada` | Opcional | Máximo 100 caracteres. |
| `descripcion` | Opcional | Alcance específico de la ejecución anual. |
| `fecha_inicio` | Opcional | Fecha ISO `AAAA-MM-DD`. |
| `fecha_fin` | Opcional | No anterior al inicio. |
| `estado` | Sí | `planificada`, `en_curso`, `finalizada` o `cancelada`. |

## 8. Indicadores de una edición

Recurso existente: `InitiativeMetric`.

| Campo técnico | Requerido | Regla |
|---|---:|---|
| `edicion` | Sí | UUID de la edición. |
| `nombre` | Sí | Máximo 100 caracteres. |
| `valor` | Sí | Decimal de hasta 14 dígitos totales y 2 decimales. |
| `unidad` | Opcional | Máximo 50 caracteres: personas, kits, jornadas, etc. |
| `descripcion` | Opcional | Método o alcance del indicador. |
| `icono` | Opcional | Identificador controlado, máximo 50 caracteres. |
| `tipo_medicion` | Sí | `estimado` o `real`. |
| `orden` | Sí | Entero. |
| `fecha_corte` | Opcional | Fecha del dato. |

Para publicar un indicador real deben existir fuente, responsable, fecha de corte y evidencia verificable, aunque no todos sean todavía campos técnicos obligatorios.

## 9. Cobertura territorial de una edición

Recurso existente: `InitiativeCommunity`.

| Campo técnico | Requerido | Regla |
|---|---:|---|
| `edicion` | Sí | UUID de edición. |
| `comunidad` | Sí | UUID de comunidad existente. |
| `observaciones` | Opcional | Alcance o particularidades. |

No deben enviarse nombres escritos libremente cuando la comunidad ya está en el catálogo.

## 10. Actividades o jornadas

Recurso existente: `InitiativeActivity`.

| Campo técnico | Requerido | Regla |
|---|---:|---|
| `edicion` | Sí | UUID de la edición. |
| `responsable` | Opcional | UUID de usuario interno. No debe exponerse automáticamente al público. |
| `comunidad` | Opcional | UUID de comunidad. |
| `titulo` | Sí | Máximo 200 caracteres. |
| `descripcion` | Opcional | Objetivo y desarrollo. |
| `fecha_inicio` | Sí | Fecha y hora con zona. |
| `fecha_fin` | Opcional | No anterior al inicio. |
| `lugar` | Opcional | Máximo 200 caracteres. |
| `ubicacion` | Opcional | Punto geográfico SRID 4326; definir visibilidad antes de publicarlo. |
| `estado` | Sí | `programada`, `realizada` o `cancelada`. |

Recursos recomendados por actividad: una portada opcional, galería autorizada, lista de asistencia solo privada, acta o informe PDF privado/público según clasificación y resultados verificados.

## 11. Multimedia de iniciativas

Recurso existente: `InitiativeMedia`.

| Campo técnico | Requerido | Regla |
|---|---:|---|
| `iniciativa` | Sí | UUID del programa. |
| `edicion` | Opcional | UUID si el medio pertenece a una edición concreta. |
| `tipo` | Sí | `imagen`, `video` o `documento`. |
| `ruta_archivo` | Actualmente sí | Debe provenir del almacenamiento, no escribirse manualmente desde Angular. |
| `texto_alternativo` | Sí para imagen | Descripción accesible. |
| `descripcion` | Opcional | Pie o contexto. |
| `es_portada` | Sí | Portada del programa o edición según ámbito. |
| `orden` | Sí | Entero. |

Recomendación: portada 1600×900 px y galería en relación 4:3 o 16:9, evitando mezclar orientaciones sin recorte previsto. Conservar original autorizado y versión optimizada WEBP/AVIF cuando el almacenamiento lo permita.

## 12. Vínculos entre edición y casos

Recurso existente: `InitiativeCaseLink`.

| Campo técnico | Requerido | Regla |
|---|---:|---|
| `edicion` | Sí | UUID de edición. |
| `caso` | Sí | UUID de caso. |
| `tipo_vinculo` | Sí | `hallazgo`, `seguimiento`, `resultado` u `otro`. |
| `observaciones` | Opcional | Justificación interna. |

La relación no debe volver público un caso automáticamente.

## 13. Postulaciones comunitarias

Recurso existente: `EventProposal`.

| Campo técnico | Requerido | Regla |
|---|---:|---|
| `usuario` | Automático si hay sesión | Cuenta ciudadana asociada. |
| `comunidad` | Condicional | UUID de catálogo. |
| `comunidad_declarada` | Condicional | Obligatoria si no se selecciona comunidad. Máximo 200. |
| `nombre_contacto` | Sí para anónimo | Máximo 150. |
| `telefono_contacto` | Sí para anónimo | Máximo 25. |
| `acepta_tratamiento_datos` | Sí | Debe ser verdadero. |
| `iniciativa_solicitada` | Opcional | UUID del programa. |
| `titulo` | Sí | Máximo 200. |
| `descripcion` | Sí | Necesidad comunitaria. |
| `tipo_actividad` | Opcional | Máximo 80. |
| `fecha_sugerida` | Opcional | Fecha. |
| `estado` | Administrativo | `pendiente`, `en_revision`, `aprobada` o `rechazada`. |
| `respuesta` | Administrativo | Decisión o comunicación. |
| `iniciativa_generada` | Opcional administrativo | UUID creado a partir de la propuesta. |

Generados: `id`, `revisor`, `fecha_creacion`, `fecha_revision`.

## 14. Documentos legales

Recurso existente: `LegalDocument`, actualmente de lectura pública/versionada.

| Campo técnico | Requerido | Regla |
|---|---:|---|
| `tipo` | Sí | `tratamiento_datos`, `terminos_uso`, `radicacion_caso` o `boletin`. |
| `version` | Sí | Máximo 30; única dentro del tipo. |
| `titulo` | Sí | Máximo 200. |
| `contenido` | Sí | Texto aprobado legalmente. |
| `vigente` | Sí | Solo la versión aplicable debe aceptarse en nuevos registros. |
| `fecha_vigencia` | Sí | Fecha y hora de entrada en vigor. |

Debe conservarse qué versión aceptó cada persona; nunca reemplazar el texto histórico de una versión ya aceptada.

## 15. Formularios dinámicos

Para cada formulario se debe preparar como mínimo:

- título, slug, descripción e instrucciones;
- finalidad y público objetivo;
- estado y período de disponibilidad;
- documento legal/política aplicable;
- preguntas en orden;
- tipo de cada pregunta;
- obligatoriedad;
- opciones para selección;
- límites y validaciones;
- mensaje de confirmación;
- responsable interno de las respuestas;
- política de retención/exportación.

Los tipos actuales son `texto_corto`, `texto_largo`, `numero`, `fecha`, `booleano`, `seleccion_unica` y `seleccion_multiple`.

## 16. Lista de archivos que debe entregar el equipo editorial

1. Logotipo oficial en SVG y PNG transparente, con autorización de uso.
2. Fotografía principal del inicio y texto alternativo.
3. Fotografías institucionales para “Nosotros”, con créditos/autorizaciones.
4. Portada y galería de cada noticia.
5. Portada general de cada iniciativa.
6. Fotografías/documentos separados por edición y actividad.
7. PDFs institucionales aprobados.
8. Textos completos de noticias; no solo títulos y resúmenes.
9. Misión, visión, historia, principios y datos públicos de contacto.
10. Fuente y fecha de corte de cada indicador.
11. Relación entre comunidades, ediciones, actividades y casos mediante identificadores reales.
12. Textos legales vigentes y su versión.

Cada archivo debe incluir: nombre descriptivo, propietario/procedencia, autorización, fecha, recurso al que pertenece, visibilidad (`publico` o `interno`), texto alternativo cuando aplique y pie/crédito opcional.

## 17. Datos que no deben inventarse

- cifras de beneficiarios o impacto;
- fechas de actividades realizadas;
- nombres de responsables;
- comunidades atendidas;
- casos vinculados;
- testimonios;
- estados de publicación;
- coordenadas;
- autorías, permisos o créditos de imágenes;
- textos legales.

El contenido se debe cargar inicialmente como borrador, revisar y publicar explícitamente.
