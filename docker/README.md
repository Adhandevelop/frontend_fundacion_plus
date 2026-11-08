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

## Actualizaciones y escaneo

Para obtener las imágenes base actuales y aplicar los parches disponibles de Alpine, reconstruir sin caché. Desde la carpeta del Compose del servidor:

```sh
docker compose build --pull --no-cache frontend
docker compose up -d --no-deps frontend
docker compose images frontend
```

Escanear el identificador de imagen que muestra el último comando:

```sh
docker scout cves <IMAGE_ID>
docker scout recommendations <IMAGE_ID>
```

Las actualizaciones de paquetes no garantizan eliminar todos los hallazgos. Es necesario revisar los paquetes afectados, las versiones corregidas y el resultado del escáner. Node se usa solamente durante la compilación; la imagen final contiene Nginx y los archivos estáticos de Angular. Las alertas sobre las líneas `FROM` pueden seguir mostrando hallazgos de las imágenes base aunque los paquetes de la imagen resultante se hayan actualizado.
