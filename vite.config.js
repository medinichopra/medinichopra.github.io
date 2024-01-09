// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "sectionAbout.html"),
        code: resolve(__dirname, "sectionCode.html"),
        data: resolve(__dirname, "sectionData.html"),
      },
    },
  },
});
