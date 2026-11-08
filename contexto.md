# CONTEXTO GENERAL DEL PROYECTO
## Plataforma Web PLUS — Corporación Pluralismo Social

**Nombre del proyecto:** Desarrollo de la Plataforma Web PLUS

**Institución:** Corporación Pluralismo Social (PLUS)

**Representante:** Luis Alberto Muñoz Granada

**Tipo de proyecto:** Plataforma web institucional para participación ciudadana, gestión de casos comunitarios, georreferenciación, seguimiento social y divulgación de iniciativas.

**Estado actual:** Etapa de diseño, modelado de datos, definición de arquitectura e inicio del desarrollo.

**Tecnologías principales:**
- Frontend: Angular, TypeScript y Tailwind CSS.
- Backend: Python, Django y Django REST Framework.
- Base de datos: PostgreSQL con extensión PostGIS.
- Cartografía: Leaflet y OpenStreetMap.
- Comunicación: API REST.
- Autenticación: JWT y control de acceso basado en roles.

---

# 1. DESCRIPCIÓN GENERAL

PLUS es una plataforma web desarrollada para la Corporación Pluralismo Social, una organización orientada al trabajo comunitario, la participación ciudadana, la veeduría social y el acompañamiento de las comunidades.

El proyecto busca centralizar en una sola plataforma la información institucional de la fundación, las problemáticas reportadas por los ciudadanos, el seguimiento de los casos comunitarios, las iniciativas sociales realizadas y las noticias relevantes.

La plataforma tendrá dos grandes propósitos:

**Propósito institucional:** Dar visibilidad a la Corporación Pluralismo Social, su representante Luis Alberto Muñoz Granada, su trabajo territorial, sus iniciativas comunitarias y sus actividades.

**Propósito operativo:** Permitir que los ciudadanos registren situaciones o problemáticas de sus comunidades, consulten su evolución, aporten información y reciban retroalimentación de los responsables de PLUS.

La característica principal será un mapa interactivo que permitirá visualizar geográficamente los casos comunitarios que hayan sido revisados y aprobados para publicación.

La plataforma también contará con un sistema administrativo para gestionar usuarios, casos, responsables, comunidades, noticias, iniciativas y registros de auditoría.

El alcance geográfico inicial será de varios municipios y comunidades de un departamento, con una arquitectura que permita ampliarlo posteriormente.

# 2. ESTRUCTURA GENERAL

La plataforma estará dividida en tres áreas funcionales.

## 2.1. Portal público

Accesible sin autenticación.

Permitirá:
- Conocer la fundación y su representante.
- Explorar el mapa interactivo.
- Consultar casos comunitarios publicados.
- Revisar el detalle público de cada caso.
- Consultar iniciativas comunitarias.
- Explorar galerías fotográficas y resultados de actividades.
- Leer noticias institucionales.
- Acceder a redes sociales y medios de contacto.
- Registrarse o iniciar sesión.

## 2.2. Portal ciudadano

Accesible para usuarios registrados.

Permitirá:
- Consultar un panel personal.
- Registrar nuevos casos.
- Seleccionar la ubicación geográfica del caso.
- Adjuntar evidencias y documentos.
- Consultar los casos propios.
- Revisar estados y avances.
- Enviar información adicional.
- Comunicarse mediante mensajes privados con los responsables autorizados.
- Participar mediante comentarios públicos sujetos a moderación.
- Recibir notificaciones.
- Actualizar el perfil personal.

## 2.3. Panel administrativo

Accesible únicamente al personal autorizado de PLUS.

Permitirá:
- Administrar usuarios y permisos.
- Revisar casos nuevos.
- Aprobar o rechazar publicaciones.
- Asignar responsables.
- Registrar avances y resultados.
- Gestionar municipios y comunidades.
- Administrar iniciativas comunitarias.
- Crear jornadas y registrar resultados.
- Administrar fotografías y contenido multimedia.
- Crear y publicar noticias.
- Moderar comentarios.
- Consultar indicadores.
- Revisar registros de auditoría.
- Administrar parámetros institucionales.

# 3. DISEÑO DE LA PÁGINA PRINCIPAL

La página principal será la presentación institucional de PLUS y el punto de acceso a las funcionalidades principales.

Debe mantener la siguiente estructura:

## 3.1. Barra de navegación

Incluirá:
- Logo institucional de PLUS.
- Inicio.
- Mapa de casos.
- Iniciativas.
- Noticias.
- Nosotros.
- Contacto.
- Iniciar sesión.
- Registrarse.
- Selector de tema claro y oscuro.

La navegación será adaptable a dispositivos móviles.

## 3.2. Presentación institucional

Sección principal tipo Hero, dividida en dos columnas.

**Columna izquierda:**
- Fotografía del representante.
- Nombre: Luis Alberto Muñoz Granada.
- Cargo o representación institucional.
- Información institucional autorizada.

**Columna derecha:**
- Nombre de la Corporación Pluralismo Social.
- Presentación de PLUS.
- Misión y propósito.
- Indicadores institucionales.
- Botones para explorar casos y conocer la fundación.

Los indicadores deberán obtenerse de información real y validada.

## 3.3. Mapa interactivo de casos

Será uno de los componentes centrales del inicio.

Contendrá:
- Mapa geográfico interactivo.
- Marcadores de casos aprobados.
- Agrupación de marcadores cercanos.
- Filtro por municipio.
- Filtro por comunidad o vereda.
- Filtro por categoría.
- Filtro por estado.
- Resumen de casos al seleccionar un marcador.
- Acceso al detalle completo mediante «Ver más».
- Botón para registrar un nuevo caso.

Los casos no aprobados no aparecerán públicamente.

El mapa utilizará coordenadas geográficas almacenadas en PostgreSQL/PostGIS.

## 3.4. Iniciativas Comunitarias

Sección incorporada recientemente.

Su objetivo es mostrar el trabajo comunitario de PLUS mediante un carrusel de iniciativas destacadas.

Cada iniciativa podrá presentar:
- Nombre.
- Categoría o temporada.
- Título destacado.
- Descripción resumida.
- Fotografía principal.
- Indicadores de impacto.
- Comunidades beneficiadas.
- Resultados relevantes.
- Acceso a galería fotográfica.
- Botón para consultar el detalle.
- Acciones relacionadas, cuando correspondan.

Ejemplos de iniciativas contempladas en el diseño:
- Dulcemanía.
- Novenas y Navidad Comunitaria.
- Jornadas de útiles escolares.
- Encuentros deportivos y lúdica juvenil.

Estas iniciativas serán registros dinámicos, no elementos fijos en el código.

## 3.5. Noticias y redes sociales

Sección dividida en dos columnas.

**Noticias:**
- Publicaciones recientes.
- Imagen.
- Categoría.
- Fecha.
- Título.
- Resumen.
- Enlace al artículo completo.

**Redes sociales:**
- Canales institucionales.
- Enlaces a perfiles oficiales.
- Publicaciones o comunicados destacados cuando exista integración.
- Canal comunitario de contacto.

## 3.6. Pie de página

Incluirá:
- Identidad institucional.
- Descripción de PLUS.
- Información de contacto.
- Redes sociales.
- Políticas de privacidad.
- Tratamiento de datos.
- Términos y condiciones.
- Información institucional verificada.

# 4. MÓDULO DE GESTIÓN DE CASOS

Es el núcleo operativo de la plataforma.

## 4.1. Registro de casos

Un ciudadano autenticado podrá registrar una situación comunitaria.

El formulario incluirá:
- Título.
- Descripción.
- Categoría.
- Municipio.
- Comunidad o vereda.
- Ubicación geográfica.
- Archivos y evidencias.
- Información complementaria.

Al registrarse, el sistema generará un identificador único de radicación.

## 4.2. Revisión y aprobación

Los casos ingresarán inicialmente como pendientes de revisión.

Un administrador autorizado podrá:
- Revisar la información.
- Solicitar correcciones.
- Aprobar.
- Rechazar justificadamente.
- Asignar responsables.

Solamente los casos aprobados para publicación podrán visualizarse en el mapa público.

La aprobación de publicación será independiente del estado de gestión.

## 4.3. Estados de gestión

Se contemplan:
- Recibido.
- Asignado.
- En gestión.
- Resuelto.
- Cerrado.

El estado de moderación será independiente:
- Pendiente.
- Aprobado.
- Rechazado.

## 4.4. Seguimiento

Cada caso tendrá:
- Historial cronológico.
- Cambios de estado.
- Responsable asignado.
- Actualizaciones.
- Evidencias.
- Observaciones.
- Fechas relevantes.
- Resultado final.

El ciudadano podrá consultar los avances autorizados de sus casos.

## 4.5. Comunicación

Existirán dos mecanismos diferenciados:

**Mensajes privados:** Entre el ciudadano y el personal autorizado que gestione el caso.

**Comentarios públicos:** Visibles solamente después de pasar por un proceso de moderación.

Los mensajes privados nunca se publicarán automáticamente.

## 4.6. Detalle público del caso

Contendrá:
- Código de radicación.
- Título.
- Categoría.
- Municipio o comunidad.
- Resumen público.
- Estado actual.
- Fecha de actualización.
- Historial público de avances.
- Evidencias autorizadas para publicación.

No mostrará datos personales sensibles ni información reservada.

# 5. MÓDULO DE MAPA GEOGRÁFICO

Se desarrollará mediante Leaflet, OpenStreetMap y PostGIS.

El backend proporcionará los casos georreferenciados mediante endpoints REST.

El frontend representará los casos utilizando marcadores o agrupaciones.

Funciones:
- Navegación geográfica.
- Zoom.
- Marcadores interactivos.
- Agrupación de casos.
- Filtros.
- Popups informativos.
- Navegación al detalle.
- Actualización de resultados según filtros.

Los colores de los marcadores representarán estados funcionales y serán independientes de la identidad visual institucional.

Se deberá evitar revelar ubicaciones precisas cuando representen riesgos de privacidad o seguridad.

# 6. MÓDULO DE INICIATIVAS COMUNITARIAS

Este módulo permitirá registrar y divulgar programas, campañas y actividades sociales de la fundación.

Se distinguirán tres conceptos:

**Iniciativa:** Programa o campaña general, por ejemplo Dulcemanía.

**Jornada:** Actividad específica de una iniciativa, realizada en una fecha y comunidad determinadas.

**Noticia:** Publicación informativa que puede comunicar los resultados de una iniciativa o jornada.

## 6.1. Información de una iniciativa

- Identificador.
- Nombre.
- Slug para URL.
- Descripción corta.
- Contenido completo.
- Categoría.
- Imagen principal.
- Estado de publicación.
- Indicador de destacada.
- Orden de visualización.
- Fechas relevantes.
- Usuario creador.
- Fechas de creación y actualización.

## 6.2. Jornadas

Cada iniciativa podrá tener múltiples jornadas.

Cada jornada podrá registrar:
- Nombre.
- Descripción.
- Fecha.
- Municipio.
- Comunidad.
- Lugar.
- Ubicación geográfica, cuando corresponda.
- Actividades realizadas.
- Resultados.
- Evidencias.

## 6.3. Galería multimedia

Se podrán asociar fotografías y otros archivos multimedia a iniciativas y jornadas.

Los archivos tendrán metadatos, descripciones y controles de publicación.

## 6.4. Indicadores

Cada iniciativa podrá presentar indicadores dinámicos, como:
- Personas beneficiadas.
- Familias participantes.
- Comunidades visitadas.
- Jornadas realizadas.
- Materiales entregados.

Los indicadores deberán configurarse según la naturaleza de cada iniciativa y basarse en información validada.

## 6.5. Página pública de iniciativas

Tendrá un catálogo con:
- Buscador.
- Filtros.
- Tarjetas.
- Fotografías.
- Categorías.
- Acceso a detalles.

## 6.6. Página de detalle

Mostrará:
- Encabezado de iniciativa.
- Descripción completa.
- Objetivos.
- Jornadas realizadas.
- Resultados.
- Indicadores.
- Galería.
- Comunidades relacionadas.
- Contenido adicional autorizado.

## 6.7. Administración

Los administradores o editores autorizados podrán:
- Crear iniciativas.
- Editar.
- Publicar.
- Despublicar.
- Destacar en el inicio.
- Gestionar jornadas.
- Subir fotografías.
- Registrar indicadores.
- Organizar el orden de aparición.

# 7. MÓDULO DE NOTICIAS

La plataforma tendrá un sistema propio de publicaciones institucionales.

Cada noticia incluirá:
- Título.
- Slug.
- Resumen.
- Contenido.
- Imagen.
- Categoría.
- Autor.
- Estado de publicación.
- Fecha de publicación.

Los editores podrán crear, modificar y publicar noticias.

Las noticias recientes aparecerán en el inicio y cada publicación tendrá su propia página.

# 8. USUARIOS, ROLES Y PERMISOS

Se contemplan los siguientes perfiles:

**Visitante:** Explora contenido público.

**Ciudadano:** Registra casos y consulta su información.

**Responsable:** Gestiona los casos que le sean asignados.

**Editor institucional:** Gestiona noticias e iniciativas según permisos.

**Administrador:** Supervisa casos, usuarios, territorios y contenidos.

**Superadministrador:** Administra configuración y permisos globales.

El sistema debe implementar autorización en el backend y no depender exclusivamente de restricciones visuales del frontend.

Los responsables podrán asociarse a comunidades o categorías de casos.

# 9. BASE DE DATOS

Se utilizará PostgreSQL con PostGIS.

La estructura funcional propuesta contempla inicialmente las siguientes tablas, sujetas a validación durante el modelado definitivo.

**Identidad:**
- users
- roles
- user_roles
- user_profiles

**Territorios:**
- departments
- municipalities
- communities

**Casos:**
- case_categories
- cases
- case_assignments
- case_updates
- case_evidence
- case_comments
- case_messages

**Iniciativas:**
- initiatives
- initiative_activities
- initiative_media
- initiative_metrics

**Noticias:**
- news_categories
- news_articles

**Comunicación:**
- notifications
- event_proposals

**Auditoría:**
- audit_logs
- case_status_history

**Configuración:**
- social_links
- site_settings

Estas 26 tablas constituyen una propuesta de organización funcional, no un esquema SQL definitivo.

Se deberán definir claves primarias, claves foráneas, índices, restricciones, cardinalidades, integridad referencial y campos de auditoría.

Las relaciones principales serán:
- Un usuario puede registrar múltiples casos.
- Una comunidad puede tener múltiples casos.
- Un caso puede tener múltiples actualizaciones.
- Un caso puede tener múltiples evidencias.
- Un caso puede tener asignaciones e historial.
- Una iniciativa puede tener múltiples jornadas.
- Una iniciativa puede tener múltiples archivos multimedia.
- Una iniciativa puede tener múltiples indicadores.
- Una jornada puede asociarse a una comunidad.
- Un usuario autorizado puede crear múltiples publicaciones.
- Las acciones administrativas relevantes deben registrarse en auditoría.

# 10. ARQUITECTURA BACKEND

Se utilizará Django y Django REST Framework mediante una arquitectura monolítica modular.

Aplicaciones propuestas:
- accounts
- territories
- cases
- tracking
- initiatives
- news
- communications
- notifications
- audit

Cada aplicación deberá organizar:
- Modelos.
- Serializers.
- Vistas o ViewSets.
- Rutas.
- Permisos.
- Servicios.
- Validaciones.
- Pruebas.

La API tendrá versionado, inicialmente `/api/v1/`.

Se implementarán autenticación JWT, validación de permisos, paginación, filtros y documentación OpenAPI.

Los endpoints públicos y privados deberán estar claramente diferenciados.

Los archivos se almacenarán en un sistema de almacenamiento apropiado, conservando en PostgreSQL sus referencias y metadatos.

# 11. ARQUITECTURA FRONTEND

Se utilizará Angular con TypeScript y Tailwind CSS.

La aplicación deberá organizarse mediante módulos funcionales o funcionalidades independientes.

Estructura propuesta:
- core
- shared
- layouts
- features/home
- features/auth
- features/cases
- features/map
- features/initiatives
- features/news
- features/citizen
- features/administration

Se implementarán:
- Componentes reutilizables.
- Enrutamiento.
- Guards de autenticación.
- Interceptores HTTP.
- Servicios para consumir la API.
- Formularios reactivos.
- Manejo de errores.
- Estados de carga.
- Paginación.
- Filtros.
- Diseño responsive.
- Temas claro y oscuro.

Los diseños HTML de Google Stitch se utilizarán como referencia visual y deberán transformarse en componentes Angular mantenibles.

No se debe depender de datos estáticos para los módulos dinámicos.

# 12. IDENTIDAD VISUAL

La identidad visual de PLUS utilizará principalmente amarillo, blanco, negro y gris.

**Tema claro:**
- Fondos blancos y grises claros.
- Amarillo institucional para elementos destacados.
- Texto oscuro.
- Tarjetas claras.

**Tema oscuro:**
- Fondos negros o grises oscuros.
- Amarillo institucional.
- Texto claro.
- Tarjetas oscuras.

Los colores funcionales de estados, errores, aprobaciones y advertencias serán independientes de la identidad institucional.

La interfaz debe conservar coherencia visual entre el portal público, el portal ciudadano y la administración.

# 13. SEGURIDAD Y PRIVACIDAD

Se deberán implementar:
- Autenticación segura.
- Autorización por roles.
- Protección de endpoints.
- Validación de entradas.
- Protección de archivos privados.
- Restricciones de carga de archivos.
- Moderación de contenido público.
- Auditoría de acciones administrativas.
- Manejo seguro de credenciales.
- Protección de datos personales.
- Copias de seguridad.
- Registro de errores.

La publicación de fotografías, especialmente de menores de edad, requerirá los controles y autorizaciones correspondientes.

La plataforma deberá contemplar la normativa colombiana aplicable en materia de protección de datos personales.

# 14. PRIORIDADES DE DESARROLLO

El desarrollo se organizará por etapas.

**Etapa 1 — Fundamentos**
- Configuración Angular y Django.
- PostgreSQL/PostGIS.
- Autenticación.
- Usuarios y roles.
- Componentes base.

**Etapa 2 — Casos**
- Registro.
- Revisión.
- Aprobación.
- Asignación.
- Seguimiento.
- Evidencias.

**Etapa 3 — Mapa**
- Integración Leaflet.
- Consulta geográfica.
- Marcadores.
- Filtros.
- Detalles públicos.

**Etapa 4 — Iniciativas**
- CRUD.
- Jornadas.
- Fotografías.
- Indicadores.
- Carrusel.
- Páginas públicas.

**Etapa 5 — Contenido institucional**
- Noticias.
- Presentación institucional.
- Redes sociales.
- Contacto.

**Etapa 6 — Finalización**
- Pruebas.
- Seguridad.
- Auditoría.
- Despliegue.
- Documentación.

# 15. CRITERIOS GENERALES DE DESARROLLO

Todo el desarrollo deberá cumplir estas condiciones:

1. Respetar las tecnologías seleccionadas.
2. Mantener una arquitectura modular.
3. Evitar duplicación innecesaria de código.
4. Separar la lógica de negocio de la presentación.
5. Mantener coherencia entre modelos, API y frontend.
6. Aplicar permisos y validaciones en el backend.
7. Diseñar para futuras ampliaciones territoriales.
8. Utilizar datos reales obtenidos desde la API en los módulos dinámicos.
9. Registrar acciones administrativas relevantes.
10. Mantener el proyecto documentado.
11. Evitar agregar funcionalidades no aprobadas.
12. Conservar la identidad visual de PLUS.
13. Priorizar el módulo de casos y el mapa.
14. Incorporar iniciativas como un módulo independiente y reutilizable.
15. Garantizar que la información privada no se exponga en las vistas públicas.

# 16. OBJETIVO FINAL

El resultado esperado es una plataforma web funcional, segura, escalable y administrable que permita a la Corporación Pluralismo Social fortalecer su presencia institucional, visibilizar su trabajo comunitario y gestionar de manera organizada las situaciones reportadas por los ciudadanos.

PLUS deberá conectar tres elementos fundamentales:

**Participación ciudadana:** Las comunidades registran y consultan sus situaciones.

**Gestión y transparencia:** La fundación revisa, administra, documenta y da seguimiento a los casos.

**Impacto institucional:** La plataforma divulga iniciativas, jornadas, noticias y resultados del trabajo comunitario.

El sistema debe desarrollarse progresivamente, con una base técnica sólida y componentes que puedan mantenerse y ampliarse posteriormente.

---

**FIN DEL CONTEXTO GENERAL DEL PROYECTO PLUS.**