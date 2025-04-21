<script setup lang="ts">
import type { UnwrapRef } from 'vue'
import type { RegeoV2 } from '~/shared/types'
import { useQuery } from '@tanstack/vue-query'
import { ElAmap } from '@vuemap/vue-amap'
import { shallowRef } from 'vue'

const props = withDefaults(defineProps<{
  options?: {
    center?: [number, number]
    zoom?: number
    radius?: number
  }
}>(), {
  options: () => ({
    zoom: 15,
    radius: 300,
  }),
})

const emit = defineEmits<{
  (e: 'update:value', value: RegeoV2 & {
    lon: number
    lat: number
  }): void
}>()

const UNKOWN_ADDRESS = '[未知的地理位置]'

const zoom = shallowRef(props.options.zoom || 15)
const { coords, isSupported, error: coordsError } = useGeolocation({
  immediate: true,
  enableHighAccuracy: true,
})

const { toast } = useToast()

watchEffect(() => {
  if (props.options.center)
    return

  if (!isSupported.value)
    return toast('无法获取当前位置')

  if (coordsError.value)
    return toast({ title: `获取当前位置失败(${coordsError.value.code})`, description: coordsError.value.message })
})

function checkCoordsValue(coords: UnwrapRef<ReturnType<typeof useGeolocation>['coords']>) {
  if (coordsError.value)
    return false

  if (coords.longitude === 0
    || coords.latitude === 0
    || coords.longitude === Infinity
    || coords.latitude === Infinity
  ) {
    return false
  }

  return true
}

const defaultCenter: [number, number] = props.options.center
  ?? [114.057868, 22.543099]

const center = defineModel<[number, number]>('center', {
  required: false,
  default: null,
})

// defineModel can not reference a variant as default value
if (!center.value)
  center.value = defaultCenter

const radius = shallowRef(props.options.radius || 300)

const map = shallowRef<AMap.Map | null>(null)

const isTouching = shallowRef(false)
const isMoving = shallowRef(false)
const isIdle = computed(() => !isTouching.value && !isMoving.value)

const pickedCenter = computed(() => {
  if (!isIdle.value)
    return null

  return center.value
})

const { $v2 } = useNuxtApp()

const { data: regeo, refetch } = useQuery({
  enabled: !!pickedCenter.value,
  queryKey: ['regeo', radius, pickedCenter],
  queryFn: async () => {
    return $v2<{ regeo: RegeoV2 }>('loc/regeo', {
      body: {
        lon: pickedCenter.value![0],
        lat: pickedCenter.value![1],
        radius: radius.value,
      },
    }).then(i => i.regeo)
  },
})

watch(isIdle, () => {
  if (isIdle.value)
    refetch()
})

const address = computed(() => {
  if (!isIdle.value)
    return ''

  if (!regeo.value)
    return ''

  const { Address } = regeo.value

  let res = `${Address}`

  if (!res)
    res = UNKOWN_ADDRESS

  return res
})

const addr = shallowRef('')
watchEffect(() => {
  if (regeo.value)
    addr.value = `${regeo.value.Address}`
})

// to self location
const { stop } = watch(coords, () => {
  if (props.options.center) {
    return
  }

  if (checkCoordsValue(coords.value)) {
    center.value = [coords.value.longitude, coords.value.latitude]
    stop()
  }
}, { immediate: true })

function handleMapInit(m: AMap.Map) {
  map.value = m

  m.on('click', (e: any) => {
    const { lng, lat } = e.lnglat
    center.value = [lng, lat]
  })

  m.on('touchstart', () => isTouching.value = true)
  m.on('touchmove', () => isTouching.value = true)
  m.on('touchend', () => isTouching.value = false)
  m.on('movestart', () => isMoving.value = true)
  m.on('mapmove', () => isMoving.value = true)
  m.on('moveend', () => isMoving.value = false)
}

function confirm() {
  const { toast } = useToast()
  if (!regeo.value) {
    toast('请选择一个位置')
    return
  }

  emit('update:value', {
    ...regeo.value,
    lon: center.value![0],
    lat: center.value![1],
    Address: addr.value,
  })
}
</script>

<template>
  <div class="h-full w-full relative">
    <ElAmap
      v-model:center="center"
      v-model:zoom="zoom"
      @init="handleMapInit"
    />

    <div absolute left-4 top-4 bg-white rounded-lg p2>
      <div flex="items-center ~" space-x-2>
        <Icon name="ph:map-pin" />
        <span>
          {{ [regeo?.province, regeo?.district, regeo?.township].filter(Boolean).join(' · ') }}
        </span>
      </div>
    </div>

    <div
      absolute position-x-center
      top="50%" translate-y="-100%"
      flex="~ col items-center"
    >
      <p
        flex-1 p4 bg-primary:70 backdrop-blur-2xl text-white rounded-full transition-all
        flex="items-center ~"
      >
        <span
          max-w-75vw
          break-keep truncate
        >

          {{ address }}
        </span>
      </p>
      <div
        mxa
        bg-primary:70
        h-15 w-1 backdrop-blur-2xl rounded-b-full
      />
    </div>

    <div absolute bottom-20 position-x-center>
      <textarea v-model="addr" bg-white:40 backdrop-blur-3xl outline-none p2 rounded-lg w-80vw :rows="3" border />

      <div absolute right-2 bottom-4 flex>
        <button v-if="regeo && addr !== regeo.Address" btn="ghost sm" color-primary @click="addr = regeo.Address">
          重置
        </button>
        <button :disabled="!regeo" rounded-lg btn="primary sm" @click="confirm">
          确认
        </button>
      </div>
    </div>
  </div>
</template>
