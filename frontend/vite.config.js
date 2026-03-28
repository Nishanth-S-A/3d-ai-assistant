import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const ollamaUrl = env.VITE_OLLAMA_URL || "http://localhost:11434";

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      proxy: {
        "/api": {
          target: ollamaUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
