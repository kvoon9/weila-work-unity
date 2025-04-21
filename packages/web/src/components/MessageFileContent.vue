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
  <button flex gap2 p4 text-left @click="() => openWindow(content.file_url)">
    <section>
      <div max-w-80 break-words text-wrap text-lg>
        {{ content.file_name }}
      </div>
      <div text-lg text-neutral>
        {{ filesize }}
      </div>
    </section>
    <img :src="fileIconsMap[ext].default" :alt="content.file_name" w18>
  </button>
</template>
