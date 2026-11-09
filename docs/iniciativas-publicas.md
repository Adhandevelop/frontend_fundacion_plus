# Iniciativas públicas

Ruta `/iniciativas`, con carga diferida y el layout público compartido. El menú y el carrusel de inicio conducen al módulo. Los accesos de participación del carrusel apuntan al formulario de postulación dentro de la página.

Se conserva el hero con indicadores, los filtros, el bloque extenso de Dulcemanía, las tres tarjetas de calendario y la convocatoria del diseño. La implementación separa hero, destacada, tarjeta reutilizable y participación. El HTML se recibió en claro y se añade oscuro con estilos limitados a `.initiatives-page`.

Los cuatro ejemplos están separados en `initiatives.demo.ts` como modelos de presentación, no contratos REST. Los filtros de categoría, edición y búsqueda se aplican a esos registros. Solo hay ejemplos de 2025; las otras ediciones pueden mostrar un estado vacío. No se inventan registros históricos.

La galería abre la única imagen proporcionada para cada iniciativa, con su título y cierre. No se añaden fotos inexistentes. El PDF permanece desactivado porque el archivo no se ha proporcionado.

La postulación usa un formulario reactivo con campos requeridos y validación local de teléfono y descripción. Se elimina la alerta de recepción exitosa del HTML: no hay peticiones HTTP, postulaciones registradas, envíos de mensajes, datos guardados ni equipos notificados.

Indicadores, fotografías, hallazgos y convocatorias son ejemplos del mockup pendientes de confirmación institucional. La integración requiere definir iniciativas, jornadas, medios, indicadores y contratos de postulación con el backend.

Comprobar con `npm run build` y revisar en navegador ambos temas, móvil/escritorio, navegación, filtros, edición sin resultados, imagen y validación de postulación.
