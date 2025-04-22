<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'
import { useMyBusiness } from '@weila/network'

definePageMeta({
  layout: 'back',
})

const { data: myBusiness } = useMyBusiness($v2)

// appHead.value = '服务点'
watchEffect(() => {
  if (myBusiness.value) {
    appHead.value = myBusiness.value.merchant.name
  }
})

const ssid = useRouteParams<number>('ssid', 0, { transform: Number })
const sid = useRouteParams<number>('sid', 0, { transform: Number })

const { data: pointListData } = useBusinessPointList(reactive({
  sid: computed(() => sid.value),
}))

const search = useRouteQuery('q', '')

const points = computed(() => {
  if (!pointListData.value?.points)
    return []
  return pointListData.value.points.filter(point => point.name.includes(search.value))
})
</script>

<template>
  <div class="grid gap-4 p-4">
    <div flex="~ items-center" border rounded-lg p1 bg-white drop-shadow>
      <input v-model="search" type="text" placeholder="服务点名称" class="grow-1 p-2" focus:outline-none>
      <Icon v-if="search" name="ph:x" :disabled="!search" size-4 mx2 @click="search = ''" />
    </div>
    <div grid="~ cols-2 gap-2">
      <NuxtLink :to="`/workbench/service/${ssid}-${sid}/point/create`" col-span-1 grow-1 text-center btn-primary space-x-2>
        <Icon name="ph:map-pin" />
        <span>创建服务点</span>
      </NuxtLink>
    </div>
    <Empty v-if="points.length === 0" />
    <NuxtLink
      v-for="point in points"
      :key="point.id"
      :to="`./point/${point.id}-${point.id}/staff`"
      class="rounded-lg border p-4"
      flex="~ justify-between items-center"
      :class="{
        'border-primary-300 bg-primary-100/12': search,
      }"
      drop-shadow bg-white
    >
      <div font-semibold>
        {{ point.name }}
      </div>
      <div text-sm color-neutral-500>
        人数 {{ point.staff_count || 0 }}
      </div>
    </NuxtLink>
  </div>
</template>
