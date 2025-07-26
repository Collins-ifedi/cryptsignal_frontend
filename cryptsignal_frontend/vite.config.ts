import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Vite configuration file (async to allow dynamic imports)
export default defineConfig(async () => {
  const plugins = [
    react(),                   // Enables React support with JSX and fast refresh
    runtimeErrorOverlay(),     // Shows runtime errors in an overlay during dev
  ];

  // Load the Replit cartographer plugin dynamically in non-production environments
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    const cartographer = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer.cartographer());
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),       // Alias for frontend src
        "@shared": path.resolve(import.meta.dirname, "shared"),        // Alias for shared code
        "@assets": path.resolve(import.meta.dirname, "attached_assets") // Alias for static assets
      },
    },
    root: path.resolve(import.meta.dirname, "client"), // The root folder for the frontend
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"), // Where the built files go
      emptyOutDir: true, // Clears the output directory before building
    },
    server: {
      fs: {
        strict: true,   // Prevent serving files outside root
        deny: ["**/.*"], // Disallow hidden files
      },
    },
  };
});