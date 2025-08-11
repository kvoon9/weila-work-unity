import type { UserModule } from './types'
import { Notification } from '@arco-design/web-vue'
import * as v from 'valibot'
import { setupLayouts } from 'virtual:generated-layouts'
import { createWebHashHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import globalComponents from '~/components'
import App from './App.vue'
import { vVip } from './directives/v-vip'
import { setup } from './setup'

import '@valibot/i18n/zh-CN'
// Styles are imported via arco-plugin. See config/plugin/arcoStyleImport.ts in the directory for details
// 样式通过 arco-plugin 插件导入。详见目录文件 config/plugin/arcoStyleImport.ts
// https://arco.design/docs/designlab/use-theme-package
import '~/assets/style/global.less'
import 'cropperjs/dist/cropper.min.css'
import '~/styles/main.css'

import 'viewerjs/dist/viewer.css'
import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'

setup(
  // the root component
  App,
  // vue-router options
  {
    history: createWebHashHistory(),
    routes: setupLayouts(routes),
    scrollBehavior() {
      return { top: 0 }
    },
  },
  // function to have custom setups
  (ctx) => {
    const { app } = ctx
    // install all modules under `modules/`
    Object.values(import.meta.glob<{ install: UserModule }>('./modules/*.ts', { eager: true }))
      .forEach(i => i.install?.(ctx))

    // @ts-expect-error type error
    app.use(globalComponents)

    // See: https://arco.design/vue/component/notification#API
    Notification._context = app._context

    app.config.errorHandler = (error: any, instance, info) => {
      Notification.error({
        title: (error.message || error.stack) ? String(error?.message) + String(error?.stack) : String(error),
        content: info,
      })

      console.error('app error', [error, instance, info])
    }

    app.directive('vip', vVip)
  },
)

v.setGlobalConfig({
  lang: 'zh-CN',
})
