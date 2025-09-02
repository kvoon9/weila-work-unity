<script setup lang="ts">
</script>

<template>
  <div h-full grid="~ rows-[min-content_1fr]">
    <div>
      <Navbar />
    </div>
    <div flex of-hidden>
      <SideBar shrink-0 border-r />
      <div flex-1 of-auto>
        <router-view />
      </div>
    </div>
  </div>
</template>
