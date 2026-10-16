import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("firebase") || id.includes("@firebase")) return "vendor-firebase";
          if (id.includes("react-hook-form") || id.includes("@hookform") || id.includes("zod")) {
            return "vendor-forms";
          }
          if (id.includes("lucide-react")) return "vendor-icons";
          if (id.includes("dayjs")) return "vendor-date";
          if (id.includes("react") || id.includes("scheduler")) return "vendor-react";
          return undefined;
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173
  }
});

