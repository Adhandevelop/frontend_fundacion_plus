# Información pública del caso

Ruta: `/casos/:radicado`. El caso de demostración está en `/casos/PLUS-2025-084`, enlazado desde la ficha de mapa y lista. Los demás radicados muestran un estado de caso no disponible, sin atribuirles los datos del ejemplo.

La pantalla comparte layout y selector de tema con el portal. Se divide en descripción, evidencias, línea de tiempo, resultados, participación y panel lateral. Los dos HTML recibidos son idénticos y contienen la variante oscura; la clara se adapta con la paleta institucional. Los estilos están limitados a `.public-case-page` para no modificar otras vistas.

El contenido se conserva como demostración visual, con aviso explícito de que no es un expediente real. Las fotografías mantienen los recursos externos del diseño.

El botón de compartir copia el enlace actual, con aviso si el navegador no permite acceder al portapapeles. El formulario reactivo valida entre 20 y 2000 caracteres y descarta aportes vacíos. No envía, guarda ni publica comentarios, ni simula una sesión autenticada. PDF y suscripción permanecen desactivados hasta contar con información y funcionalidades reales.

No se han definido contratos de API. Comprobar con `npm run build` y revisar en navegador los dos temas, escritorio/móvil, navegación desde el mapa, formulario y ruta de caso desconocido.
