import { defineConfig } from "vite";
import { resolve } from "path";

/** Builds content script as IIFE so it works in browser extension content scripts. */
export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content.ts"),
      },
      output: {
        entryFileNames: "content.js",
        format: "iife",
        inlineDynamicImports: true,
        assetFileNames: (assetInfo) =>
          assetInfo.name?.includes("overlay") ? "content.css" : "assets/[name]-[hash][extname]",
      },
    },
    sourcemap: true,
    target: "esnext",
  },
});

