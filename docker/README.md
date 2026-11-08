# Frontend PLUS en Docker

Ejecutar desde la carpeta del Docker Compose del servidor:

```sh
docker compose up -d --build frontend
```

Desde el servidor, abrir http://127.0.0.1:8080. El Compose publica el puerto solo en loopback; el acceso externo depende del proxy del servidor. Para detener el frontend:

```sh
docker compose stop frontend
```

La primera etapa compila Angular en producción con Node.js 22. La imagen final sirve únicamente los archivos estáticos mediante Nginx en el puerto 80, con soporte para recargar rutas de Angular y una comprobación de salud HTTP.

Docker debe estar ejecutándose con contenedores Linux. La compilación requiere acceso a npm y a las fuentes externas del diseño. Las imágenes y fuentes externas también requieren conexión al visitar la página.

Nginx reenvía `/api/` a `http://backend:8000` conservando el prefijo. El servicio `backend` debe compartir la red Docker con el frontend y escuchar en `0.0.0.0:8000`. El contenedor requiere que ese nombre se resuelva al iniciar, por lo que no se ejecuta de forma aislada con `docker run`.

La configuración se instala en `/etc/nginx/conf.d/default.conf`, no reemplaza el archivo global `/etc/nginx/nginx.conf`. No expone `/media/`, archivos privados ni rutas de administración de Django. Los contratos REST todavía deben confirmarse antes de conectar servicios Angular.

Si hay un proxy HTTPS delante, revisar la propagación de `Host` y `X-Forwarded-Proto` en ambos saltos: `$scheme` en este contenedor será HTTP. `depends_on` ordena el inicio, pero no garantiza que Django ya acepte conexiones.

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
