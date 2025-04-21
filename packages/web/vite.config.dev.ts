import { mergeConfig } from 'vite'
import baseConfig from './vite.config'

export default mergeConfig(
  {
    mode: 'development',
    server: {
      open: false,
      fs: {
        strict: true,
      },
    },
    plugins: [],
  },
  baseConfig,
)
