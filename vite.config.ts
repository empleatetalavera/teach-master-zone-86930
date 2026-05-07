import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Same-origin proxy for SCORM packages so the SCO can reach window.parent.API
      "/scorm-content": {
        target: "https://fkxbgifvwivlvpwxdzdb.supabase.co",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/scorm-content/, "/storage/v1/object/public/scorm-packages"),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
