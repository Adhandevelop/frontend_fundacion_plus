# Noticias y Nosotros públicos

Rutas: `/noticias` y `/nosotros`, cargadas de forma diferida dentro del layout público. Los enlaces del menú y los accesos relacionados del inicio conducen a estas páginas.

## Noticias

La vista conserva la cabecera editorial, destacado, cuadrícula, perfil/actividades del representante, redes y boletín del HTML suministrado. Los siete ejemplos principales se separan en `news.demo.ts`, como modelos de presentación que no definen la API.

La búsqueda ignora tildes; las categorías se obtienen de los ejemplos disponibles. El orden usa el orden cronológico de los registros del diseño, en ambas direcciones. No se inventan estadísticas de lectura, verificaciones ni las páginas adicionales del mockup.

Ver resumen abre el título, fecha, categoría y extracto ya proporcionados; no se inventa una noticia completa. Las descargas PDF y los perfiles externos permanecen pendientes hasta confirmar sus recursos y direcciones reales.

El boletín usa un formulario reactivo de nombre, correo y consentimiento. Valida localmente, sin enviar, guardar ni registrar suscripciones.

## Nosotros

La presentación se divide en componentes de hero, representante, identidad y estrategia, áreas e iniciativas, actividades y contacto. Se conservan fotografías y contenidos del diseño como ejemplos pendientes de validación institucional. Los datos de contacto del mockup no se consideran canales verificados ni se activan envíos externos.

Los dos HTML se recibieron en claro. Se añade la variante oscura con una paleta común limitada a `.editorial-page`, compartida por las dos páginas y sin alterar otras vistas. Se reutilizan encabezado, pie y selector de tema del portal.

Verificar con `npm run build` y revisar en navegador ambos temas, tamaños, navegación, búsqueda sin coincidencias, categorías, orden, apertura/cierre de resumen y validación del boletín.

Pendientes: contratos REST de noticias, contenidos institucionales confirmados, suscripciones, recursos PDF y destinos oficiales de redes/contacto.
