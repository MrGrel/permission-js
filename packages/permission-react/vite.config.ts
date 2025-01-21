import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.tsx"),
      name: "PermissionReact",
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "@permission/core"],
    },
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
});
