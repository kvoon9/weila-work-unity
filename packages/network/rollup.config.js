import fsp from 'node:fs/promises'
import { resolve } from 'node:path'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'

const outputDir = 'dist'

export default defineConfig({
  input: [
    'src/index.ts',
  ],
  output: {
    dir: outputDir,
    format: 'esm',
  },
  external: [
    /vue/,
    'zod',
  ],
  plugins: [
    typescript(),
    nodeResolve(),
    commonjs(),
    {
      name: 'remove-dist-dir',
      async buildStart() {
        return await fsp.rm(resolve('./', outputDir), { recursive: true, force: true })
      },
    },
  ],
})
