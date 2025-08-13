import CryptoJS from 'crypto-js'

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

export const ENCRYPTION_KEY = 'weila-frontend-key' // Replace with a secure encryption key

export const accountHistoryRecord = useLocalStorage('account-history-record', new Map<string, string>(), {
  serializer: {
    read: (v: string) => {
      const decrypted = CryptoJS.AES.decrypt(v, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8)
      return new Map(JSON.parse(decrypted))
    },
    write: (v: Map<string, string>) => {
      const jsonString = JSON.stringify(Array.from(v.entries()))
      return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString()
    },
  },
})

export enum VIP_LEVEL {
  ORG_VIP_FREE = 0, // 0
  ORG_VIP_STANDARD = 0x10, // 16
  ORG_VIP_ULTIMATE = 0x20, // 32
  ORG_VIP_EXTRA = 0x30, // 48
}

export const vipLevelMap = {
  [VIP_LEVEL.ORG_VIP_FREE]: '免费版',
  [VIP_LEVEL.ORG_VIP_STANDARD]: '标准版',
  [VIP_LEVEL.ORG_VIP_ULTIMATE]: '旗舰版',
  [VIP_LEVEL.ORG_VIP_EXTRA]: '至尊版',
}
