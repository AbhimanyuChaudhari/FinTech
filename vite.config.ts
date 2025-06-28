import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target:
            mode === "development"
              ? "http://localhost:8000"
              : "https://fintech-backend-80wz.onrender.com",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
