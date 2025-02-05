import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { viteStaticCopy } from "vite-plugin-static-copy";
import dts from 'vite-plugin-dts';
import { resolve } from "path"; // Use resolve properly
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    dts({
      // plugin options
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    }),
    visualizer({ open: true }) // Add the visualizer plugin
    // ...other plugins
  ],
  resolve: {
    alias: {
      "@arcgis/core": resolve("node_modules/@arcgis/core"), // Explicit path
    },
  },
  optimizeDeps: {
    exclude: ["@arcgis/core"]
  },
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'IdentifyAllWidgets',
      formats: ['es', 'umd'],
      fileName: (format) => `identify-all-widget.${format}.js`,
    },
    rollupOptions: {
      // Specify external dependencies that should not be bundled
      external: ["react", "react-dom", "@arcgis/core", "@esri/calcite-components-react"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@esri/calcite-components-react": "CalciteComponentsReact",
        },
      },
      plugins: [
        {
          name: 'exclude-node-modules',
          resolveId(source) {
            if (source === 'fs' || source === 'path') {
              return { id: source, external: true };
            }
            return null;
          }
        }
      ]
    },

    minify: false
  },
});
