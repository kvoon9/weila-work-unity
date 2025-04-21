<script setup lang="ts">
import { fileIconsMap } from '~/shared/states'

const props = defineProps<{
  content: {
    image: string
    file_url: string
    file_size: number // kb
    file_name: string
  }
}>()

const ext = computed(() => props.content.file_url.split('.').at(-1)!)

const filesize = computed(() => {
  const sizeInMB = props.content.file_size / 1024 / 1024
  return `${sizeInMB.toFixed(2)} MB`
})
</script>

<template>
  <button class="flex space-x-2 p-4 text-left" @click="() => openWindow(content.file_url)">
    <section>
      <div class="max-w-20 md:max-w-80 break-words text-wrap text-sm">
        {{ content.file_name }}
      </div>
      <div class="text-lg text-neutral-500 text-sm">
        {{ filesize }}
      </div>
    </section>
    <img :src="fileIconsMap[ext]?.default || fileIconsMap.unkown?.default" :alt="content.file_name" class="w-20 h-20">
  </button>
</template>
