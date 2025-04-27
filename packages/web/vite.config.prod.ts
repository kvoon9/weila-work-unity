// import ImageMin from 'unplugin-imagemin/vite'
import { mergeConfig } from 'vite'
import configArcoResolverPlugin from './plugins/arcoResolver'
import configCompressPlugin from './plugins/compress'
import configVisualizerPlugin from './plugins/visualizer'
import baseConfig from './vite.config'

export default mergeConfig(
  baseConfig,
  {
    mode: 'production',
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            arco: ['@arco-design/web-vue'],
            chart: ['echarts', 'vue-echarts'],
            vue: ['vue', 'vue-router', 'pinia', '@vueuse/core', 'vue-i18n'],
          },
        },
      },
      chunkSizeWarningLimit: 2000,
    },
    plugins: [
      configCompressPlugin('gzip'),
      configVisualizerPlugin(),
      configArcoResolverPlugin(),
      // ImageMin(),
      // DistZip({
      //   filename() {
      //     const date = new Date()

      //     const formattedDate = date.getFullYear().toString()
      //       + (date.getMonth() + 1).toString().padStart(2, '0')
      //       + date.getDate().toString().padStart(2, '0')
      //       + date.getHours().toString().padStart(2, '0')
      //       + date.getMinutes().toString().padStart(2, '0')
      //       + date.getSeconds().toString().padStart(2, '0')

      //     return `${name}_${formattedDate}`
      //   },
      // }),
    ],
  },
)
