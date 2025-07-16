# Build Vite
FROM node:22.13.1-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

ARG VITE_API_URL
ARG VITE_NODE_ENV
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_NODE_ENV=${VITE_NODE_ENV}

COPY . .
RUN npm run build

# Serve dist folder
FROM node:22.13.1-alpine
RUN npm install -g serve
COPY --from=build /app/dist /dist
EXPOSE 3000
CMD ["serve", "-s", "/dist", "-l", "3000"]