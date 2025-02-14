import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@arcgis/core": path.resolve("node_modules/@arcgis/core"), // Explicit path
    },
  },
  optimizeDeps: {
    exclude: ["@arcgis/core"]
  },
  build: {
    lib: {
      entry: {
        DrawWidget: path.resolve(__dirname, 'src/components/DrawWidget/index.ts'),
        FeatureListWidget: path.resolve(__dirname, 'src/components/FeatureListWidget/index.ts'),
        IdentifyAllWidget: path.resolve(__dirname, 'src/components/IdentifyAllWidget/index.ts'),
      },
      formats: ['es', 'cjs'], // Generate ES and CommonJS modules
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@arcgis/core', '@esri/calcite-components-react'], // Prevent bundling of peer dependencies
      output: {
        entryFileNames: '[name].[format].js',
        dir: 'dist',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@arcgis/core': 'arcgis',
          '@esri/calcite-components-react': 'calcite',
        },
      },
    },
  },
});
