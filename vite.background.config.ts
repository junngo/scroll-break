import { defineConfig } from "vite";
import { resolve } from "path";

/** Builds background script as IIFE so it works as both background.scripts (Firefox) and service_worker (Chrome). */
export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/background.ts"),
      name: "_",
      formats: ["iife"],
      fileName: () => "background.js",
    },
    sourcemap: true,
    target: "esnext",
    minify: false,
  },
});
