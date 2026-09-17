import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

  return {
    plugins: [TanStackRouterVite({ autoCodeSplitting: true }), react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "react": path.resolve(__dirname, "./node_modules/react"),
        "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      },
      dedupe: ["react", "react-dom"],
    },
    server: {
      host: "localhost",
      port: 5173,
      strictPort: true,
      hmr: {
        protocol: "ws",
        host: "localhost",
        port: 5173,
      },
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["@tanstack/react-router", "@tanstack/react-query"],
            motion: ["framer-motion"],
            icons: ["lucide-react"],
          },
          assetFileNames: "assets/[name]-[hash][extname]",
        },
      },
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 600,
      cssCodeSplit: true,
      sourcemap: false,
    },
    optimizeDeps: {
      include: ["react", "react-dom"],
    },
  };
});
