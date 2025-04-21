/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface EventTarget extends __EventTarget {
  // for antd and tanstack/form
  value: any
}
