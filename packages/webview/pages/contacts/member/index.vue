<script setup lang="ts">
definePageMeta({
  layout: 'home',
  alias: '/contacts',
})

appHead.value = '通讯录'
</script>

<template>
  <MemberList />
</template>
