# Integración de informes y auditoría administrativa

Actualizado: 9 de noviembre de 2026. Cambios locales del frontend Angular, sin modificar Django, datos institucionales ni despliegue.

## Informes de casos

`/admin/informes` consulta `GET /api/v1/admin/reports/cases/`. Los indicadores y distribuciones usan `totals` de la selección completa; las filas usan `results`, `count`, `page` y `page_size`. No se calculan cifras globales a partir de una página ni se sustituyen respuestas vacías por ejemplos.

Filtros conectados: búsqueda, estado operativo, publicación, prioridad, tipo de caso y naturaleza. Estados y tipos se consultan en los catálogos públicos. Aplicar filtros reinicia la página; modificar el formulario sin aplicar conserva la selección anterior para la tabla y descarga. No se ofrecen fechas porque la implementación actual del informe no las procesa.

El botón CSV consulta `GET /api/v1/admin/reports/cases/export/` con la misma selección aplicada y sin parámetros de paginación. Descarga el archivo del servidor con autorización JWT; no genera un CSV a partir de las filas visibles. Se deshabilita ante carga, error, selección vacía o descarga en curso. El alcance de los expedientes y del archivo depende de los permisos del backend; representantes reciben los casos que su consulta autoriza.

## Auditoría reciente

`/admin/auditoria` consulta `GET /api/v1/admin/audit-events/`, con el parámetro `source` cuando se elige una fuente. El detalle usa `GET /api/v1/admin/audit-events/{event_ref}/`, codificando la referencia compuesta. No hay escrituras ni generación local de eventos.

La implementación revisada limita cada fuente a 100 registros y la respuesta combinada a 200. No hay paginación completa; `count` tampoco acredita el tamaño de todo el historial. La pantalla lo advierte expresamente, muestra cuántos registros recibió y pagina solo ese subconjunto. Búsqueda, acción, resultado, caso y fechas son filtros locales del subconjunto. El rango de fechas se interpreta en Bogotá, incluyendo los extremos del día. No se presentan como filtros exhaustivos de servidor.

El detalle muestra una lista permitida de metadatos estructurales. No vuelca objetos de antes/después, contraseñas, tokens, dirección IP o agente de navegador. La API todavía devuelve sus propias estructuras por fuente; esta restricción visual no sustituye la autorización y depuración que corresponden al servidor. Los enlaces a casos identificados apuntan exclusivamente al expediente administrativo.

## Verificación

- `npm run build`: compilación Angular de producción correcta.
- `npm run test:api`: cinco suites correctas. La nueva suite cubre agregados completos frente a una página, filtros aplicados frente a cambios pendientes, CSV sin paginación, carga/error/vacío, cancelación de consultas antiguas, alcance limitado de auditoría, fechas de Bogotá, metadatos permitidos y detalle codificado.
- Consultas HTTPS reales con la cuenta administrativa de pruebas: informe 200 con `kpis`, `totals`, `count`, `page`, `page_size`, `results`; selección vacía. Auditoría 200 y detalle por referencia compuesta 200. Solo se inspeccionaron estructuras y conteos; no se copiaron registros personales ni credenciales a documentos o pruebas.
- Las pruebas HTTP usan datos sintéticos en memoria. No se crearon casos, se publicaron contenidos ni se alteraron registros de auditoría. El inicio/cierre de la sesión de pruebas puede generar los registros de acceso habituales del backend.

Pendientes: historial exhaustivo y filtros de auditoría del servidor, validación de paginación de informes y prueba con casos reales autorizados. Ver P12 y P13 en [problemas-integracion.md](problemas-integracion.md). No hay verificación visual en navegador ni despliegue de estos cambios.
