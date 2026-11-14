# Inventario extraído del frontend

Generado por `npm run content:inventory`. No constituye aprobación editorial ni payload REST. Todos los elementos están pendientes y con publicación bloqueada en este inventario.

- news_catalog: 7
- initiative_catalog: 4
- home_news: 0
- home_initiative_panels: 0
- unique_image_urls: 12
- template_sources: 12

## Textos para revisar

| Clave de revisión | Título original | Fuente |
|---|---|---|
| news:publicacion-0 | Juan David Martínez Bolaño lidera mesa técnica interinstitucional para seguimiento a compromisos viales y de salud en el Atrato | src/app/features/news/data/news.demo.ts |
| news:publicacion-1 | Veeduría ciudadana verifica avance del 78% en obras de acueducto rural en Carmen del Darién | src/app/features/news/data/news.demo.ts |
| news:publicacion-2 | Juan David Martínez Bolaño participa en el Encuentro Regional de Veedurías y Transparencia Pública | src/app/features/news/data/news.demo.ts |
| news:publicacion-3 | PLUS radica informe de alertas tempranas ante la Procuraduría y Defensoría por obras inconclusas | src/app/features/news/data/news.demo.ts |
| news:publicacion-4 | Jornada de capacitación a líderes comunales en mecanismos de control social bajo la Ley 850 | src/app/features/news/data/news.demo.ts |
| news:publicacion-5 | Seguimiento a la restitución de derechos y proyectos productivos en cuencas comunitarias | src/app/features/news/data/news.demo.ts |
| news:publicacion-6 | Balance de gestión semestral: Más de 34 casos acompañados en el Chocó y Urabá antioqueño | src/app/features/news/data/news.demo.ts |
| initiative:dulcemania | Dulcemanía: Alegría, Niñez y Escucha Territorial | src/app/features/initiatives/data/initiatives.demo.ts |
| initiative:navidad | Novenas Navideñas y Encuentro Comunitario | src/app/features/initiatives/data/initiatives.demo.ts |
| initiative:educacion | Jornadas de Útiles y Regreso a Clases con Dignidad | src/app/features/initiatives/data/initiatives.demo.ts |
| initiative:deporte | Torneos Relámpago y Lúdica para Jóvenes | src/app/features/initiatives/data/initiatives.demo.ts |

Las claves son referencias locales, no UUID de base de datos. Las apariciones del inicio no se fusionan automáticamente con los catálogos. Los textos, fechas, cifras y fotos conservan su procedencia de diseño y requieren validación. Los detalles, imágenes únicas y hashes de las fuentes están en [inventario.json](inventario.json).

Consultar [preparacion.md](preparacion.md) antes de diseñar la carga del backend.
