<script setup lang="ts">
import NavBar from '~/components/navbar/index.vue'
</script>

<template>
  <div h-full grid="~ rows-[min-content_1fr]">
    <div>
      <NavBar />
    </div>
    <div flex of-hidden>
      <div flex-1 of-auto>
        <router-view />
      </div>
    </div>
  </div>
</template>
