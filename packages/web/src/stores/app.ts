import type { NotificationReturn } from '@arco-design/web-vue/es/notification/interface'
import type { RouteRecordNormalized } from 'vue-router'
import { Notification } from '@arco-design/web-vue'
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { getMenuList } from '~/api/user'
import { defaultArcoSettings } from '~/shared/const'

interface AppState {
  colorWeak: boolean
  navbar: boolean
  menu: boolean
  topMenu: boolean
  hideMenu: boolean
  menuCollapse: boolean
  footer: boolean
  themeColor: string
  menuWidth: number
  globalSettings: boolean
  device: string
  tabBar: boolean
  menuFromServer: boolean
  serverMenu: any[]
  [key: string]: unknown
}

export const useAppStore = defineStore('app', () => {
  let state = reactive({ ...defaultArcoSettings })

  const appCurrentSetting = computed(() => ({ ...state }))
  const appDevice = computed(() => state.device)
  const appAsyncMenus = computed(() => state.serverMenu as unknown as RouteRecordNormalized[])

  function updateSettings(partial: Partial<AppState>) {
    state = { ...state, ...partial }
  }

  function toggleDevice(device: string) {
    state.device = device
  }

  function toggleMenu(value: boolean) {
    state.hideMenu = value
  }

  async function fetchServerMenuConfig() {
    let notifyInstance: NotificationReturn | null = null
    try {
      notifyInstance = Notification.info({
        id: 'menuNotice',
        content: 'loading',
        closable: true,
      })
      const { data } = await getMenuList()
      state.serverMenu = data

      notifyInstance = Notification.success({
        id: 'menuNotice',
        content: 'success',
        closable: true,
      })
    }
    catch {
      notifyInstance = Notification.error({
        id: 'menuNotice',
        content: 'error',
        closable: true,
      })
    }
    finally {
      // eslint-disable-next-line no-console
      console.log('notifyInstance', notifyInstance)
    }
  }
  function clearServerMenu() {
    state.serverMenu = []
  }

  return {
    ...state,
    appCurrentSetting,
    appDevice,
    appAsyncMenus,
    updateSettings,
    toggleDevice,
    toggleMenu,
    fetchServerMenuConfig,
    clearServerMenu,
  }
})
