import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    layout?: string
    menu?: {
      label: string
      icon: string
      order?: number
    }
    roles?: string[] // Controls roles that have access to the page
    requiresAuth?: boolean // Whether login is required to access the current page (every route must declare)
    // icon?: string // The icon show in the side menu
    // locale?: string // The locale name show in side menu and breadcrumb
    // hideInMenu?: boolean // If true, it is not displayed in the side menu
    // hideChildrenInMenu?: boolean // if set true, the children are not displayed in the side menu
    // activeMenu?: string // if set name, the menu will be highlighted according to the name you set
    // noAffix?: boolean // if set true, the tag will not affix in the tab-bar
    // ignoreCache?: boolean // if set true, the page will not be cached
    // isRootLevel?: boolean // if set true, the menu will be displayed at the root level
    // firstChildPath?: string
  }
}
