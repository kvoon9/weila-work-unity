// @ts-check
import antfu from '@antfu/eslint-config'
import tanstackQuery from '@tanstack/eslint-plugin-query'
import { createSimplePlugin } from 'eslint-factory'
import { createAutoInsert } from 'eslint-plugin-unimport'
import nuxt from './.nuxt/eslint.config.mjs'

export default nuxt(
  antfu({
    unocss: false,
    formatters: true,
    rules: {
      'eslint-comments/no-unlimited-disable': 'off',
    },
    ignores: ['vender', 'assets', 'components/ui', 'components-deprecated', 'pages-deprecated'],
  }),
  ...tanstackQuery.configs['flat/recommended'],
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
  }),
)
