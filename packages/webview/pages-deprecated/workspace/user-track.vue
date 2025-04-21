<script setup lang="ts">
import type { GetAddressListModel, LocationGetRegeoModel, LocationGetTrackModel } from '~/fixture/mock'
import { isNull, isNumber, isUndefined } from '@antfu/utils'
import { useQuery } from '@tanstack/vue-query'
import { ElAmap } from '@vuemap/vue-amap'
import { ElAmapLoca, ElAmapLocaLine } from '@vuemap/vue-amap-loca'
import { LucideUser } from 'lucide-vue-next'
import { nanoid } from 'nanoid'
import { TreeItem, TreeRoot } from 'reka-ui'
import { useToast } from '~/components/ui/toast'
import { weilaApiUrl } from '~/plugins/api'

definePageMeta({
  layout: 'dashboard',
  breadcrumb: [
    {
      name: '工作台',
      href: '/workspace',
    },
  ],
  name: '用户轨迹',
})

const { $v1 } = useNuxtApp()

const { org_num } = useCorp()

const isDatePickerOpen = ref(false)
const formattedDate = ref<string>()
const selectedDate = ref<any>()
watchEffect(() => {
  if (selectedDate.value !== undefined)
    isDatePickerOpen.value = false
})
watch(isDatePickerOpen, (open) => {
  if (open)
    selectedDate.value = undefined
})

const selectedUser = ref()
const isSelectUserOpen = ref(false)

const { data } = await useAsyncData(
  'user track',
  () => $v1<GetAddressListModel['data']>(weilaApiUrl('/corp/web/get-address-list'), {
    body: { org_num: org_num.value },
  }),
  {
    transform({ address_list: data }) {
      return [
        ...data.depts,
        ...data.members.map(i => ({ ...i, id: i.user_id })),
      ]
    },
  },
)

// @ts-expect-error user_id type error
const defaultExpanded = computed(() => (data.value || []).filter(i => !i.user_id).map(i => String(i.id)))

const { toast } = useToast()
const { data: tracks } = useQuery({
  enabled: computed(() => Boolean(selectedUser.value) && selectedDate.value !== undefined),
  refetchOnWindowFocus: false,
  queryKey: ['user track', computed(() => selectedUser.value?.user_id), formattedDate],
  queryFn: async () => {
    if (formattedDate.value === '选择一个日期')
      return

    return $v1<LocationGetTrackModel['data']>('/corp/web/location-get-track', {
      body: { user_id: selectedUser.value.user_id, date: formattedDate.value },
    }).then((i) => {
      if (!i.tracks.length)
        toast({ title: '无数据' })

      return i.tracks.sort((a, b) => b.created - a.created)
    })
  },
})

$inspect(tracks)

const trackFeatureCollection = computed<GeoJSON.FeatureCollection<GeoJSON.LineString>>(() => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: tracks.value?.map(track => [track.longitude, track.latitude]) || [],
      },
    },
  ],
}))

$inspect(trackFeatureCollection)

const trackVisible = ref(true)
const drawerVisible = ref(false)
const zoom = ref(12)
const center = ref([121.59996, 31.197646])
const map = shallowRef<AMap.Map | null>(null)
const markers = shallowRef<AMap.Marker[]>([])
const infoWindow = shallowRef<AMap.InfoWindow | undefined>(undefined)
const selectedMarker = shallowRef<AMap.Marker | null>(null)

watch(selectedMarker, (marker) => {
  if (!marker)
    return

  const pos = marker.getPosition()

  if (!pos)
    return

  const { lng, lat } = pos

  if (!isNumber(lng) || !isNumber(lat))
    return

  drawerVisible.value = false
  map.value?.setCenter([lng, lat])
})

$inspect(selectedMarker)

const { data: regeoInfo } = useQuery({
  enabled: computed(() => Boolean(selectedMarker.value?.getExtData().id)),
  queryKey: [
    'regeo',
    weilaApiUrl('/corp/web/location-get-regeo'),
    computed(() => selectedMarker.value?.getExtData().id),
  ],
  queryFn: async () => {
    if (!selectedMarker.value)
      return

    const pos = selectedMarker.value?.getPosition()

    if (!pos)
      throw new Error('No position')

    return $v1<LocationGetRegeoModel['data']>(weilaApiUrl('/corp/web/location-get-regeo'), {
      body: {
        longitude: pos?.getLng(),
        latitude: pos?.getLat(),
      },
    }).then(i => i.regeo)
  },
})

watch(regeoInfo, (info) => {
  if (!info) {
    infoWindow.value?.remove()
    infoWindow.value = undefined
    return
  }

  const content = `
    <div color-black>
      <h3 class="text-lg font-semibold mb-2">位置信息</h3>
      <div class="mb-2 ">
        ${info.formatted_address}
      </div>
      <div>
        <span mr2>时间</span> <span>${new Date(selectedMarker.value?.getExtData().created * 1000).toLocaleString()}</span>
      </div>
      <div>
        <span mr2>经度</span> <span>${selectedMarker.value?.getExtData().longitude}</span>
      </div>
      <div>
        <span mr2>纬度</span> <span>${selectedMarker.value?.getExtData().latitude}<br></span>
      </div>
    </div>
  `

  nextTick(() => {
    if (!infoWindow.value) {
      infoWindow.value = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -30) })
    }

    if (map.value) {
      const { longitude, latitude } = selectedMarker.value?.getExtData()
      infoWindow.value?.open(map.value, [longitude, latitude])
      infoWindow.value?.setContent(content)
    }
  })
})

const layerStyle = ref({
  color: '#41ab5d',
  lineWidth: 2,
  dashArray: [10, 0, 10, 0],
})

watch(tracks, (val) => {
  if (!val?.length) {
    markers.value = []
    return
  }

  // TODO: improve it
  //   try {
  //   const markerMap = new Map<string, AMap.Marker>()

  //   for (const { longitude, latitude, created } of val.reverse()) {
  //     const key = `${longitude}_${latitude}`

  //     // generate markers
  //     if (!markerMap.has(key)) {
  //       const marker = new AMap.Marker({
  //         position: [longitude, latitude],
  //         extData: {
  //           id: nanoid(),
  //           userId: selectedUser.value.user_id,
  //           created,
  //           longitude,
  //           latitude,
  //         },
  //       })

  //       markerMap.set(key, marker)

  //       marker.on('click', () => selectMarker(marker))
  //     }
  //   }

  //   markers.value = Array.from(markerMap.values())
  // }

  try {
    // generate markers
    markers.value = val.map(({ longitude, latitude, created }) => {
      const marker = new AMap.Marker({
        position: [longitude, latitude],
        extData: {
          id: nanoid(),
          userId: selectedUser.value.user_id,
          created,
          longitude,
          latitude,
        },
      })

      marker.on('click', () => selectedMarker.value = marker)

      return marker
    })
  }
  catch (error) {
    console.error('Error adding markers:', error)
  }
})

// Render markers to map
watch(markers, (val, oldVal) => {
  if (oldVal.length) {
    oldVal?.forEach((marker) => {
      map.value?.remove(marker)
      marker.remove()
    })
  }

  const renderMarker = async (map: AMap.Map) => {
    for (let i = 0; i < val.length; i++) {
      const marker = val[i]
      map.add(marker)
    }

    if (markers.value) {
      map.setFitView(
        [
          ...markers.value,
          infoWindow.value,
        ]
          .filter(i => !isUndefined(i) && !isNull(i)),
      )
    }

    return true
  }

  if (map.value) {
    renderMarker(map.value)
  }
  else {
    const { stop } = watch(map, (m) => {
      if (m)
        renderMarker(m).then(stop)
    }, { immediate: true })
  }
})

function selectMarker(marker: AMap.Marker) {
  const {
    id,
    longitude,
    latitude,
  } = marker.getExtData()

  if (
    id === selectedMarker.value?.getExtData().id
  ) {
    selectedMarker.value = null
    selectedMarker.value = marker
    // refetchRegeo() // no need to refetch ?
    if (!infoWindow.value?.getIsOpen())
      infoWindow.value?.open(map.value!, [longitude, latitude])
    else
      infoWindow.value?.close()
  }
  else {
    selectedMarker.value = marker
  }
}
</script>

<template>
  <div class="h-full w-full space-y-4">
    <div class="flex max-md:flex-col gap-4 md:items-center">
      <DatePicker v-model:open="isDatePickerOpen" v-model:formated-value="formattedDate" v-model:value="selectedDate" default="today" class="w-full md:w-56" />

      <Popover v-model:open="isSelectUserOpen">
        <PopoverTrigger>
          <Button
            variant="outline" class="md:w-fit w-full flex justify-start " :class="
              !selectedUser ? 'text-gray-600' : ''
            "
          >
            <LucideUser class="mr-2" />
            {{ selectedUser ? selectedUser.name : '选择成员' }}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" class="max-h-[350px] overflow-scroll">
          <!-- @vue-expect-error type error -->
          <TreeRoot
            v-slot="{ flattenItems }"
            class="list-none select-none bg-white text-stone-700 rounded-lg shadow-sm text-sm font-medium"
            :items="data"
            :get-key="(item) => String(item.id)"
            :default-expanded
            :get-children="(item) => item.members?.length ? item.members : undefined"
          >
            <!-- <h2 class="font-semibold text-sm text-stone-400 px-2 pt-1 pb-3">
            Directory Structure
          </h2> -->
            <TreeItem
              v-for="item in flattenItems "
              v-slot="{ isExpanded }"
              :key="item._id"
              :style="{ 'padding-left': `${item.level - 0.5}rem` }"
              v-bind="item.bind"
              class="flex items-center py-2 px-2 my-0.5 rounded outline-none focus:ring-grass8 focus:ring-2 data-[selected]:bg-grass4"
              :class="item.hasChildren ? 'text-primary-500' : ''"
              @click="() => {
                // @ts-expect-error type error
                if (item.value?.user_id) {
                  selectedUser = item.value
                  isSelectUserOpen = false
                }
              }"
            >
              <div class="pl-2">
                <span
                  :class="item.hasChildren
                    ? 'bg-primary-100/50'
                    : 'bg-neutral-100'"
                  class="rounded px-2 py-1 text-sm text-opacity-75"
                >
                  {{ item.hasChildren ? '部门' : '成员' }}
                </span>

                {{ item.value.name }}
                <!-- @vue-expect-error type error -->
                <span v-if="item.value?.members?.length" class="text-neutral-400">
                  <!-- @vue-expect-error type error -->
                  ({{ item.value.members.length }})
                </span>
                <template v-if="item.hasChildren">
                  <LucideChevronRight v-if="!isExpanded" class="inline-block size-4" />
                  <LucideChevronDown v-else class="inline-block size-4" />
                </template>
              </div>
            </TreeItem>
          </TreeRoot>
        </PopoverContent>
      </Popover>
    </div>
    <div class="h-full w-full rounded border relative">
      <ElAmap :center="center" :zoom="zoom" class="relative h-full w-full" @init="(m) => map = m">
        <ElAmapLoca>
          <ElAmapLocaLine :visible="trackVisible" :source-data="trackFeatureCollection" :layer-style="layerStyle" />
        </ElAmapLoca>

        <Drawer v-model:open="drawerVisible">
          <DrawerTrigger v-if="markers?.length" class="absolute right-4 top-4">
            <Button>
              轨迹记录
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>用户轨迹</DrawerTitle>
              <DrawerDescription>查看用户轨迹</DrawerDescription>
            </DrawerHeader>

            <ul class="max-h-[50vh] overflow-scroll ">
              <li v-for="marker, key in markers" :key class="border rounded p-4 flex items-end">
                <div class="flex-1">
                  <span>{{ new Date(marker.getExtData().created * 1000).toLocaleString() }}</span>
                  <br>
                  <span mr2>经度</span> <span>{{ marker.getExtData().longitude }}</span>
                  <br>
                  <span mr2>维度</span> <span>{{ marker.getExtData().latitude }}<br></span>
                </div>
                <Button
                  type="primary" size="sm" @click="() => selectMarker(marker)"
                >
                  查看
                </Button>
              </li>
            </ul>

            <DrawerFooter>
              <DrawerClose />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </ElAmap>
    </div>
  </div>
</template>
