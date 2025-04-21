import type { ValidatedError } from '@arco-design/web-vue/es/form/interface'

import type { App } from 'vue'
import type { Router, RouteRecordRaw } from 'vue-router'

export type UserModule = (ctx: {
  isClient: boolean
  route: RouteRecordRaw[]
  router: Router
  app: App<Element>
}) => void

export interface OnSubmitParams<T extends Record<string, any>> {
  values: T
  errors: Record<keyof T, ValidatedError | undefined>
}
