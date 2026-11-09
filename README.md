# PLUS · Frontend

Angular 18, TypeScript y Tailwind CSS 3. Requiere Node 20.11 o superior compatible con Angular 18.

```sh
npm ci
npm start
npm run test:api
npm run build
```

La aplicación local abre en http://127.0.0.1:4200. `proxy.conf.json` reenvía `/api` al backend local en `http://127.0.0.1:8000`. En Docker se usa el proxy existente de Nginx hacia `backend:8000`. La base de API es `/api/v1`; no se incluyen credenciales en el código.

Acceso, registro, recuperación/restablecimiento y perfil usan servicios REST. Las rutas de ciudadano y administración requieren sesión, y administración verifica las capacidades devueltas por el servidor. El perfil incluye fotografía, preferencias y ubicación mediante catálogos reales.

Los demás módulos todavía usan datos de demostración, señalados en sus vistas. El contenido público de noticias e iniciativas se conserva hasta preparar su carga inicial e integrar sus consultas. Las cifras e imágenes del diseño deben validarse antes de publicarlas como contenido institucional.

Ver [estado de integración y despliegue](docs/integracion-acceso-perfil.md), [contratos del backend](endpoints_info.md) y [configuración Docker](docker/README.md).
