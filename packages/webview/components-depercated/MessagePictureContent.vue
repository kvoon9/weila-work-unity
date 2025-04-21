<script setup lang="ts">
import { UseImage } from '@vueuse/components'
import { LucideImageOff } from 'lucide-vue-next'
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.css'

defineProps<{
  classes: string | string[]
  content: {
    image: string
  }
}>()

const visible = ref(false)

const imageRef = templateRef<any>('imageRef')

onMounted(() => {
  const viewer = new Viewer(imageRef.value.$el, {
    inline: false,
    viewed() {
      viewer.zoomTo(1)
    },
  })
})
</script>

<template>
  <UseImage
    ref="imageRef"
    :class="classes" class="bg-neutral-300 max-w-[70vw] md:max-size-80 min-size-60 rounded"
    :src="`${content.image}?x-oss-process=style/hw160`" @click="visible = true"
  >
    <template #error>
      <div class="bg-neutral-300 flex flex-col py-4 items-center rounded">
        <LucideImageOff class="size-20 text-white" />
        <div class="text-white">
          图片加载失败
        </div>
      </div>
    </template>
  </UseImage>
</template>
