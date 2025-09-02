import antfu from '@antfu/eslint-config'
import vueI18n from '@intlify/eslint-plugin-vue-i18n'
import pluginQuery from '@tanstack/eslint-plugin-query'
import { createSimplePlugin } from 'eslint-factory'
import { createAutoInsert } from 'eslint-plugin-unimport'
import nuxt from './packages/webview/.nuxt/eslint.config.mjs'

const ignores = [
  '**/pages-deprecated/**',
  '**/vender/**',
  '**/assets/**',
  '**/components-deprecated/**',
  '**/components-depercated/**',
  '**/mock/**',
  '**/components/ui/**',
  '**/fixture/**',
]

export default antfu(
  {
    formatters: false,
    unocss: false,
    vue: true,
    pnpm: true,
    typescript: true,
    ignores,
  },
  pluginQuery.configs['flat/recommended'],
  // NOTE: disable temporarily
  vueI18n.configs['flat/recommended'].map(i => ({
    ...i,
    ignores: [
      '**/webview/**',
      '**/network/**',
      'packages/web/src/pages/workbench/service/**',
      'packages/web/src/pages/workbench/service-adt/**',
    ],
  })),
  {
    settings: {
      'vue-i18n': {
        localeDir: './packages/web/locales/*.{json,json5,yaml,yml}', // extens
        messageSyntaxVersion: '^10.0.7',
      },
    },
  },
  createAutoInsert({
    imports: [
      {
        from: 'vue',
        name: 'shallowRef',
      },
      {
        from: 'vue',
        name: 'ref',
        as: 'deepRef',
      },
    ],
    ignores: [
      '**/webview/**',
    ],
  }),
  createSimplePlugin({
    name: 'no-ref',
    exclude: ['**/*.md', '**/*.md/**'],
    create(context) {
      return {
        CallExpression(node) {
          if (node.callee.type === 'Identifier' && node.callee.name === 'ref') {
            context.report({
              node,
              message: 'Usage of ref() is restricted. Use shallowRef() or deepRef() instead.',
            })
          }
        },
      }
    },
    ignores,
  }),
).append(nuxt({
  ignores,
}))
