# Integración de formularios dinámicos

Actualizado: 11 de noviembre de 2026. El nombre histórico de este archivo se conserva para no romper enlaces, pero el módulo ya no es una demostración en memoria: consume la API de `apps.dynamic_forms`.

## Rutas

| Ámbito | Ruta | Función conectada |
|---|---|---|
| Administrador | `/admin/formularios` | Listado, filtros, ciclo de vida, duplicación y preparación de borrador. |
| Administrador | `/admin/formularios/nuevo` | Crear borrador. |
| Administrador | `/admin/formularios/:id/editar` | Editar con revisión optimista. |
| Administrador | `/admin/formularios/:id/vista-previa` | Probar el formulario sin enviar. |
| Administrador | `/admin/formularios/:id/respuestas` | Listar respuestas y exportar CSV. |
| Administrador | `/admin/formularios/:id/respuestas/:responseId` | Ver identidad, aceptación y respuestas. |
| Público | `/formularios/:slug` | Consultar y enviar un formulario publicado. |
| Público | `/activar-cuenta?token=...` | Establecer contraseña mediante token de un solo uso. |
| Ciudadano | `/ciudadano/formularios` | Consultar envíos vinculados. |
| Ciudadano | `/ciudadano/formularios/:id` | Consultar una respuesta propia. |

## Contrato aplicado

- Administración: `/api/v1/admin/forms/` y acciones `publish`, `close`, `reopen`, `archive`, `duplicate`, `versions/{n}/create-draft`, `submissions` y `submissions-export`.
- Público: `/api/v1/public/forms/{slug}/`, `submit/`, `activation/verify/` y `activation/resend/`.
- Ciudadano: `/api/v1/me/forms/submissions/` y detalle por UUID.
- El envío público incluye `Idempotency-Key`, identificación separada, versión legal y una respuesta tipada por pregunta.
- La autorización administrativa exige rol administrador y `can_manage_forms`.

## Seguridad y comportamiento

- La vista previa nunca llama al endpoint de envío.
- El cliente bloquea envíos duplicados y reutiliza la misma clave ante un intento cuya respuesta es incierta.
- La aceptación legal proviene del backend; sin política vigente la interfaz bloquea el envío.
- El mensaje final no revela si el correo ya pertenecía a una cuenta.
- La cuenta se activa fijando una contraseña mediante enlace; la contraseña no se envía por correo.
- El detalle ciudadano se obtiene únicamente del endpoint autenticado propio.

## Pendientes conocidos

- Exponer las preguntas congeladas de una versión histórica para previsualizar formularios sin borrador.
- Probar el recorrido completo contra el servidor con correo accesible y datos ficticios controlados.
- Confirmar que migraciones, política legal, formulario semilla y proveedor de correo están desplegados.

## Verificación

- Compilación de producción correcta.
- Suite HTTP aislada correcta para los siete tipos, envío, activación, consulta ciudadana y acciones administrativas.
- El servicio temporal y los modelos `.demo` fueron eliminados.
- El constructor permite configurar fechas mínima/máxima, expresión regular y mensaje personalizado. La vista previa y el envío validan estas reglas, además de longitudes, rangos numéricos y cantidades de selección.
- El 12 de noviembre de 2026 se comprobó que `censo-comunitario-meta` está publicado con versión activa y política legal. El envío se dejó pendiente hasta disponer de un buzón controlado para comprobar la recepción y activación sin crear registros basura.
