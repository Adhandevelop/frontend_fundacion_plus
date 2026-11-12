# Inventario extraído del frontend

Generado por `npm run content:inventory`. No constituye aprobación editorial ni payload REST. Todos los elementos están pendientes y con publicación bloqueada en este inventario.

- news_catalog: 7
- initiative_catalog: 4
- home_news: 3
- home_initiative_panels: 4
- unique_image_urls: 16
- template_sources: 11

## Textos para revisar

| Clave de revisión | Título original | Fuente |
|---|---|---|
| news:publicacion-0 | Luis Alberto Muñoz Granada lidera mesa técnica interinstitucional para seguimiento a compromisos viales y de salud en el Atrato | src/app/features/news/data/news.demo.ts |
| news:publicacion-1 | Veeduría ciudadana verifica avance del 78% en obras de acueducto rural en Carmen del Darién | src/app/features/news/data/news.demo.ts |
| news:publicacion-2 | Luis Alberto Muñoz Granada participa en el Encuentro Regional de Veedurías y Transparencia Pública | src/app/features/news/data/news.demo.ts |
| news:publicacion-3 | PLUS radica informe de alertas tempranas ante la Procuraduría y Defensoría por obras inconclusas | src/app/features/news/data/news.demo.ts |
| news:publicacion-4 | Jornada de capacitación a líderes comunales en mecanismos de control social bajo la Ley 850 | src/app/features/news/data/news.demo.ts |
| news:publicacion-5 | Seguimiento a la restitución de derechos y proyectos productivos en cuencas comunitarias | src/app/features/news/data/news.demo.ts |
| news:publicacion-6 | Balance de gestión semestral: Más de 34 casos acompañados en el Chocó y Urabá antioqueño | src/app/features/news/data/news.demo.ts |
| initiative:dulcemania | Dulcemanía: Alegría, Niñez y Escucha Territorial | src/app/features/initiatives/data/initiatives.demo.ts |
| initiative:navidad | Novenas Navideñas y Encuentro Comunitario | src/app/features/initiatives/data/initiatives.demo.ts |
| initiative:educacion | Jornadas de Útiles y Regreso a Clases con Dignidad | src/app/features/initiatives/data/initiatives.demo.ts |
| initiative:deporte | Torneos Relámpago y Lúdica para Jóvenes | src/app/features/initiatives/data/initiatives.demo.ts |
| home-news:0 | Instalación de la Veeduría Veredal para el Acueducto Comunitario | src/app/features/home/components/news/news.component.html |
| home-news:1 | Informe de auditoría ciudadana sobre puentes peatonales | src/app/features/home/components/news/news.component.html |
| home-news:2 | Capacitación en derechos de petición y acceso a la información | src/app/features/home/components/news/news.component.html |
| home-initiative-panel-0 | Dulcemanía y Presencia Barrial: Alegría, Niñez y Escucha Ciudadana | src/app/features/home/components/initiatives/initiatives.component.html |
| home-initiative-panel-1 | Novenas Navideñas y Olla Comunitaria en Territorio | src/app/features/home/components/initiatives/initiatives.component.html |
| home-initiative-panel-2 | Kits Escolares y Regreso Digno a Clases en Cuencas Fluviales | src/app/features/home/components/initiatives/initiatives.component.html |
| home-initiative-panel-3 | Torneos por la Convivencia y Lúdica Juvenil en los Barrios | src/app/features/home/components/initiatives/initiatives.component.html |

Las claves son referencias locales, no UUID de base de datos. Las apariciones del inicio no se fusionan automáticamente con los catálogos. Los textos, fechas, cifras y fotos conservan su procedencia de diseño y requieren validación. Los detalles, imágenes únicas y hashes de las fuentes están en [inventario.json](inventario.json).

Consultar [preparacion.md](preparacion.md) antes de diseñar la carga del backend.
