import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "PermissionCore",
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: [],
    },
  },
  resolve: {
    extensions: [".ts"],
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
});
