
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
    'process.env.VITE_APP_ENV': JSON.stringify(process.env.VITE_APP_ENV),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['./tests/**/*.test.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['hooks/**', 'utils/**', 'components/**', 'contexts/**', 'services/**'],
    },
  },
  build: {
    // Generate source maps for debugging but keep them separate
    sourcemap: true,
    // Target modern browsers for smaller output
    target: 'es2020',
    // Manual chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-motion': ['framer-motion'],
          'vendor-map': ['leaflet'],
        },
      },
    },
    // Inline small assets (<4KB) to reduce HTTP requests
    assetsInlineLimit: 4096,
    // CSS code splitting per async chunk
    cssCodeSplit: true,
  },
});
