import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    open: false,
    proxy: {
      // Маршрут 1: Проксирование REST API к веб-сервису NestJS (порт 3000)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // Маршрут 2: Проксирование к S3 хранилищу MinIO / Silo (порт 9000)
      '/chemistry1': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
        secure: false,
      },
      '/minio': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/minio/, ''),
      },
    },
  },
});
