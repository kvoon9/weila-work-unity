// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@unocss/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon',
  ],

  ssr: false,

  devtools: { enabled: true },
  app: {
    cdnURL: './',
  },

  css: [
    '@unocss/reset/tailwind.css',
  ],

  router: {
    options: {
      hashMode: true,
    },
  },

  experimental: {
    typedPages: true,
    clientNodeCompat: true,
  },

  compatibilityDate: '2024-11-01',

  nitro: {
    preset: 'static',
    routeRules: {
      '/proxy/**': {
        proxy: {
          to: 'http://demo.weila.hk/v1/**',
        },
        cors: true,
      },
    },
  },

  vite: {
    base: './',
  },

  hooks: {
    'prerender:routes': function ({ routes }) {
      routes.clear() // Do not generate any routes (except the defaults)
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

  icon: {
    serverBundle: {
      collections: ['svg-spinners', 'ph', 'carbon'],
    },
    mode: 'svg',
  },

  unocss: {
    nuxtLayers: true,
    // TODO: merge all unocss config in root
    configFile: '../webview/unocss.config.ts',
  },
})
