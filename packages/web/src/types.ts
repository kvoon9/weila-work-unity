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

export interface TreeNodeData {
  title: string
  key: string
  selectable?: boolean
  checkable?: boolean
  isLeaf?: boolean
  children?: TreeNodeData[]
  disableCheckbox?: boolean
}

export interface Corp {
  address_ver: number
  avatar: string
  created: number
  creator: number
  dept_cnt: number
  device_cnt: number
  device_ver: number
  group_cnt: number
  group_ver: number
  intro: string
  member_cnt: number
  name: string
  num: number
  vip: number
  vip_expired: number
}

export interface SelfInfo {
  user_id: number
  user_num: string
  job_num: string
  sex: number
  name: string
  avatar: string
  is_admin: number
  dept_id: number
  phone: string
  country_code: string
  state: number
  type: number
  tts: number
  loc_share: number
  track: number
  group_count: number
  created: number
}
