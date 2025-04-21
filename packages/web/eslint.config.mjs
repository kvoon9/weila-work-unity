import antfu from '@antfu/eslint-config'
import vueI18n from '@intlify/eslint-plugin-vue-i18n'
import pluginQuery from '@tanstack/eslint-plugin-query'

export default antfu(
  {
    unocss: true,
    vue: true,
    typescript: true,
    formatters: true,
    ignores: [
      'fixtures',
      'generated',
    ],
  },
  pluginQuery.configs['flat/recommended'],
  vueI18n.configs['flat/recommended'],
  {
    settings: {
      'vue-i18n': {
        localeDir: [
          './locales/*.{json,json5,yaml,yml}',
          './src/locale/*.{ts}',
        ],
      },
    },
  },
)
