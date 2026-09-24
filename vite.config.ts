import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Eleva el límite permitido a 1000 kB para evitar alarmas visuales
    rollupOptions: {
      output: {
        // Separa automáticamente las dependencias pesadas de node_modules en bloques independientes
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    }
  }
});
