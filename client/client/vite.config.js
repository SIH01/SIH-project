import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['diverse-judgment-unified-people.trycloudflare.com']
    port: 5174,
  },
});
