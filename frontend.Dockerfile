FROM node:18-alpine as build

WORKDIR /app

# Копируем только файлы фронтенда
COPY package*.json ./
COPY public/ ./public/
COPY src/ ./src/
COPY tsconfig.json ./

RUN npm ci
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
