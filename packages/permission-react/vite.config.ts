import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.tsx"),
      name: "PermissionReact",
      fileName: (format) => `permission-react.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "@permission/core"],
    },
  },
});
