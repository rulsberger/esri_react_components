import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: "C:/Development/react_components/node_modules/@esri/calcite-components/dist/calcite/assets",
          dest: "calcite-assets", 
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@arcgis/core': '@arcgis/core',
    },
  },
  optimizeDeps: {
    exclude: ["@arcgis/core"]
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.tsx"),
      name: "IdentifyAll",
      formats: ["es", "umd"], // Generate both ES module and UMD formats
      fileName: (format) => `identifyAll.${format}.js`,
    },
    rollupOptions: {
      // Specify external dependencies that should not be bundled
      external: ["react", "react-dom", "@esri/calcite-components-react"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@esri/calcite-components-react": "CalciteComponentsReact",
        },
      },
    },
  },
});
