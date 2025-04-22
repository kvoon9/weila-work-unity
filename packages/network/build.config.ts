import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  declaration: 'node16',
  clean: true,
  externals: [/vue/, 'zod'],
  rollup: {
    inlineDependencies: [
      '@antfu/utils',
    ],
  },
})
