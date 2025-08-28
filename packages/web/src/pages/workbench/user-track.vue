<script setup lang="ts">
import type { DeptGetallModel } from 'generated/mock/weila'
import type { RegeoModel, UserTrackModel } from '~/api/track'
import type { TreeNodeData } from '~/types'
import type { Member } from '~/types/api'
import { isNull, isNumber, isUndefined } from '@antfu/utils'
import { Message } from '@arco-design/web-vue'
import { ElAmap } from '@vuemap/vue-amap'
import { ElAmapLoca, ElAmapLocaLine } from '@vuemap/vue-amap-loca'
import { nanoid } from 'nanoid'
import { ref as deepRef, shallowRef } from 'vue'

definePage({
  meta: {
    name: '轨迹',
  },
})

const { t } = useI18n()

const selectedUserKeys = shallowRef('')
const selectedDate = shallowRef('')

const enabled = computed(() => Boolean(selectedUserKeys.value && selectedDate.value))
const { data: tracks } = useWeilaFetch<UserTrackModel[]>('corp/loc/get-track', {
  body: () => ({
    user_id: Number(selectedUserKeys.value.replace('member-', '')),
    date: selectedDate.value,
  }),
  pick: ['tracks'],
}, {
  enabled,
})

watchDebounced(() => tracks.value, (val) => {
  if (!val?.length)
    Message.info(t('no-data'))
}, {
  debounce: 500,
})

const { data: depts } = useWeilaFetch<DeptGetallModel['data']['depts']>('/corp/address/get-all-dept')
const treeData = deepRef<TreeNodeData[]>([])
watchEffect(() => {
  treeData.value = depts.value?.map((dept) => {
    return {
      title: `${dept.name} (${dept.user_count})`,
      key: `dept-${dept.id}`,
      selectable: false,
    }
  })
})
async function loadMore(nodeData: TreeNodeData) {
  const dept_id = Number(nodeData.key.replace('dept-', ''))
  const weilaApi = useWeilaApi()

  const members = await weilaApi.value.v2.fetch<Member[]>('corp/address/get-dept-all-member', {
    body: {
      dept_id,
    },
  })

  if (!members.length) {
    Message.warning('无数据')
    return
  }

  nodeData.children = members.map((member) => {
    return {
      key: `member-${member.user_id}`,
      title: member.name,
      isLeaf: true,
      selectable: true,
    }
  })

  if (nodeData.children.some(i => i.checkable))
    nodeData.checkable = true
}

const trackFeatureCollection = computed<GeoJSON.FeatureCollection<GeoJSON.LineString>>(() => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: tracks.value?.map(track => [track.lng, track.lat]) || [],
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

const weilaApi = useWeilaApi()

const regeoInfo = shallowRef(undefined)
watch(selectedMarker, async () => {
  if (!selectedMarker.value)
    return

  const pos = selectedMarker.value?.getPosition()

  if (!pos)
    throw new Error('No position')

  regeoInfo.value = await weilaApi.value.v2.fetch('loc/regeo', {
    body: {
      lon: pos?.getLng(),
      lat: pos?.getLat(),
      radius: 300,
    },
  })
})

watch(regeoInfo, (info?: RegeoModel) => {
  if (!info)
    return

  const content = `
    <div color-black>
      <h3 class="text-lg font-semibold mb-2">${t('location-detail')}</h3>
      <div class="mb-2 ">
        ${info.province + info.city + info.district + info.township + info.Address}
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

watch(tracks, (val) => {
  if (!val?.length) {
    markers.value = []
    return
  }

  try {
    // generate markers
    markers.value = val.map(({ lng, lat, created }) => {
      const marker = new AMap.Marker({
        position: [lng, lat],
        extData: {
          id: nanoid(),
          userId: selectedUserKeys.value,
          created,
          longitude: lng,
          latitude: lat,
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
    val.forEach(i => map.add(i))

    if (val.length)
      map.setFitView([...val, infoWindow.value].filter(i => !isUndefined(i) && !isNull(i)))

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
  <div flex gap2 p4 bg-base>
    <a-tree-select
      v-model="selectedUserKeys"
      :data="treeData"
      :load-more
      :placeholder="t('hint.please-select')"
      :block-node="true"
      max-w-60
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
