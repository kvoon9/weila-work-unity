<script setup lang="ts">
// const el = templateRef<HTMLElement>('el')
// const { y } = useScroll(el)

// nextTick(() => {
//   console.log('y.value', y.value)
// })
</script>

<template>
  <div h-full>
    <TheTitle close z-100 />
    <div h100vh pb20 pt15 of-scroll w100vw of-x-scroll>
      <slot />
    </div>
    <TheNav fixed bottom-0 />
  </div>
</template>
