import type { UserModule } from '~/types'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'

export const install: UserModule = ({ app }) => {
  app.use(ArcoVue, {})
  app.use(ArcoVueIcon)
}
