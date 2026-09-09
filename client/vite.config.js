import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    port: 5174,
    // During local dev, forward /api calls to the backend on 5001 — this
    // means the frontend can always call a relative "/api" path, whether
    // running locally or behind a Cloudflare Tunnel later.
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
});
