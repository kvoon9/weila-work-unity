<script setup lang="ts">
defineProps<{
  open: boolean
}>()
</script>

<template>
  <div v-if="open" flex="~ center" bg-neutral-10 absolute inset-0 z-100 bg-op-10 backdrop-blur-sm>
    <div text-neutral-500>
      加载中...
    </div>
  </div>
</template>
