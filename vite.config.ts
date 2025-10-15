import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dts({
    rollupTypes: true,
    afterDiagnostic(d) {
      if (d.length > 0) {
        throw new Error(`Typescript compilation errors.`);
      }
    },
  })],
  build: {
    lib: {
      entry: [
        resolve(__dirname, 'src/index.ts'),
      ],
      fileName: 'react-dsl-editor',
      formats: ['es'],
    },
    rolldownOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});
