# Revisión de pruebas del frontend PLUS — 14 de noviembre de 2026

## Resultado de la línea base local

- `npm run build`: correcto; Angular genera el paquete de producción sin errores.
- `npm run test:api`: correcto; pasan autenticación, casos ciudadanos y administrativos, mensajería, informes, auditoría, comentarios, territorios, usuarios, permisos, formularios dinámicos, portada, noticias, iniciativas, postulaciones y mapa.
- `npm run test:ui`: correcto en Chrome local con API sintética de solo lectura. Valida navegación por teclado, foco, restauración de desplazamiento, cambio de tamaño, enlaces de página actual, ancho de 360 px, campos en tema oscuro, errores asociados y separación de roles.
- La prueba visual ahora carga cinco casos cartográficos sintéticos. Comprueba que el carrusel muestre tres tarjetas completas a 800 px y una tarjeta completa a 360 px, que la flecha derecha produzca desplazamiento y que el mapa permanezca recortado dentro de la portada. Se añadieron capturas `home-map-carousel-tablet.png` y `home-map-carousel-mobile.png`.
- `npm run content:check`: inicialmente detectó el inventario generado desactualizado. Se ejecutó `npm run content:inventory` y la segunda validación fue correcta. Los 7 registros de noticias y 4 iniciativas del material histórico permanecen pendientes y bloqueados para publicación.

## Producción

Se intentó validar por HTTPS la portada y los endpoints públicos de inicio, sitio, GeoJSON, noticias, iniciativas y formularios. La conexión desde el entorno de ejecución agotó el tiempo de espera antes de obtener una respuesta. Este resultado no demuestra una indisponibilidad de `fundacionplus.site`; debe repetirse desde el servidor o desde un navegador con conectividad normal.

No se realizaron escrituras en producción, no se crearon cuentas o casos, no se enviaron formularios ni correos y no se cargaron archivos.

Durante la ampliación del arnés se distinguió el ancho visual real de las transformaciones internas de Leaflet: Chrome incluye mosaicos transformados en algunos cálculos de `scrollWidth` aunque estén recortados. El mapa quedó además aislado mediante contención y un envoltorio con `overflow: hidden`; las demás rutas conservan la comprobación estricta de desbordamiento del documento.

## Siguiente bloque

1. Ejecutar comprobaciones públicas desde el servidor y registrar códigos HTTP y esquemas básicos.
2. Probar en un teléfono real el punto azul del dispositivo y el marcador amarillo del caso.
3. Ejecutar el ciclo controlado de formularios y Resend con un buzón de prueba.
4. Probar cargas multipart de portada, noticias e iniciativas con archivos autorizados.
5. Completar una matriz de aceptación por rol con cuentas de prueba.
