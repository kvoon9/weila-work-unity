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
