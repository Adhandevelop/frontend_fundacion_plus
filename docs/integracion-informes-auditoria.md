# Integración de informes y auditoría administrativa

Actualizado: 12 de noviembre de 2026. Cambios locales del frontend Angular, sin modificar Django, datos institucionales ni despliegue.

## Informes de casos

`/admin/informes` consulta `GET /api/v1/admin/reports/cases/`. Los indicadores y distribuciones usan `totals` de la selección completa; las filas usan `results`, `count`, `page` y `page_size`. No se calculan cifras globales a partir de una página ni se sustituyen respuestas vacías por ejemplos.

Filtros conectados: búsqueda, estado operativo, publicación, prioridad, tipo de caso y naturaleza. Estados y tipos se consultan en los catálogos públicos. Aplicar filtros reinicia la página; modificar el formulario sin aplicar conserva la selección anterior para la tabla y descarga. No se ofrecen fechas porque la implementación actual del informe no las procesa.

El botón CSV consulta `GET /api/v1/admin/reports/cases/export/` con la misma selección aplicada y sin parámetros de paginación. Descarga el archivo del servidor con autorización JWT; no genera un CSV a partir de las filas visibles. Se deshabilita ante carga, error, selección vacía o descarga en curso. El alcance de los expedientes y del archivo depende de los permisos del backend; representantes reciben los casos que su consulta autoriza.

## Auditoría paginada

`/admin/auditoria` consulta `GET /api/v1/admin/audit-events/` con `page` y `page_size=25`. Envía al servidor los filtros de fuente, acción, resultado, caso y rango de fechas. Aplicar filtros reinicia la página y la navegación solicita cada página al backend. El detalle usa `GET /api/v1/admin/audit-events/{event_ref}/`, codificando la referencia compuesta. No hay escrituras ni generación local de eventos.

`count` determina el número total de páginas de la selección autorizada. La búsqueda de texto libre permanece como filtro de la página actual porque AUD-01 no documenta un parámetro `search`; la interfaz lo comunica expresamente. Las fechas se envían como `fecha_desde` y `fecha_hasta`, presentadas en hora de Bogotá.

El detalle muestra una lista permitida de metadatos estructurales. No vuelca objetos de antes/después, contraseñas, tokens, dirección IP o agente de navegador. La API todavía devuelve sus propias estructuras por fuente; esta restricción visual no sustituye la autorización y depuración que corresponden al servidor. Los enlaces a casos identificados apuntan exclusivamente al expediente administrativo.

## Verificación

- `npm run build`: compilación Angular de producción correcta.
- `npm run test:api`: trece suites correctas. La suite de informes y auditoría cubre agregados completos frente a una página, filtros aplicados, CSV sin paginación, paginación/filtros AUD-01, fechas de Bogotá, metadatos permitidos, cancelación de consultas antiguas y detalle codificado.
- Consultas HTTPS reales con la cuenta administrativa de pruebas: informe 200 con `kpis`, `totals`, `count`, `page`, `page_size`, `results`; selección vacía. Auditoría 200 y detalle por referencia compuesta 200. Solo se inspeccionaron estructuras y conteos; no se copiaron registros personales ni credenciales a documentos o pruebas.
- Las pruebas HTTP usan datos sintéticos en memoria. No se crearon casos, se publicaron contenidos ni se alteraron registros de auditoría. El inicio/cierre de la sesión de pruebas puede generar los registros de acceso habituales del backend.

Pendientes: prueba funcional de paginación y filtros con eventos reales autorizados y revisión visual en navegador. P12 está adaptado en Angular; P13 permanece cerrado en el histórico. No se desplegaron estos cambios desde esta sesión.
