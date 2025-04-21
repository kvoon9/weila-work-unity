<script setup lang="ts">
import { appHead } from '~/shared/states'
import { bridge } from '~/utils/bridge'

withDefaults(defineProps<{
  home?: boolean
  back?: boolean
  close?: boolean
}>(), {
  home: false,
  back: false,
  close: false,
})

const route = useRoute()

const rightMenuSlot = templateRef('rightMenu')

const rightMenuGroupClass = computed(() => {
  return rightMenuSlot.value?.innerHTML
    ? 'space-x-2'
    : ''
})

$inspect(rightMenuGroupClass)
</script>

<template>
  <div backdrop-blur-xl w-full fixed top-0 h15 border-b flex justify-center items-center>
    <div
      v-if="back"
      absolute left-2 mt1 flex space-x-4 items-center
      @click="() => {
        if (route.meta.layout === 'home') {
          bridge.exit()
        }
        else {
          $router.back()
        }
      }"
    >
      <Icon name="carbon:arrow-left" />
      <NuxtLink v-if="home" to="/contacts">
        <Icon name="carbon:home" />
      </NuxtLink>
    </div>
    <div text-center>
      {{ appHead }}
    </div>
    <div absolute position-y-center :class="rightMenuGroupClass" right-4 flex items-center bg-neutral1:60 px3 py1 rounded-full>
      <!-- eslint-disable-next-line vue/no-unused-refs -->
      <div id="the-title-right-menu" ref="rightMenu" />
      <Icon v-if="close" name="carbon:close" size-6 @click="() => bridge.exit()" />
    </div>
  </div>
</template>
