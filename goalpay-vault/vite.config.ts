import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'goal_finance_icon_png.png', 'robots.txt'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB
      },
      devOptions: {
        enabled: true
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
    // Fix Lit dev mode warning
    'process.env.NODE_ENV': JSON.stringify(mode),
    // Define for Lit compatibility
    'process.env.DEV': mode === 'development',
  },
  optimizeDeps: {
    include: ['buffer', 'lit', 'lit-html', '@lit/reactive-element'],
  },
  build: {
    rollupOptions: {
      external: [],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
