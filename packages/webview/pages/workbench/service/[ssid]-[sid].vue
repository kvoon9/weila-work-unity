<script setup lang="ts">
const ssid = useRouteParams('ssid', 0, { transform: Number })
const sid = useRouteParams('sid', 0, { transform: Number })
const route = useRoute()

const tabs = computed(() => [
  {
    name: '服务点',
    route: `/workbench/service/${ssid.value}-${sid.value}/point`,
  },
  {
    name: '客服',
    route: `/workbench/service/${ssid.value}-${sid.value}/staff`,
  },
])
</script>

<template>
  <div>
    <RouteTabs :tabs />
    <NuxtPage />
    <TheTitleRightMenu :visible="tabs.map((tab) => tab.route)">
      <NuxtLink
        v-if="tabs.some(tab => tab.route === route.path)"
        :to="`/workbench/service/${ssid}-${sid}/details`"
      >
        <Icon name="ph:gear" />
      </NuxtLink>
    </TheTitleRightMenu>
  </div>
</template>
