import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    // Never ship source maps to production: they expose original source code.
    sourcemap: false,
  },
  server: {
    port: 3000,
    // Bind to localhost only so the dev server isn't reachable from the LAN.
    host: 'localhost',
    open: true,
    // Dev-only proxies (they do not exist in production builds): plain
    // `vite dev` doesn't run the Netlify functions, so these give the
    // frontend a working same-origin path to the market and news feeds during development.
    proxy: {
      '/yahoo-api': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/yahoo-api/, ''),
      },
      '/news-rss': {
        target: 'https://www.livemint.com',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/news-rss/, ''),
      },
    },
  },
});
