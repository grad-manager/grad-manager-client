import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    // 🔥 Brotli compression for smaller bundle size
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 10240, // only compress files > 10KB
      deleteOriginFile: false, // keep original files too
    }),

    // PWA
    VitePWA({
      registerType: "autoUpdate",

      // File types service worker should cache
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico,webmanifest}"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // Increase Cache Limit to 3mb - previously 2mb
        globIgnores: [
          "**/Google_Gemini_files/**",
          "**/Google Gemini.html",
          "**/assets/vendor-D40w8AxI.js",
        ],
      },

      manifest: {
        name: "GradManager - Smarter Way to Manage Graduate School Applications",
        short_name: "GradManager",
        description:
          "GradManager helps you organize your graduate school applications, track deadlines, and manage scholarships with ease.",
        theme_color: "#04040f",
        background_color: "#fff",
        display: "standalone",
        start_url: "/",
        orientation: "portrait",

        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },

          {
            purpose: "maskable",
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },

          {
            purpose: "any",
            src: "/android-chrome-round-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
