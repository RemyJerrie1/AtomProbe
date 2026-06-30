import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 純前端 SPA;不需要 SSR/伺服器,build 出純靜態可上任何 CDN。
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  },
});
