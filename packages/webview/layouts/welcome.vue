<script setup lang="ts">
import LoginIntroImage from 'assets/images/login-intro.png'
</script>

<template>
  <div class="w-full h-full lg:flex lg:min-h-[600px] xl:min-h-[800px]" pt15 :class="{ pt15: false }">
    <TheTitle lg:hidden close />
    <div class="flex flex-1 items-center justify-center py-2 md:py-12 px-2">
      <slot />
    </div>
    <div class="hidden bg-muted lg:block">
      <img
        alt="Image"
        width="1309"
        height="720"
        class="object-fill w-fit h-screen dark:brightness-[0.2] dark:grayscale"
        :src="LoginIntroImage"
      >
    </div>
  </div>
</template>
