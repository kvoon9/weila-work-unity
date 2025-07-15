import path, { resolve } from 'node:path'
import ViteYaml from '@modyfi/vite-plugin-yaml'
import Vue from '@vitejs/plugin-vue'
import { VueAmapResolver } from '@vuemap/unplugin-resolver'
import RadixVueResolver from 'radix-vue/resolver'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Unused from 'unplugin-unused/vite'
import Components from 'unplugin-vue-components/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import { viteMockServe as ViteMockServe } from 'vite-plugin-mock'
import Layouts from 'vite-plugin-vue-layouts'
import SvgLoader from 'vite-svg-loader'
import ConfigArcoStyleImportPlugin from './plugins/arcoStyleImport'

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        'main': resolve(__dirname, 'index.html'),
        'corp-manager': resolve(__dirname, 'corp-manager/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
      'generated/': `${path.resolve(__dirname, 'generated')}/`,
      'fixture/': `${path.resolve(__dirname, 'fixture')}/`,
    },
    extensions: ['.ts', '.js'],
  },

  define: {
    'process.env': {},
  },

  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          hack: `true; @import (reference) "${resolve(
            'src/assets/style/breakpoint.less',
          )}";`,
        },
        javascriptEnabled: true,
      },
    },
  },

  server: {
    cors: true,
    proxy: {
      '/v1': {
        target: 'http://demo.weila.hk',
        timeout: 20 * 1000,
        // target: 'http://192.168.0.125:8088',
        changeOrigin: true,
        secure: false,
      },
      '/v2': {
        // target: 'http://demo.weila.hk',
        timeout: 20 * 1000,
        target: 'http://192.168.0.125:8090',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  plugins: [

    ViteMockServe({
      mockPath: 'generated/mock',
      enable: false,
    }),

    ViteYaml(),

    // InlineEnum(),

    // DO not use it currently, See `https://github.com/posva/unplugin-vue-router/discussions/429`
    // VueDevTools(),

    UnoCSS(),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts({
      layoutsDirs: 'src/layout',
      defaultLayout: 'default',
    }),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        'vue',
        'vue-i18n',
        '@vueuse/head',
        '@vueuse/core',
        'pinia',
        VueRouterAutoImports,
        {
          from: '@vueuse/components',
          imports: ['UseImage'],
        },
        {
          from: 'clsx',
          imports: ['clsx'],
        },
        // {
        //   from: '@tanstack/vue-form',
        //   imports: ['useForm'],
        // },
      ],
      dts: 'src/auto-imports.d.ts',
      dirs: [
        'src/composables',
        'src/stores',
        'src/layout',
        'src/utils',
        'src/api/instances',
      ],
      vueTemplate: true,
      resolvers: [VueAmapResolver()],
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue', 'md'],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      dts: 'src/components.d.ts',
      resolvers: [
        RadixVueResolver(),
        VueAmapResolver(),
      ],
    }),

    VueMacros({
      plugins: {
        vue: Vue(),
        vueRouter: VueRouter({
          extensions: ['.vue'],
          exclude: ['**/components/**'],
        }),
      },
    }),

    SvgLoader({ svgoConfig: {} }),

    ConfigArcoStyleImportPlugin(),

    mkcert(),

    Unused(),
  ],
})
