<script setup lang="ts">
import { ElAmap } from '@vuemap/vue-amap'
import { UseImage } from '@vueuse/components'
import { shallowRef } from 'vue'

const props = defineProps<{
  content: any
}>()

const map = shallowRef<AMap.Map | undefined>(undefined)
const marker = shallowRef<AMap.Marker | undefined>(undefined)

const location = computed<[number, number]>(() => [props.content.longitude, props.content.latitude])

watch(map, (map) => {
  if (!map)
    return

  marker.value = new AMap.Marker({
    position: location.value,
  })
  map.add(marker.value)
})
</script>

<template>
  <Dialog class="container">
    <DialogTrigger>
      <div class="max-w-[60vw] bg-white rounded">
        <header class="p-2 text-left">
          <div class="truncate text-2xl font-black">
            {{ content.name }}
          </div>
          <div class="truncate">
            {{ content.address }}
          </div>
        </header>
        <UseImage :src="content.image" class="h-[14rem] w-[20rem] object-cover object-center">
          <template #error>
            <div class="bg-neutral-300 flex justify-center py-3">
              <LucideMapPin class="size-20 text-white" />
            </div>
          </template>
        </UseImage>
      </div>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>位置信息</DialogTitle>
        <DialogDescription>
          位置信息
        </DialogDescription>
      </DialogHeader>
      <div class="relative h-[70vh] bg-red-400">
        <ElAmap
          :center="location"
          :zoom="17"
          class="absolute inset-0" @init="m => map = m"
        />
      </div>
      <DialogFooter>
        <div class="text-right">
          <div class="text-2xl font-black">
            {{ content.name }}
          </div>
          <div>
            {{ content.address }}
          </div>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
