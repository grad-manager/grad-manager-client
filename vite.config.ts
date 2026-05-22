import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";

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
