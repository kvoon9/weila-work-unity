import { fileURLToPath } from 'node:url'
import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    {
      'color-base': 'color-neutral-800 dark:color-neutral-300',
      'color-secondary': 'color-neutral-600 dark:color-neutral-400',

      'bg-base': 'bg-white dark:bg-#111',
      'bg-secondary': 'bg-#eee dark:bg-#222',
      'border-base': 'border-#8882',

      'bg-tooltip': 'bg-white:75 dark:bg-#111:75 backdrop-blur-8',

      'text-base': 'text-gray-800 dark:text-white',
      'btn': 'flex drop-shadow-md  items-center justify-center px4 h12 border border-base leading-loose opacity-85 hover:op100 rounded disabled:op50 disabled:pointer-event-none',
      'btn-sm': 'text-sm px2 py1 h-fit',
      'btn-primary': 'btn bg-primary text-white',
      'btn-secondary': 'btn bg-secondary text-base',
      'btn-ghost': 'px4 h12 flex items-center justify-center leading-loose opacity-85 hover:op100 disabled:op50 disabled:pointer-event-none',
      'btn-outline': 'btn text-base border border-neutral-400 bg-transparent',

      'input': 'px2 py1 h12 rounded bg-secondary bg-op50 focus:bg-op70 focus:outline-none',
      'position-x-center': 'left-50% translate-x--50%',
      'position-y-center': 'top-50% translate-y--50%',
      'position-center': 'position-x-center position-y-center',
      'checkbox': 'size-6 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer',

      'label': 'text-sm',
      'tag-primary': 'text-sm border border-primary-300 color-primary bg-primary-100/12 w-fit px1 leading-tight rounded',
      'select': 'h12',
    },
  ],
  theme: {
    colors: {
      primary: {
        100: '#d3e0fb',
        200: '#a8c1f7',
        300: '#7ca1f3',
        400: '#5182ef',
        DEFAULT: '#2563eb',
        500: '#2563eb',
        600: '#1e4fbc',
        700: '#163b8d',
        800: '#0f285e',
        900: '#07142f',
      },
    },
  },
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans:200,400,700',
        mono: 'DM Mono',
      },
      processors: createLocalFontProcessor({
        fontAssetsDir: fileURLToPath(new URL('./public/fonts', import.meta.url)),
        fontServeBaseUrl: './fonts',
      }),
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
