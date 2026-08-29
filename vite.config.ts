import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [VitePWA({ registerType: 'autoUpdate', manifest: { name: 'Finance Pro', short_name: 'Finance Pro', description: 'Your private, offline-first personal finance companion.', theme_color: '#1769e0', background_color: '#eaf2ff', display: 'standalone', start_url: './', scope: './', orientation: 'portrait-primary', categories: ['finance', 'productivity'], icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] }, workbox: { navigateFallback: 'index.html', cleanupOutdatedCaches: true, clientsClaim: true, skipWaiting: true } })]
});
