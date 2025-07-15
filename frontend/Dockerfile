# Gunakan image Node.js 22.13.1 dengan Alpine sebagai base image
FROM node:22.13.1-alpine AS build

# Set working directory
WORKDIR /app

# Salin file package.json dan package-lock.json (atau yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

ARG VITE_API_URL
ARG VITE_UPLOAD_URL
ARG VITE_SELECT_URL
ARG VITE_NODE_ENV

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_UPLOAD_URL=${VITE_UPLOAD_URL}
ENV VITE_SELECT_URL=${VITE_SELECT_URL}
ENV VITE_NODE_ENV=${VITE_NODE_ENV}

# Salin seluruh aplikasi ke dalam container
COPY . .

# Build aplikasi React (hasilnya di folder dist)
RUN npm run build

# Gunakan image Node.js 22.13.1 Alpine untuk menjalankan aplikasi
FROM node:22.13.1-alpine

# Install serve, untuk menjalankan build React secara langsung
RUN npm install -g serve

# Salin hasil build dari tahap sebelumnya ke dalam folder /dist di container
COPY --from=build /app/dist /dist

# Expose port yang akan digunakan (port 3000)
EXPOSE 3000

# Jalankan aplikasi menggunakan serve
CMD ["serve", "-s", "/dist", "-l", "3000"]