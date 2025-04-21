<script setup lang="ts">
import TheTitle from '~/components/TheTitle.vue'
</script>

<template>
  <div h-full>
    <TheTitle back close z-100 />
    <div h-full pt15 w100vw of-x-scroll>
      <slot />
    </div>
  </div>
</template>
