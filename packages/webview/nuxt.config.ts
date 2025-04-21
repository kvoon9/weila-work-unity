import type { NuxtPage } from 'nuxt/schema'
import { fileURLToPath } from 'node:url'
import { headers } from './shared/const'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    'nuxt-lucide-icons',
    '@nuxt/icon',
    'nuxt-zod-i18n',
    '@nuxtjs/i18n',
    'reka-ui/nuxt',
    'nuxt-vite-legacy',
    '@unocss/nuxt',
    '@vee-validate/nuxt',
  ],

  ssr: false,

  components: {
    dirs: [
      './components/ui',
      './components',
    ],
  },

  imports: {
    dirs: [
      './composables',
      './shared',
      './utils',
    ],
  },

  devtools: { enabled: false },

  app: {
    cdnURL: './',
  },

  css: [
    '@unocss/reset/tailwind.css',
    '@vuemap/vue-amap/dist/style.css',
    'video.js/dist/video-js.css',
    'cropperjs/dist/cropper.min.css',
  ],

  router: {
    options: {
      hashMode: true,
    },
  },

  // devServer: {
  //   https: {
  //     key: './localhost-key.pem',
  //     cert: './localhost.pem',
  //   },
  // },

  experimental: {
    typedPages: true,
    clientNodeCompat: true,
    appManifest: true,
    payloadExtraction: false,
  },

  compatibilityDate: '2024-11-01',

  nitro: {
    preset: 'static',
    routeRules: {
      // '/**': {
      // prerender: false,
      // headers: {
      //   'Cross-Origin-Embedder-Policy': 'require-corp',
      //   'Cross-Origin-Opener-Policy': 'same-origin',
      // },
      // },

      '/proxy/**': {
        proxy: {
          to: 'http://demo.weila.hk/v1/**',
        },
        cors: true,
      },
    },
    sourceMap: false,
  },

  vite: {
    base: './',
    server: {
      headers,
      // NOTE: 此处 proxy 配置并不符合 nuxt 的最佳实践(SSG 模式下无法正常工作)
      // 考虑到 weila 的 v2 接口现只支持 https 协议，而 routeRules 中无法忽略证书，故在此配置代理
      proxy: {
        '/proxy2': {
          target: 'https://demo.weila.hk',
          changeOrigin: true,
          secure: false, // 忽略 SSL 证书
          rewrite: path => path.replace(/^\/proxy2/, 'v2'),
        },
      },
    },
    resolve: {
      alias: {
        vue: fileURLToPath(new URL('./node_modules/vue', import.meta.url)),
      },
      dedupe: ['vue', 'vue-router'],
    },
  },

  hooks: {
    'prerender:routes': function ({ routes }) {
      routes.clear() // Do not generate any routes (except the defaults)
    },
    'pages:extend': function (pages) {
      function removePagesMatching(pattern: RegExp, pages: NuxtPage[] = []) {
        const pagesToRemove: NuxtPage[] = []
        for (const page of pages) {
          if (page.file && pattern.test(page.file)) {
            pagesToRemove.push(page)
          }
          else {
            removePagesMatching(pattern, page.children)
          }
        }
        for (const page of pagesToRemove) {
          pages.splice(pages.indexOf(page), 1)
        }
      }

      removePagesMatching(/\.ts$/, pages)
      removePagesMatching(/components/, pages)
    },
  },

  eslint: {
    config: {
      standalone: false,
      nuxt: {
        sortConfigKeys: true,
      },
    },
  },

  i18n: {
    defaultDirection: 'ltr',
    defaultLocale: 'zh-CN',
    langDir: 'locales',
    lazy: true,
    locales: [
      {
        code: 'zh-CN',
        dir: 'ltr',
        file: 'zh-CN.json',
        flag: 'cn',
        isCatchallLocale: true,
        language: 'zh-CN',
        name: 'Chinese',
      },
    ],
    strategy: 'prefix_except_default',
    types: 'composition',
  },

  icon: {
    serverBundle: {
      collections: ['svg-spinners', 'ph', 'carbon'],
    },
    mode: 'svg',
  },

  legacy: {
    targets: ['chrome 49'],
    additionalLegacyPolyfills: [
      // 'mdn-polyfills/Element.prototype.getAttributeNames',
    ],
    modernPolyfills: true,
    polyfills: [
      'es.symbol',
      'es.array.filter',
      'es.promise',
      'es.promise.finally',
      'es/map',
      'es/set',
      'es/array',
      'es.object.define-properties',
      'es.object.define-property',
      'es.object.get-own-property-descriptor',
      'es.object.get-own-property-descriptors',
      'es.object.keys',
      'es.object.to-string',
      'web.dom-collections.for-each',
      'esnext.global-this',
      'esnext.string.match-all',
    ],
  },
})
