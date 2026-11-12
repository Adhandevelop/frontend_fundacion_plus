# Problemas activos de integración PLUS

Actualizado: 12 de noviembre de 2026.

Este documento contiene únicamente problemas técnicos abiertos y comprobados. En este momento **no hay problemas activos reportados al backend**.

Los puntos P01–P21 se conservan en [correcciones-backend-historico.md](correcciones-backend-historico.md). Las funcionalidades que esperan adaptación o pruebas del frontend se registran en [estado-integracion-frontend-backend.md](estado-integracion-frontend-backend.md) y no deben presentarse como errores del backend.

## Resumen activo

| Prioridad | Punto | Problema | Acción requerida |
|---|---|---|---|
| — | — | No hay incidencias activas demostradas. | Continuar integración y pruebas funcionales. |

## Pendientes que no son errores del backend

- Desplegar y verificar en navegador la corrección de interoperabilidad de Leaflet; el build de producción local ya compila correctamente.
- Verificar contra el servidor desplegado los selectores y formularios multipart ya conectados: carga válida, formato inválido, archivo mayor de 15 MB y reemplazo de portada.
- Aprobar los textos, cifras e imágenes antes de ejecutar la carga editorial sin `--draft`.
- Realizar pruebas autenticadas controladas de permisos, revocación y último administrador.
- Probar el recorrido completo de formularios con correo y activación.
- Adaptar gradualmente Angular a auditoría paginada, historial de comentarios, dashboard por alcance y subrecursos de iniciativas.
- Probar P19 con contenido publicado; la colección pública estaba vacía durante la última verificación.
- Aclarar en el contrato del boletín el nombre/transporte del token y las respuestas de confirmación y baja antes de construir esas páginas.

Estos puntos son validación, contenido o trabajo del frontend. Solo se abrirá un problema nuevo si una prueba contra la versión desplegada demuestra una respuesta incorrecta del backend.
