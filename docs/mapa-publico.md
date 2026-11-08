# Mapa público

Ruta: `/mapa`. Se carga de forma diferida y comparte el encabezado, el pie y el tema persistente del portal público.

Los HTML de Stitch en claro y oscuro se integran en una única vista con estilos limitados a `.public-map-page`. La estructura se divide en filtros, lienzo ilustrativo y ficha de caso reutilizable en mapa y lista.

La vista incluye controles reactivos para territorio, naturaleza, categorías, estados y fechas. Restablecer restaura los valores iniciales del diseño; aplicar valida el orden de las fechas e informa que la consulta está pendiente de la API. No envía peticiones ni inventa contratos del backend.

La lista permite buscar por el texto del único caso de ejemplo. El mapa es el SVG del diseño, con cambio de paleta, acercamiento de la ilustración y apertura/cierre de la ficha. No representa cartografía real ni coordenadas verificadas. Los indicadores y marcadores son demostrativos. Las acciones de registro, PDF, detalle completo y capas permanecen desactivadas hasta disponer de sus pantallas o integraciones.

Comprobación: `npm run build`. Para revisar visualmente, ejecutar `npm start`, visitar `/mapa`, alternar el tema desde el encabezado y comprobar escritorio y móvil. La compilación no sustituye la revisión visual en un navegador.
