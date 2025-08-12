<script setup lang="ts">
import { shallowRef } from 'vue'

defineProps<{
  classes: string | string[]
  content: {
    image: string
  }
}>()

const visible = shallowRef(false)
</script>

<template>
  <img :class="classes" :src="`${content.image}?x-oss-process=style/hw160`" max-size-80 min-size-60 @click="visible = true">
  <a-image-preview
    v-model:visible="visible"
    :src="content.image"
  />
</template>
