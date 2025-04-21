<script setup lang="ts">
import { toArray } from '@antfu/utils'

const props = withDefaults(defineProps<{
  tabs: {
    name: string
    route: string | string[]
  }[]
  replace?: boolean
}>(), {
  replace: true,
})

const route = useRoute()

const tabs = computed(() => {
  return props.tabs.map(tab => ({
    ...tab,
    route: toArray(tab.route),
  }))
})

const visible = computed(() => {
  return tabs.value.some(tab => tab.route.includes(route.path))
})
</script>

<template>
  <div
    v-if="visible"
    backdrop-blur z1000
    flex="~ justify-around"
    border-b
    backdrop-blur-xl
  >
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.name"
      :replace="props.replace"
      px-4 py-2 cursor-pointer :class="{
        'text-primary border-b-2 border-primary': tab.route.includes(route.path),
      }"
      :to="tab.route[0]"
    >
      {{ tab.name }}
    </NuxtLink>
  </div>
</template>
