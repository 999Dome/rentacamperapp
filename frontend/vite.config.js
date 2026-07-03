import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

function camperDetailsRewritePlugin() {
  return {
    name: "camper-details-rewrite",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.match(/^\/campers\/[^\/]+(\?.*)?$/)) {
          req.url = "/pages/camper-details/index.html";
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [camperDetailsRewritePlugin()],
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
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        rent: resolve(__dirname, "src/pages/rent/index.html"),
        rentout: resolve(__dirname, "src/pages/rentout/index.html"),
        aboutus: resolve(__dirname, "src/pages/aboutus/index.html"),
        account: resolve(__dirname, "src/pages/account/index.html"),
        camperDetails: resolve(__dirname, "src/pages/camper-details/index.html"),
        contact: resolve(__dirname, "src/pages/contact/index.html"),
      },
    },
  },
});
