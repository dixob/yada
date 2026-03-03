import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0, // Don't inline assets — keep them as separate files
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'], // Split Phaser into its own chunk for better caching
        },
      },
    },
  },
  server: {
    port: 8080,
    // Proxy API calls to the backend server during development
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
