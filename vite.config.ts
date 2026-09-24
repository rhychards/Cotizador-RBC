import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500, // Mantiene el límite alto para librerías de IA
    cssMinify: 'esbuild' // Fuerza el uso del compilador clásico de CSS para evitar el error de @theme
  }
});
