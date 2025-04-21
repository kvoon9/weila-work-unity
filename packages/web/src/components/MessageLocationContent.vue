<script setup lang="ts">
import { ElAmap } from '@vuemap/vue-amap'
import { shallowRef } from 'vue'

const props = defineProps<{
  content: any
}>()

const { t } = useI18n()

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
  <TheModal :title="t('location-detail')" classes="container">
    <div w-100>
      <header p2 text-left>
        <div truncate text-2xl font-black>
          {{ content.name }}
        </div>
        <div truncate>
          {{ content.address }}
        </div>
      </header>
      <img
        :src="content.image" alt="location info"
        h-75 w-100 object-cover object-center
      >
    </div>
    <template #content>
      <div relative h70vh w-full>
        <ElAmap :center="location" :zoom="17" absolute inset-0 @init="m => map = m" />
      </div>
    </template>
    <template #footer>
      <div text-right>
        <div text-2xl font-black>
          {{ content.name }}
        </div>
        <div>
          {{ content.address }}
        </div>
      </div>
    </template>
  </TheModal>
</template>
