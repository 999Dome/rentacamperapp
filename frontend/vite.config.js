import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  server: {
    fs: {
      allow: [".."],
    },
  },
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "../shared"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          "import",
          "color-functions",
          "global-builtin",
          "if-function",
        ],
      },
    },
  },
  root: "src",
  publicDir: "../public",
  envDir: "../",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
