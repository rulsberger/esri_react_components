import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    ...(mode === "development"
      ? [
          viteStaticCopy({
            targets: [
              {
                src: "C:/Development/react_components/node_modules/@esri/calcite-components/dist/calcite/assets",
                dest: "calcite-assets",
              },
            ],
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@arcgis/core': '@arcgis/core',
    },
  },
  optimizeDeps: {
    exclude: ["@arcgis/core"],
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: resolve(__dirname, "index.html"),
      external: [],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@esri/calcite-components-react": "CalciteComponentsReact", // This is needed for UMD
        },
      },
    },
  },
}));
