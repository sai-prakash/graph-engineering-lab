import { defineConfig } from "vite";

// Relative base works on GitHub project Pages and on Netlify.
export default defineConfig({
  base: "./",
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
