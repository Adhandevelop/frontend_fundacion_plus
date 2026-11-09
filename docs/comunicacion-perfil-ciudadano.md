# Mensajes, notificaciones y perfil ciudadano

Rutas de demostración:

- `/ciudadano/mensajes`: bandeja, filtros y conversación vinculada al expediente. `caso` selecciona el radicado en la URL.
- `/ciudadano/notificaciones`: avisos con filtros por tipo y lectura, y acceso al caso o conversación relacionados.
- `/ciudadano/perfil`: edición de datos y preferencias locales, con fotografía opcional.

El layout ciudadano enlaza las tres páginas y muestra contadores sin leer y el nombre del perfil de ejemplo. No hay sesión, permisos, comunicaciones ni cambios reales de cuenta.

## Comunicación

Las conversaciones reutilizan el servicio y el componente de mensajes del expediente. Los mensajes escritos como administrador en la simulación aparecen en la bandeja ciudadana y generan avisos locales. Abrir una conversación marca como leídos los mensajes existentes del equipo; los nuevos mensajes tienen identificadores diferentes y vuelven a contarse. Los mensajes del ciudadano no se cuentan como recibidos sin leer.

Los avisos de seguimiento se generan a partir de los eventos visibles para el ciudadano. Las notas internas se excluyen mediante el mismo filtro del expediente. Marcar todos como leídos afecta solo al estado local; no solicita permisos de notificaciones del navegador ni activa servicios externos.

## Perfil

Nombre y correo son obligatorios. El teléfono opcional tiene validación de formato de demostración. Territorio y preferencias son editables, sin selector de roles ni acreditaciones. Guardar conserva únicamente una copia en memoria; descartar restaura la última copia local, y restablecer requiere confirmación.

La fotografía admite JPG o PNG de hasta 2 MB como límite local pendiente de contrato. La previsualización usa una URL de objeto del navegador. Se liberan las URLs de imágenes descartadas o reemplazadas; no hay carga al servidor. Cambiar correo no verifica direcciones ni modifica credenciales. Las preferencias no activan correos, WhatsApp, boletines o notificaciones push.

Toda la simulación se pierde al recargar. Antes de integrar datos reales se requieren los contratos de cuentas, pertenencia de casos, conversaciones, avisos y preferencias, con la autorización correspondiente en el backend.

Verificar con `npm run build` y revisar ambos temas y tamaños, búsquedas sin resultados, radicado desconocido en la bandeja, lectura de mensajes nuevos, filtros de avisos, formularios, fotografía, descarte y restablecimiento.

Se comprobó localmente la lectura de mensajes, la aparición de respuestas nuevas como no leídas, la lectura conjunta de mensajes/avisos, la exclusión de notas internas y códigos fuera del listado ciudadano, y el guardado/restablecimiento del perfil en memoria. Estas comprobaciones y la compilación no sustituyen la revisión visual en navegador.
