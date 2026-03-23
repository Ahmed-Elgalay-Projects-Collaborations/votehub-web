# syntax=docker/dockerfile:1

FROM node:22.22.1-alpine3.22 AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS development
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM base AS build
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
