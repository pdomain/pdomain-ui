import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    dts({ tsconfigPath: './tsconfig.build.json', rollupTypes: true }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        canvas: resolve(__dirname, 'src/canvas/index.ts'),
        worklist: resolve(__dirname, 'src/worklist/index.ts'),
        shell: resolve(__dirname, 'src/shell/index.ts'),
        primitives: resolve(__dirname, 'src/primitives/index.ts'),
        icons: resolve(__dirname, 'src/icons/index.ts'),
        types: resolve(__dirname, 'src/types/index.ts'),
        stores: resolve(__dirname, 'src/stores/index.ts'),
        testids: resolve(__dirname, 'src/testids/index.ts'),
        templates: resolve(__dirname, 'src/templates/index.ts'),
        hooks: resolve(__dirname, 'src/hooks/index.ts'),
        'stages/PageWorkbench/index': resolve(__dirname, 'src/stages/PageWorkbench/index.ts'),
        'stages/Source/index': resolve(__dirname, 'src/stages/Source/index.ts'),
        'stages/Grayscale/index': resolve(__dirname, 'src/stages/Grayscale/index.ts'),
        'stages/Crop/index': resolve(__dirname, 'src/stages/Crop/index.ts'),
        'stages/HyphenJoin/index': resolve(__dirname, 'src/stages/HyphenJoin/index.ts'),
        'stages/Validation/index': resolve(__dirname, 'src/stages/Validation/index.ts'),
        'stages/QualityFlags/index': resolve(__dirname, 'src/stages/QualityFlags/index.ts'),
        'stages/Scannos/index': resolve(__dirname, 'src/stages/Scannos/index.ts'),
        'stages/PageReorder/index': resolve(__dirname, 'src/stages/PageReorder/index.ts'),
        'stages/Upload/index': resolve(__dirname, 'src/stages/Upload/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime',
        /^@radix-ui\//,
        /^@dnd-kit\//,
        '@tanstack/react-virtual',
        'konva', 'react-konva', 'zustand',
        'lucide-react', 'react-virtuoso', 'clsx',
      ],
    },
    target: 'es2022',
    cssCodeSplit: true,
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
})
