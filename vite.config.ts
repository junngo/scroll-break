import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content.ts"),
        popup: resolve(__dirname, "src/popup/popup.html"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) =>
          assetInfo.name?.includes("overlay") ? "content.css" : "assets/[name]-[hash][extname]",
      },
    },
    sourcemap: true,
    target: "esnext",
  },
});
