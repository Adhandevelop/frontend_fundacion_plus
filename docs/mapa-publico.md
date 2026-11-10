# Mapa territorial

Rutas: `/mapa`, `/ciudadano/mapa` y `/admin/mapa`. Las tres cargan de forma diferida el mismo componente, pero conservan el layout, la navegación y los permisos del contexto actual.

El lienzo utiliza Leaflet 1.9.4 y los mosaicos estándar de OpenStreetMap. Abre centrado en Villavicencio, Meta, y ofrece controles para regresar a Villavicencio o mostrar un encuadre general aproximado del departamento. Este encuadre no pretende representar el límite administrativo oficial. La atribución de OpenStreetMap permanece visible.

No se precargan ni descargan mosaicos para uso sin conexión. La URL del proveedor está concentrada en el componente para permitir sustituirla si el tráfico o las condiciones operativas requieren otro servicio. La disponibilidad del servidor público de mosaicos es de mejor esfuerzo y no tiene SLA.

No se muestran marcadores, coordenadas, conteos ni indicadores ficticios. La lista permanece vacía hasta que el backend entregue casos con ubicación autorizada para publicación. Los filtros muestran Meta y varios municipios como presentación local, pero todavía no realizan peticiones.

La integración futura debe proporcionar una geometría GeoJSON o coordenadas verificadas, visibilidad pública explícita y alcance territorial. No se deben derivar ni inventar coordenadas a partir del texto de un caso.

Comprobaciones realizadas: `npm run build`, `npm run test:api` y revisión visual local en Chrome de `/mapa` a 1440 × 1200 píxeles.
