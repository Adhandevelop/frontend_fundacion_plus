# Informes administrativos de demostración

Ruta: `/admin/informes`, con acceso desde el menú administrativo y el dashboard.

## Organización

- `features/administration/reports`: vista, modelos de presentación, servicio local y componente de distribuciones.
- `AdminReportsDemoService` combina los ocho registros del diseño general con el estado temporal de `CaseWorkspaceDemoService`.
- `ReportDistributionComponent` presenta cantidades y porcentajes como texto y barras adaptables.
- `shared/utils/csv.ts` prepara CSV con BOM UTF-8, escape de comillas y neutralización de fórmulas en celdas de texto.

No se agregan dependencias ni contratos REST. Se reutilizan el layout administrativo, los enlaces al expediente y la paleta de ambos temas. Esta vista amplía el sistema visual existente; no se recibió un mockup específico de informes.

## Comportamiento

Permite buscar sin distinguir tildes y combinar filtros de territorio, categoría, gestión simulada, decisión de publicación y responsable. Restablecer devuelve la selección completa. Las opciones se calculan sobre todos los registros disponibles; los filtros no dependen de la paginación del módulo de casos.

Los indicadores, las distribuciones y la tabla se calculan exclusivamente sobre las filas filtradas. Los casos en gestión o por gestionar excluyen resueltos y cerrados; el contador de publicación pendiente es independiente de la gestión. Una selección sin resultados muestra indicadores en cero, distribuciones vacías, un mensaje y la opción de restablecer; desactiva la descarga.

Al cambiar responsables, gestión o publicación en un expediente de demostración y regresar al informe, sus datos reflejan el estado en memoria. Se identifica qué registros han cambiado durante esta sesión de la aplicación. Restablecer el expediente recupera su información inicial. Recargar pierde esos cambios.

## Descarga

El botón solicita descargar `plus-informe-DEMOSTRACION.csv` con todas las filas de la selección actual. Cada fila identifica el carácter demostrativo. Incluye código, título, territorio, categoría, fecha y estado originales del diseño, gestión y publicación simuladas, responsable y marca de cambio local.

No incluye conversaciones, descripciones de actuaciones, notas internas ni contenido de evidencias. No genera un informe oficial, PDF ni envíos. La URL temporal del archivo se libera después de solicitar la descarga.

Las fechas son los textos de los ejemplos recibidos. No se calculan tiempos de atención ni tendencias ni se ofrecen filtros de periodo sin una fuente de fechas definida.

## Verificación e integración pendiente

Compilación Angular de producción. Comprobaciones locales de filtros combinados, búsqueda sin tildes, cambio reactivo de responsable y publicación, suma de distribuciones, selección vacía y exportación limitada a filas y campos previstos. Se comprueba el escape CSV de comillas, saltos de línea y posibles fórmulas. Pendiente revisión visual y descarga en navegador en ambos temas y tamaños.

Antes de integrar backend: definir filtros admitidos, paginación, permisos para informes/exportaciones, estados canónicos, fechas y métricas; acordar si el archivo se genera en el servidor. El acceso de demostración actual no protege información administrativa real.
