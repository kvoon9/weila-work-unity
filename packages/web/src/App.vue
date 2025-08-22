<script lang="ts" setup>
import en from '@arco-design/web-vue/es/locale/lang/en-us'
import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { computed } from 'vue'

const { locale } = useI18n()

const arcoLang = computed(() => ({
  'zh-CN': zhCN,
  en,
}[locale.value]))

const { outdated, update } = useBundleInfo()

watchEffect(() => outdated.value && window.location.reload())

onBeforeRouteUpdate(() => {
  update()
})
</script>

<template>
  <a-config-provider :locale="arcoLang">
    <router-view />
    <VueQueryDevtools />
  </a-config-provider>
</template>
