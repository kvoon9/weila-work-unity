<script setup lang="ts">
definePageMeta({
  layout: 'back',
})

appHead.value = '修改服务号'

// 获取路由参数
// const sid = useRouteParams<number>('sid', 0, { transform: Number })
const ssid = useRouteParams<number>('ssid', 0, { transform: Number })
</script>

<template>
  <EditServiceForm :ssid="ssid" />
</template>
