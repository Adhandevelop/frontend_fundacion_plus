# Contraste de la respuesta del backend sobre P01/P02/P15/P16

Revisión del 9 de noviembre de 2026. Se leyó el informe entregado por el backend y se contrastó con el código local y consultas públicas del servidor. No se modificó Django ni se hicieron escrituras de prueba.

| Punto | Evidencia revisada | Estado de esta revisión |
|---|---|---|
| P01 | Nueva revisión: ambas vistas ciudadanas ya usan `IsCitizenOnly` localmente. La prueba HTTPS posterior obtuvo 200 para administrador y ciudadano en las cuatro rutas de casos/dashboard, incluidos aliases. | Corregido localmente; exclusividad de rol todavía pendiente en producción. |
| P02 | Despliegue `db69f04`: 1 departamento (Meta), 29 municipios y 70 comunidades. | Disponibilidad comprobada; falta confirmar el alcance territorial institucional y validar relaciones. No repetir la carga a ciegas. |
| P15 | El permiso general de usuarios/roles ahora es exclusivo de administración. Hay `last_admin_lock` en las acciones específicas de rol y estado. La edición general sigue aceptando rol/estado sin esa protección visible en su serializer o `perform_update`. | Avance comprobado en código; revisar protección por PATCH/PUT general antes de dar por cerrado el punto completo. No se intentó bloquear una cuenta real. |
| P16 | Se observa eliminación del token de sesión al cambiar rol o estado, también en edición general. | Corrección presente en código. Su despliegue y la invalidación completa de access/refresh necesitan verificación independiente. |

El backend comunica doce pruebas correctas; esta revisión no ejecutó esas pruebas ni certifica que cubran todos los caminos anteriores. No se marca ningún punto como corregido en producción a partir de ese informe.

Al retomar integración hay que adaptar la interfaz a la nueva matriz: usuarios/roles y otros endpoints que reutilizan `IsAdminOrSuperAdmin` ya no admiten moderadores, ni siquiera en lectura. Los controles de comunidades y navegación deben ajustarse a sus permisos efectivos. Las acciones de casos deben seguir respetando sus permisos por actor y asignación.

**Actualización del frontend:** esta adaptación ya está aplicada en menú, guards de rutas y controles territoriales/de usuarios. Ver [permisos-navegacion-administrativa.md](permisos-navegacion-administrativa.md). Se verificó con HTTP simulado y Chrome local; no cambia el estado de los pendientes del servidor enumerados arriba.

**Documento de entrega vigente:** [problemas-integracion.md](problemas-integracion.md), actualizado con prioridades, estados y acciones concretas de los dieciséis puntos. Para enviar al backend, usar ese registro como principal y los enlaces de contenido inicial como adjuntos.

Solicitud concreta actualizada: verificar el despliegue de `IsCitizenOnly` sin restringir el perfil compartido `/me/`; aplicar protección del último administrador a todas las rutas admitidas o retirar rol/estado de edición general; verificar revocación de sesiones en la versión desplegada. La carga territorial ya está disponible: queda probar relaciones y radicación controlada, no solicitar que se vuelva a cargar como si siguiera vacía.
