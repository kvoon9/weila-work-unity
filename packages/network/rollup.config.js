import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'

export default defineConfig({
  input: [
    'src/index.ts',
  ],
  output: {
    dir: 'dist',
    format: 'esm',
  },
  plugins: [
    typescript(),
    nodeResolve(),
    commonjs(),
  ],
})
