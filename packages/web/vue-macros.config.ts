import { defineConfig } from 'unplugin-vue-macros'

export default defineConfig({
  exportExpose: {
    include: ['**/export-expose/**'],
  },
  exportProps: {
    include: ['**/export-props/**'],
  },
  exportRender: {
    include: ['**/export-render/**'],
  },
})
