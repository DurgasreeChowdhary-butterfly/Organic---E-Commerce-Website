import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// Vite config: React + PWA support so the app is installable and
// architecturally ready to be wrapped in an Android WebView later.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Organic Store - Premium Organic Products",
        short_name: "Organic Store",
        theme_color: "#6B8E23", // pista green
        background_color: "#FDF6EC", // soft cream
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      // TODO: tune workbox runtime caching for product images/API responses
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    // Docker Desktop on Windows doesn't reliably propagate native filesystem
    // change events for a bind-mounted directory into the Linux container —
    // edits made on the Windows host (or by any tool outside the container)
    // never trigger chokidar, so Vite keeps serving stale cached transforms
    // of already-requested files indefinitely. Polling works around this by
    // having Vite actively re-stat files instead of waiting for OS events.
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
});
