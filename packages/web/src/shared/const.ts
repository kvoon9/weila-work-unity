export const isLargeScreen = useMediaQuery('(min-width: 1024px)')

export const defaultArcoSettings = reactive({
  colorWeak: false,
  navbar: true,
  menu: true,
  topMenu: false,
  // hideMenu: useLocalStorage('isHideMenu', computed(() => !isLargeScreen.value)),
  hideMenu: false,
  menuCollapse: false,
  footer: false,
  themeColor: '#165DFF',
  menuWidth: 220,
  globalSettings: false,
  device: 'desktop',
  tabBar: false,
  menuFromServer: false,
  serverMenu: [] as any[],
})

export const AMapKeys = {
  js: '590d2eef2313b156f80a2936df9babad',
  secert: 'cdc03a7b9de2a9ca188da9ab76c4b450',
  regeo: '',
}

export enum VIP_LEVEL {
  ORG_VIP_FREE = 0, // 0
  ORG_VIP_STANDARD = 0x10, // 16
  ORG_VIP_ULTIMATE = 0x20, // 32
  ORG_VIP_EXTRA = 0x30, // 48
}

export const appid = computed(() => import.meta.env.DEV ? '102036' : '102065')
export const appkey = computed(() => import.meta.env.DEV ? 'b3c658bd2e637c65efb134fb381d4a18' : '3c227f2cbc2084ebdd9617fd283c42c7')
