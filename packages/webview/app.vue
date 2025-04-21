<script setup lang="ts">
import { initAMapApiLoader } from '@vuemap/vue-amap'

// import VConsole from 'vconsole'
import { AMapKeys, breakpoints } from '~/shared/const'
import { appHead } from './shared/states'

import './styles/global.css'
import 'nprogress/nprogress.css'

// if (
//   (import.meta.dev || import.meta.env.MODE === 'staging')
//   && import.meta.browser
//   && !import.meta.url.includes('localhost')
// ) {

// new VConsole()
// }

import 'viewerjs/dist/viewer.css'
// Polyfill
import 'core-js/features/array/at'

initAMapApiLoader({
  key: AMapKeys.js,
  Loca: {
    version: '2.0.0',
  }, // 如果需要使用loca组件库，需要加载Loca
})

appHead.value = '微喇企业管理系统'

const { open, title, description } = useToast()

// no scrollbar in dev mode
const { load, unload } = useStyleTag(`
  ::-webkit-scrollbar {
    display: none;
  }
`, {
  immediate: false,
})

watchEffect(() => {
  if (import.meta.dev && breakpoints.smaller('sm').value)
    load()
  else
    unload()
})
</script>

<template>
  <div v-if="open" max-w-90vw rounded px2 py1 z9999 fixed position-x-center top-30 bg-black text-white>
    {{ `${[title, description].filter(Boolean).join(':')}` }}
  </div>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
