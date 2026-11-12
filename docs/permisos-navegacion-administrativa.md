# Navegación administrativa según la nueva matriz de roles

Actualizado: 11 de noviembre de 2026. Adapta el frontend al código de permisos del backend revisado después de su informe de correcciones. No certifica despliegue ni cierra P01/P02/P15/P16.

## Acceso a las vistas

| Sección | Administrador | Moderador | Representante |
|---|---|---|---|
| Dashboard, casos, informes, perfil administrativo | Sí | Sí | Sí |
| Usuarios y catálogo de roles | Sí | No | No |
| Comunidades y territorio | Sí | No | No |
| Auditoría | Sí | No | No |
| Formularios | Solo con `can_manage_forms` | No | No |
| Fotografía principal | Solo con `can_manage_homepage` | No | No |
| Moderación de comentarios | Sí | Sí | No |
| Noticias, iniciativas y postulaciones administrativas | Sí | Sí | No |

Las vistas administrativas de noticias, iniciativas y postulaciones mantienen sus datos de demostración; aplicarles estos límites no las conecta a REST. El mapa y el portal públicos conservan su acceso público. Ningún rol interno obtiene acceso al portal ciudadano; el ciudadano tampoco accede al portal administrativo.

La política `core/auth/admin-access.policy.ts` exige cuenta activa, capacidades administrativas reconocidas y rol permitido para la sección. Formularios y portada comprueban además sus capacidades explícitas entregadas por `/me/`. Una sección desconocida se deniega. El menú filtra sus enlaces mediante esa política; cada ruta administrativa declara `data.adminSection`. `accountGuard`, ejecutado también para hijos, comprueba todos los requisitos de sus ancestros. No basta con ocultar un enlace: escribir la URL, recargar o enlazar directamente a un editor también debe superar el guard.

El perfil propio sigue en `/admin/perfil` para los tres roles internos. No se redirige a `/ciudadano/perfil`. Se actualizan además los controles de gestión territorial y usuarios para utilizar la misma política; los moderadores ya no tienen consulta de esos módulos.

## Acciones sobre casos

Se conserva `allowed_actions` del expediente como autoridad para los controles del caso. El frontend no concede asignación, seguimiento o resolución únicamente por mostrar el enlace de casos. El código del backend revisado diferencia administración, moderación y representación con asignación activa. Una denegación de API sigue tratándose como error; Angular no sustituye la autorización del servidor.

## Verificación

- `npm run test:api`: once suites. La prueba de acceso cubre todas las rutas administrativas declaradas y cada rol, incluidos ciudadano, rol desconocido, cuenta suspendida, capacidades específicas ausentes, metadatos desconocidos y restricciones de ancestros.
- Chrome local, API simulada: menús exactos de moderador y representante, perfil dentro del portal administrativo y rutas directas denegadas de usuarios, comunidades, comentarios y auditoría. Se comprueba que no se solicite la API protegida al rechazar una ruta. También se verifican los cruces ciudadano→administración y administración→perfil ciudadano.
- La compilación Angular de producción pasa. No se ejecutaron escrituras en producción ni se probaron cambios de rol/estado sobre cuentas reales.

Pendiente: confirmar despliegue y correcciones del backend indicadas en [revision-correcciones-prioritarias.md](revision-correcciones-prioritarias.md), después repetir la matriz contra cuentas reales de prueba. El perfil en memoria se actualiza al recuperar sesión o consultar `/me/`; los cambios remotos de rol dependen de la revocación de sesión pendiente de verificar en P16.
