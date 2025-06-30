import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? './' : '/',  // ✅ important for static deployment

  server: {
    host: "::",         // ✅ still okay for dev
    port: 8080,         // ✅ still okay for dev
  },

  plugins: [
    react(),
    mode === 'development' && componentTagger(), // ✅ only runs during dev
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
