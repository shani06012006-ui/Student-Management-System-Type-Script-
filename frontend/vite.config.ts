import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  preview: { port: 4173 },
  build: {
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("react-router")) return "router";
          if (id.includes("react-dom") || id.includes("/react/") || id.includes("scheduler")) return "react";
          if (id.includes("lucide-react")) return "icons";
          return "vendor";
        },
      },
    },
  },
});