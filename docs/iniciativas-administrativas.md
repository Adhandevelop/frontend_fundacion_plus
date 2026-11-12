# Administración de iniciativas y ediciones

Actualizado: 11 de noviembre de 2026.

## Integrado con REST

- `/admin/iniciativas`: listado paginado desde `/api/v1/admin/initiatives/`, filtro de publicación en servidor y búsqueda local sobre la página recibida.
- `/admin/iniciativas/nueva` y `/admin/iniciativas/:id/editar`: creación y edición de título, subtítulo, categoría, descripciones y estado operativo.
- `/admin/iniciativas/:id`: ficha real, portada existente, contenido, estado operativo/editorial y ediciones anidadas.
- Transiciones confirmadas entre borrador, pendiente, publicada y rechazada, además del destacado de programas publicados.
- El `slug` lo genera Django y Angular lo trata como solo lectura.
- El guard administrativo conserva el módulo para administrador/moderador según la matriz vigente.

Las pruebas HTTP verifican paginación/filtro, payload de creación sin `slug` inventado y PATCH de publicación/destacado. No se realizaron escrituras en producción.

## Parcialmente integrado

Las ediciones recibidas dentro del detalle se muestran en lectura con año, nombre, temporada, estado y conteos de indicadores, comunidades y actividades. La ficha real no enlaza los editores locales antiguos para evitar mezclar UUID del backend con el almacenamiento demostrativo.

## Aún demostrativo

- Alta y edición de ediciones.
- Indicadores y sus metadatos.
- Cobertura/comunidades y observaciones.
- Actividades, responsables y ubicación.
- Vínculos con casos.
- Medios generales y por edición.
- Bandeja y decisión administrativa de postulaciones.

Las pantallas existentes de estos subrecursos siguen usando servicios locales. No deben interpretarse como datos guardados ni como publicación institucional.

## Pendientes del backend

El contrato permite CRUD por recursos, pero antes de completar el módulo deben aplicarse las garantías descritas en P19 y P20 de [problemas-integracion.md](problemas-integracion.md): proyección pública mínima, carga binaria segura, transiciones editoriales validadas, pertenencia estricta entre programa/edición/subrecurso y auditoría uniforme.

## Verificación

- `npm run build`: correcto.
- `npm run test:api`: correcto, incluida la suite pública y administrativa de iniciativas.
- `npm run content:check`: inventario editorial vigente.
- Pendientes: prueba con una cuenta controlada, revisión responsive/teclado y recorrido real crear → revisar → publicar → consultar en portal.
