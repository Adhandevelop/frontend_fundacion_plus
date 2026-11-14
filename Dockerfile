FROM node:22-alpine3.22 AS build

# Apply available Alpine package patches to the build environment.
RUN apk upgrade --no-cache

WORKDIR /app
ENV NG_CLI_ANALYTICS=false
ENV NODE_OPTIONS="--max-old-space-size=1536"

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY angular.json tsconfig.json tsconfig.app.json tailwind.config.cjs ./
COPY src ./src
COPY public ./public
# Reduce the build process priority so production services retain CPU time.
RUN nice -n 15 npm run build -- --configuration production

FROM nginx:stable-alpine AS runtime

# Apply available Alpine package patches to the production environment.
RUN apk upgrade --no-cache

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/plus/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
