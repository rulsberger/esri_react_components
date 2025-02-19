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
      entry: {
        DrawWidget: resolve(__dirname, 'src/components/DrawWidget/index.ts'),
        FeatureListWidget: resolve(__dirname, 'src/components/FeatureListWidget/index.ts'),
        IdentifyAllWidget: resolve(__dirname, 'src/components/IdentifyAllWidget/index.ts'),
      },
      formats: ['es', 'cjs'], // Generate ES and CommonJS modules
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
