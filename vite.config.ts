import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  return {
    // Local forms use the development proxy, even when .env contains the hosted build URL.
    define: command === 'serve' ? { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify('/api/v1') } : {},
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: { '/api': 'http://127.0.0.1:' + (process.env.LOCAL_API_PORT ?? '3002') },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },    build: {
      assetsInlineLimit: 4096,
      assetsDir: 'assets',
    },  };
});
