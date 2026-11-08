# Frontend PLUS en Docker

Ejecutar desde la raíz del proyecto:

```sh
docker build -t plus-frontend .
docker run --rm -d --name plus-frontend -p 8080:80 plus-frontend
```

Abrir http://localhost:8080. Para detenerlo:

```sh
docker stop plus-frontend
```

La primera etapa compila Angular en producción con Node.js 22. La imagen final sirve únicamente los archivos estáticos mediante Nginx en el puerto 80, con soporte para recargar rutas de Angular y una comprobación de salud HTTP.

Docker debe estar ejecutándose con contenedores Linux. La compilación requiere acceso a npm y a las fuentes externas del diseño. Las imágenes y fuentes externas también requieren conexión al visitar la página.

La URL de la API y cualquier proxy al backend se configurarán cuando se defina la integración REST.
