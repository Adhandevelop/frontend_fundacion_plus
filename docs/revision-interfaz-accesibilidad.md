# Revisión independiente de interfaz y navegación

Fecha: 9 de noviembre de 2026. Trabajo de frontend mientras el backend atiende P01, P02, P15 y P16. No añade integraciones REST ni modifica contratos, cuentas, casos o contenido institucional.

## Cambios

- Menú administrativo móvil: `aria-controls` apunta al panel correcto, botón de cierre dentro del panel, Escape, foco inicial, recorrido circular con Tab/Mayús+Tab y devolución del foco al botón. Mientras está abierto, el contenido de fondo queda `inert` y se bloquea el desplazamiento del documento. Al pasar a escritorio o destruir el layout se restauran esos estados.
- Navegación ciudadana móvil: mantiene su comportamiento de panel integrado en la página, sin convertirlo en modal. Al abrirlo se enfoca su primer enlace; Escape lo cierra y devuelve el foco.
- Enlaces para saltar al contenido en ambos portales, destinos enfocables y foco en el contenido al activar una nueva vista. Los enlaces activos anuncian `aria-current="page"`.
- Borde de foco amarillo en tema oscuro; los campos inválidos administrativos usan un borde claro en ese tema. Campos administrativos de 16 px y botones de al menos 44 px de altura. Se corrigieron los selectores de los componentes de usuario renombrados durante la integración para que sigan siendo bloques sin desbordamiento.
- Iconos SVG locales para navegación administrativa, cambio de tema y perfil vacío. Se mantienen sus etiquetas de texto/ARIA; estos iconos ya no dependen de descargar Material Symbols desde una CDN. Los otros iconos/fuentes del sitio conservan su dependencia anterior.
- Corrección de caracteres dañados en el título inicial del documento y el aviso público del prototipo.

La directiva compartida `shared/navigation/responsive-navigation.directive.ts` gestiona teclado y restauración. Su modo modal solo se activa para el panel administrativo móvil; la navegación de escritorio conserva sus enlaces y estructura. `navigation-icon.component.ts` agrupa los iconos del menú sin duplicar SVG en cada enlace.

## Pruebas locales de navegador

### Continuación: errores accesibles en formularios

Los editores de usuarios y comunidades incorporan `shared/forms/form-error-summary.component.ts`. Tras un intento inválido, muestran un resumen enfocable con enlaces a cada control. Los mensajes junto a los campos usan identificadores estables, `aria-invalid` y `aria-describedby`, y se retiran al corregir el dato. El resumen no incluye los valores introducidos ni contraseñas.

Se reutilizan las reglas anteriores: longitudes, correo, rol asignable, contraseña inicial/coincidencia y pertenencia territorial. Los payloads y endpoints no cambian. Cancelar la revisión devuelve el foco al botón del formulario; en usuarios sigue limpiando la contraseña como antes. Los errores del servidor conservan su manejo general existente, sin inventar códigos de validación por campo.

En Chrome local se comprobaron un envío vacío de alta de usuario (seis campos señalados), navegación del resumen al campo, asociación del mensaje y retirada al corregirlo. Con catálogos territoriales sintéticos se comprobaron departamento/municipio/nombre, apertura de la revisión sin guardar y retorno del foco al cancelar. La prueba bloquea las escrituras de API. Se inspeccionó una captura móvil de los mensajes. La comprobación con lectores de pantalla reales y la extensión a otros formularios siguen pendientes.

La herramienta de navegador conectado no tenía sesiones disponibles. Se usó Chrome local en modo headless mediante `scripts/check-navigation-ui.mjs`, sin instalar dependencias. El script restringe el origen a `127.0.0.1`, intercepta las solicitudes de API y responde con datos sintéticos; bloquea solicitudes externas y escrituras de API. No contacta la API de producción.

### Continuación: inicio de sesión, registro y recuperación

Login, registro, recuperación y restablecimiento reutilizan el resumen accesible. Se conservan los validadores, endpoints y payloads anteriores. Los controles tienen identificadores propios por pantalla y sus errores se asocian mediante `aria-describedby`; confirmar una contraseña distinta también marca `aria-invalid`, aunque el control por sí solo cumpla su validación requerida. Los mensajes individuales se leen al enfocar el control, sin anunciar simultáneamente cada campo como región viva.

`features/auth/shared/auth-form-feedback.ts` centraliza la presentación de errores existentes. La validación de coincidencia sigue perteneciendo al formulario. `AuthFieldErrorComponent` admite identificador de error y el mensaje de validación cruzada. El control de mostrar/ocultar contraseña indica el campo que modifica con `aria-controls` y usa SVG local. Los iconos de acceso y del encabezado también se renderizan con SVG local; los campos de texto usan 16 px para mejorar su lectura en móvil.

La prueba de Chrome se amplió a las cuatro pantallas, a 360 px en ambos temas: envío inválido, foco en el resumen, enlace a un control inválido y existencia del mensaje descrito. En registro se rellenaron datos sintéticos dejando únicamente contraseñas distintas; se comprobó un solo error de confirmación, ausencia de valores secretos en el resumen y alternancia del tipo del campo. Se inspeccionó una captura móvil del estado de error en tema oscuro.

Para mostrar el restablecimiento, el script intercepta y simula localmente `POST /auth/password-reset/validate/` con un token sintético. No reenvía esa solicitud. Las otras operaciones de autenticación que escriben datos o solicitan correo siguen bloqueadas en la prueba. Esto no verifica entrega de correo ni restablecimiento real. Las ocho suites HTTP existentes siguen pasando.

Comprobaciones ejecutadas:

- Menú móvil a 360 px: apertura, foco dentro del panel, Mayús+Tab, Escape, retorno de foco, fondo inerte y restauración posterior.
- Cambio a 1280 px: se retiran bloqueo/modalidad y se ocultan los botones móviles. La revisión de capturas detectó una regla de botones que anulaba `lg:hidden`; se corrigió y se añadió esa comprobación.
- Ancho de página a 320 px en el editor de usuario y a 360 px en usuarios, comunidades, informes, auditoría y casos administrativos, además del perfil ciudadano. Las tablas conservan desplazamiento interno cuando necesitan más ancho.
- Tema oscuro: colores calculados de campos administrativos, tamaño de texto y capturas; comprobación del perfil ciudadano y enlace activo.
- Revisión visual de capturas del editor de usuario oscuro/móvil, perfil ciudadano oscuro/móvil y editor claro/escritorio. Capturas locales en `.angular/ui-review/`, excluidas de Git.

Para repetir, iniciar Angular en una terminal:

```powershell
npm start -- --port 4201
```

En otra terminal:

```powershell
node --experimental-websocket scripts/check-navigation-ui.mjs
```

El script usa la ruta habitual de Chrome en Windows; `PLUS_CHROME_PATH` permite indicar otra. `PLUS_UI_ORIGIN` permite otro puerto de localhost. Las credenciales de prueba son sintéticas y solo existen en el perfil temporal del navegador, que se elimina al terminar.

También se ejecutaron `npm run test:api` (ocho suites) y la compilación Angular de producción. No se afirma certificación de accesibilidad ni cobertura visual completa. Quedan por revisar todas las pantallas públicas, datos extensos/no vacíos, lectores de pantalla, Safari/iOS, zoom y dispositivos táctiles reales. Los problemas de autorización del backend siguen abiertos hasta su verificación independiente.
