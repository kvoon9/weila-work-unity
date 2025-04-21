<script setup lang="ts">
import { toArray } from '@antfu/utils'

type RoutePath = string | string[]

const props = defineProps<{
  routes?: RoutePath
}>()

const route = useRoute()

const visible = computed(() => {
  if (!props.routes)
    return true

  return toArray(props.routes).includes(route.path)
})
</script>

<template>
  <Teleport v-if="visible" defer to="#the-title-right-menu">
    <slot />
  </Teleport>
</template>
