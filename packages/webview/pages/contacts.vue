<script setup lang="ts">
definePageMeta({
  layout: 'home',
})

appHead.value = '通讯录'

const tabs = [
  {
    name: '成员',
    route: ['/contacts/member', '/contacts'],
  },
  {
    name: '部门',
    route: '/contacts/dept',
  },
  {
    name: '群组',
    route: '/contacts/group',
  },
]
</script>

<template>
  <div>
    <RouteTabs :tabs />
    <NuxtPage />
  </div>
</template>
