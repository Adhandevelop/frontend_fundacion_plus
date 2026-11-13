# Mapa territorial

Rutas y consumo: `/mapa`, `/ciudadano/mapa`, `/admin/mapa` y la sección `#mapa-casos` de la página de inicio (`plus-case-map`). En todas las vistas se reutiliza el lienzo cartográfico `<plus-map-canvas>`, conservando el layout, navegación y permisos del contexto correspondiente.

El lienzo utiliza Leaflet 1.9.4 y los mosaicos estándar de OpenStreetMap. Abre centrado en Villavicencio, Meta, y ofrece controles para regresar a Villavicencio o mostrar un encuadre general aproximado del departamento. Este encuadre no pretende representar el límite administrativo oficial. La atribución de OpenStreetMap permanece visible.

## Encapsulación y dimensionamiento del lienzo

El componente `MapCanvasComponent` (`plus-map-canvas`) gestiona su propia hoja de estilos (`canvas.component.css`) y garantiza visualización autónoma en cualquier contenedor:
- `:host { display: block; width: 100%; }`.
- Altura base responsive (`520px` en escritorio, `420px` en dispositivos móviles).
- Parámetro opcional `@Input() mapHeight?: string` para adaptar la altura en vistas dedicadas (ej. `720px` en `/mapa`).
- Detección reactiva de cambios de dimensiones mediante `ResizeObserver` y ejecución controlada de `map.invalidateSize()` para asegurar la carga completa de mosaicos (*tiles*).
- Estilos globales en `styles.css` para etiquetas flotantes (`.plus-map-label`), controles de zoom y panel de atribución.

No se precargan ni descargan mosaicos para uso sin conexión. La URL del proveedor está concentrada en el componente para permitir sustituirla si el tráfico o las condiciones operativas requieren otro servicio. La disponibilidad del servidor público de mosaicos es de mejor esfuerzo y no tiene SLA.

El mapa y la sección cartográfica de la portada consultan `GET /api/v1/public/cases/geojson/`, validan la `FeatureCollection` y muestran únicamente puntos generalizados de casos aprobados. El encuadre se ajusta automáticamente a los resultados. La búsqueda textual de la vista completa se envía al servidor y la vista de lista reutiliza exactamente la misma colección recibida. Seleccionar un marcador muestra su resumen; el enlace al expediente conserva el contexto público o administrativo. En el contexto ciudadano no se fuerza una navegación hacia rutas administrativas ni hacia expedientes privados.

Los filtros cargan los catálogos oficiales de departamentos, municipios, comunidades, tipos y estados, y envían sus UUID al servidor. También filtran por naturaleza, prioridad y rango de radicación; no se filtra solamente la colección visible en Angular. No se derivan ni inventan coordenadas a partir del texto de un caso. Falta la acción ciudadana de seguimiento desde la ficha pública.

Comprobaciones realizadas: `npm run build`, `npm run test:api` y verificación de renderizado en Chrome de la página de inicio (`#mapa-casos`) y `/mapa`.
