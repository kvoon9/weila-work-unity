<script setup lang="ts">
defineProps<{
  title: string
  classes?: string | string[]
}>()
const open = defineModel('open', { default: false })
</script>

<template>
  <slot />

  <a-modal v-model:visible="open" :title>
    <slot name="content" />
  </a-modal>
</template>
