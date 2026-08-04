import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [VitePWA({ registerType: 'autoUpdate', manifest: { name: 'Finance Pro', short_name: 'Finance Pro', description: 'Your private, offline-first personal finance companion.', theme_color: '#126b4b', background_color: '#f5f8f6', display: 'standalone', start_url: './', scope: './', orientation: 'portrait-primary', categories: ['finance', 'productivity'], icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] }, workbox: { navigateFallback: 'index.html', cleanupOutdatedCaches: true } })]
});
