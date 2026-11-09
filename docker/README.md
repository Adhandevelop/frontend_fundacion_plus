# Frontend PLUS en Docker

Ejecutar desde la carpeta del Docker Compose del servidor:

```sh
docker compose up -d --build frontend
```

En el despliegue actual, abrir http://127.0.0.1:8081 desde el servidor (el 8080 lo utiliza otro proyecto). El Compose debe publicar `127.0.0.1:8081:80`; el acceso externo depende del proxy del servidor. Para detener el frontend:

```sh
docker compose stop frontend
```

La primera etapa compila Angular en producción con Node.js 22. La imagen final sirve únicamente los archivos estáticos mediante Nginx en el puerto 80, con soporte para recargar rutas de Angular y una comprobación de salud HTTP.

Docker debe estar ejecutándose con contenedores Linux. La compilación requiere acceso a npm y a las fuentes externas del diseño. Las imágenes y fuentes externas también requieren conexión al visitar la página.

Nginx reenvía `/api/` a `http://backend:8000` conservando ruta y parámetros. El servicio `backend` debe compartir la red Docker con el frontend y escuchar en `0.0.0.0:8000`. Su nombre se resuelve al atender solicitudes mediante el DNS interno de Docker (`127.0.0.11`), con caché de 10 segundos. La portada y las rutas Angular pueden arrancar aunque el backend aún no tenga registro DNS o esté detenido; en ese caso las solicitudes `/api/` pueden devolver 502 hasta que se recupere. Esto no repara errores de Django ni sustituye sus comprobaciones de salud.

La configuración se instala en `/etc/nginx/conf.d/default.conf`, no reemplaza el archivo global `/etc/nginx/nginx.conf`. No expone `/media/`, archivos privados ni rutas de administración de Django. Los contratos REST todavía deben confirmarse antes de conectar servicios Angular.

Si hay un proxy HTTPS delante, revisar la propagación de `Host` y `X-Forwarded-Proto` en ambos saltos: `$scheme` en este contenedor será HTTP. `depends_on` ordena el inicio, pero no garantiza que Django ya acepte conexiones.

## Error 502 y backend no disponible

Si el log antiguo muestra `host not found in upstream "backend"`, Nginx con resolución estática no pudo iniciar. La configuración actual utiliza resolución en solicitudes para que ese fallo no derribe también el frontend estático. Docker y Nginx documentan este comportamiento en [DNS de Docker](https://docs.docker.com/engine/network/#dns-services) y [proxy_pass con variables](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass).

Después de aplicar los cambios a la copia del frontend en el servidor, reconstruir y recrear solo ese servicio desde la carpeta del Compose:

```sh
cd /home/devadhan/practicas
docker compose build frontend
docker compose up -d --no-deps frontend
docker compose exec frontend nginx -t
curl -I --max-time 10 http://127.0.0.1:8081
curl -I --max-time 10 https://fundacionplus.site
```

Si la portada responde 200 pero la API falla, revisar el backend sin reiniciar los demás proyectos:

```sh
docker compose ps -a
docker compose logs --tail=100 backend
docker inspect --format '{{.RestartCount}}' practicas-backend-1
```

Los logs permiten distinguir una recreación puntual de un bucle de errores/reinicios. No concluir que el backend está estable por un único estado `Up`. El healthcheck del frontend solo comprueba su portada, no la salud de Django. No es necesario cambiar certificados o el proxy del host si este ya apunta al 8081 y la prueba local es correcta.

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
