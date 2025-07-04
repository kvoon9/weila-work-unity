<script setup lang="ts">
import type { RegeoModel, UserTrackModel } from '~/api/track'
import { isNull, isNumber, isUndefined } from '@antfu/utils'
import { Message } from '@arco-design/web-vue'
import { useQuery } from '@tanstack/vue-query'
import { ElAmap } from '@vuemap/vue-amap'
import { ElAmapLoca, ElAmapLocaLine } from '@vuemap/vue-amap-loca'
import { nanoid } from 'nanoid'
import { ref as deepRef, shallowRef } from 'vue'
import { weilaApiUrl } from '~/api'

const { t } = useI18n()

const selectedUserId = shallowRef()
const selectedDate = shallowRef('')

const contactStore = useContactStore()
const { data: contact } = storeToRefs(contactStore)
const { data: tracks } = useQuery<UserTrackModel[]>({
  enabled: computed(() => Boolean(selectedUserId.value) && Boolean(selectedDate.value)),
  refetchOnWindowFocus: false,
  queryKey: ['user track', selectedUserId, selectedDate],
  queryFn: ({ queryKey }) => weilaFetch('/corp/web/location-get-track', {
    body: { user_id: queryKey[1], date: queryKey[2] },
  }).then((i: any) => i.tracks.sort((a: any, b: any) => b.created - a.created)),
})

watchDebounced(tracks, (val) => {
  if (!val?.length)
    Message.info(t('no-data'))
}, {
  debounce: 500,
})

const data = computed(() => {
  return [
    ...(contact.value?.depts || []),
    ...(contact.value?.members || []),
  ]
})

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

const trackVisible = shallowRef(true)
const drawerVisible = shallowRef(false)
const zoom = shallowRef(12)
const center = shallowRef([121.59996, 31.197646])
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

  if (!infoWindow.value) {
    infoWindow.value = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -30) })
  }

  if (map.value)
    infoWindow.value.open(map.value, [lng, lat])
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

    return weilaFetch(weilaApiUrl('/corp/web/location-get-regeo'), {
      body: {
        longitude: pos?.getLng(),
        latitude: pos?.getLat(),
      },
    }).then((i: any) => i.regeo as RegeoModel)
  },
})

watch(regeoInfo, (info?: RegeoModel) => {
  if (!info)
    return

  const content = `
    <div color-black>
      <h3 class="text-lg font-semibold mb-2">${t('location-detail')}</h3>
      <div class="mb-2 ">
        ${info.formatted_address}
      </div>
      <div>
        <span mr2>${t('time')}</span> <span>${new Date(selectedMarker.value?.getExtData().created * 1000).toLocaleString()}</span>
      </div>
      <div>
        <span mr2>${t('longitude')}</span> <span>${selectedMarker.value?.getExtData().longitude}</span>
      </div>
      <div>
        <span mr2>${t('latitude')}</span> <span>${selectedMarker.value?.getExtData().latitude}<br></span>
      </div>
    </div>
  `

  nextTick(() => {
    infoWindow.value?.setContent(content)
  })
})

const layerStyle = deepRef({
  color: '#41ab5d',
  lineWidth: 2,
  dashArray: [10, 0, 10, 0],
})

$inspect(markers)

watch(tracks, (val) => {
  if (!val?.length) {
    markers.value = []
    return
  }

  try {
    // generate markers
    markers.value = val.map(({ longitude, latitude, created }) => {
      const marker = new AMap.Marker({
        position: [longitude, latitude],
        extData: {
          id: nanoid(),
          userId: selectedUserId.value,
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
</script>

<template>
  <div p4>
    <a-breadcrumb>
      <RouterLink to="/workbench">
        <a-breadcrumb-item>{{ t('menu.workbench') }}</a-breadcrumb-item>
      </RouterLink>
      <a-breadcrumb-item>{{ t('user-track') }}</a-breadcrumb-item>
    </a-breadcrumb>
  </div>
  <div flex gap2 p4 bg-base>
    <!-- @vue-expect-error type error -->
    <a-tree-select
      v-model="selectedUserId" :data="data" :field-names="{
        key: 'id',
        title: 'name',
        children: 'members',
      }" :placeholder="t('hint.please-select')" :block-node="true" :selectable="(node) => 'user_id' in node" max-w-60
      grow-1
    />
    <a-date-picker v-model="selectedDate" max-w-40 grow-1 />
  </div>
  <div h-full w-full>
    <ElAmap :center="center" :zoom="zoom" relative h-full w-full @init="(m) => map = m">
      <ElAmapLoca>
        <ElAmapLocaLine :visible="trackVisible" :source-data="trackFeatureCollection" :layer-style="layerStyle" />
      </ElAmapLoca>

      <a-button
        v-if="markers?.length" type="primary" shape="circle" class="absolute right-4 top-4"
        @click="drawerVisible = true"
      >
        <template #icon>
          <icon-menu />
        </template>
      </a-button>
    </ElAmap>

    <a-drawer v-model:visible="drawerVisible" :width="340" unmount-on-close>
      <template #title>
        {{ t('user-track') }}
      </template>
      <a-list item-layout="horizontal">
        <a-list-item v-for="marker, key in markers" :key>
          <a-list-item-meta>
            <template #title>
              {{ new Date(marker.getExtData().created * 1000).toLocaleString() }}
            </template>
            <template #description>
              <span mr2>{{ t('longitude') }}</span> <span>{{ marker.getExtData().longitude }}</span>
              <br>
              <span mr2>{{ t('latitude') }}</span> <span>{{ marker.getExtData().latitude }}<br></span>
            </template>
          </a-list-item-meta>
          <template #extra>
            <a-button type="primary" size="small" @click="selectedMarker = marker">
              {{ t('button.checkout') }}
            </a-button>
          </template>
        </a-list-item>
      </a-list>
    </a-drawer>
  </div>
</template>
