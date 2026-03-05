import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 8081,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    basicSsl()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
