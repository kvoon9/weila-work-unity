<script setup lang="ts">
import { adtStateMap } from '@weila/network'
import Viewer from 'viewerjs'

definePageMeta({
  layout: 'back',
})

const { data: myBusiness } = useMyBusiness()
const { data: serviceLegal } = useServiceLegal()

watchEffect(() => {
  if (myBusiness.value)
    appHead.value = myBusiness.value.merchant.name
})

interface TypeMap {
  [key: number]: string
}

const typeMap: TypeMap = {
  1: '个体工商户',
  2: '企业',
  3: '个人',
}

let viewer: Viewer | null = null

function handlePreview() {
  const albumContainer = document.querySelector<HTMLDivElement>('#album-container')
  if (albumContainer) {
    viewer?.destroy()

    viewer = new Viewer(albumContainer, {
      inline: false,
    })
  }
}

onUnmounted(() => {
  viewer?.destroy()
})
</script>

<template>
  <div space-y-4 p4>
    <div v-if="myBusiness" relative>
      <button btn="~ ghost sm" absolute right-0 @click="$router.push('./edit')">
        编辑
      </button>
      <div class="flex space-x-4 mb-6">
        <img
          :src="myBusiness.merchant.avatar"
          class="w-24 h-24 rounded-lg object-cover border"
          alt="商家头像"
        >
        <div flex-1 text-sm>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">
            {{ myBusiness.merchant.name }}
          </h2>
          <p class="text-gray-600 mb-2">
            {{ myBusiness.merchant.intro }}
          </p>
          <div class="flex space-x-2 items-center text-gray-500">
            <Icon name="ph:phone" />
            <span>{{ myBusiness.merchant.phone }}</span>
          </div>

          <div class="flex space-x-2 items-center text-gray-500 truncate">
            <Icon name="ph:map-pin" />
            <span>{{ myBusiness.merchant.township + myBusiness.merchant.address }}</span>
          </div>
        </div>
      </div>

      <!-- 相册展示 -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">
          商家相册
        </h3>
        <div id="album-container" flex space-x-2 w-full of-x-scroll rounded-lg>
          <img
            v-for="(image, index) in myBusiness.merchant.album"
            :key="index"
            loading="lazy"
            :src="image"
            class="w-48 h-27 object-cover rounded-lg border cursor-pointer"
            :alt="`相册图片 ${index + 1}`"
            @click="handlePreview"
          >
        </div>
      </div>
    </div>

    <div
      v-if="serviceLegal"
      :key="serviceLegal.id"
      class="bg-white rounded-lg shadow p-4 border-l-4"
      :class="{ 'border-blue-400': serviceLegal.state === 0, 'border-green-400': serviceLegal.state === 8, 'border-red-400': serviceLegal.state === 9 }"
    >
      <div class="flex justify-between items-center mb-2">
        <span class="font-medium">ID: {{ serviceLegal.id }}</span>
        <span
          class="text-sm px-2 py-1 rounded-full"
          :class="{ 'bg-blue-100 text-blue-800': serviceLegal.state === 0, 'bg-green-100 text-green-800': serviceLegal.state === 8, 'bg-red-100 text-red-800': serviceLegal.state === 9 }"
        >
          {{ adtStateMap[serviceLegal.state] || serviceLegal.state }}
        </span>
      </div>

      <div class="grid grid-cols-1 gap-2 text-sm text-gray-600" @click="() => $router.push('/workbench/service/set-license')">
        <div class="flex justify-between border-b border-gray-100 pb-1">
          <span class="text-gray-500">类别</span>
          <span>{{ serviceLegal.category }}</span>
        </div>

        <div class="flex justify-between border-b border-gray-100 pb-1">
          <span class="text-gray-500">类型</span>
          <span>{{ typeMap[serviceLegal.type] || serviceLegal.type }}</span>
        </div>

        <div class="flex justify-between items-center border-b border-gray-100 pb-1">
          <span class="text-gray-500">营业执照</span>
          <img class="business_license" :src="serviceLegal.merchant.business_license" alt="license" size-24>
        </div>

        <!-- 审核操作栏 -->
        <div class="flex justify-end space-x-2 pt-2">
          <button
            class="px-2 py-1 border rounded"
            @click="() => $router.push('/workbench/service/set-license')"
          >
            编辑
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
