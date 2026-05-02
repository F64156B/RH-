import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base relativa permite hospedar o build em subpath (GitHub Pages, etc.)
// sem precisar saber o nome do repositório no momento do build.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          gemini: ['@google/generative-ai'],
          xlsx: ['xlsx'],
          icons: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
});
