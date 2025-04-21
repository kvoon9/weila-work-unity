<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'
import { weilaFetchV2 } from '~/api/instances/fetcherV2'

const { t } = useI18n()

const { data } = useQuery({
  queryKey: ['/corp/busi/get-my-business'],
  queryFn: () => weilaFetchV2('/corp/busi/get-my-business'),
})

// 计算服务号状态文本及颜色
const serviceStatus = computed(() => {
  if (!data.value?.business)
    return { text: '未知', color: '' }

  const stateMap: Record<number, { text: string, color: string }> = {
    0: { text: '正常', color: 'green' },
    1: { text: '审核中', color: 'orange' },
    2: { text: '已禁用', color: 'red' },
  }

  const state = data.value.business.state as number
  return stateMap[state] || { text: '未知', color: '' }
})

// 获取服务号信息的简便访问
const serviceInfo = computed(() => {
  if (!data.value?.business?.merchant)
    return null
  return data.value.business.merchant
})

interface TypeMap {
  [key: number]: string
}

const typeMap: TypeMap = {
  1: '个体工商户',
  2: '企业',
  3: '个人',
}
</script>

<template>
  <div>
    <div class="p-4">
      <a-breadcrumb>
        <RouterLink to="/workbench">
          <a-breadcrumb-item>{{ t('menu.workbench') }}</a-breadcrumb-item>
        </RouterLink>
        <a-breadcrumb-item>服务号</a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <div class="p-4">
      <a-card v-if="data?.business" :bordered="false" class="rounded-lg shadow-sm">
        <!-- 服务号基本信息 -->
        <div class="p-4">
          <!-- 头像和名称部分 - 使用flex布局水平排列 -->
          <div class="flex items-center gap-4">
            <a-avatar
              :size="48"
              :image-url="serviceInfo?.avatar"
              :alt="serviceInfo?.name"
            />
            <div class="flex-1">
              <h1 class="m-0 flex items-center gap-2 text-2xl text-gray-900 font-semibold">
                {{ serviceInfo?.name }}
                <a-tag v-if="serviceStatus.color" :color="serviceStatus.color" class="ml-2 text-xs">
                  {{ serviceStatus.text }}
                </a-tag>
              </h1>
              <div class="mt-2">
                <a-space>
                  <a-tag>ID: {{ data.business.id }}</a-tag>
                  <a-tag>SID: {{ data.business.sid }}</a-tag>
                  <a-tag>类型: {{ typeMap[data.business.type] || '未知' }}</a-tag>
                </a-space>
              </div>
            </div>
          </div>
        </div>

        <a-divider class="my-4" />

        <!-- 服务号详细信息 -->
        <a-row :gutter="24">
          <a-col :span="12">
            <div class="px-4">
              <div>
                <h3 class="mb-3 flex items-center gap-2 text-lg font-medium">
                  简介
                </h3>
                <p class="text-gray-600 leading-relaxed">
                  {{ serviceInfo?.intro || '暂无简介' }}
                </p>
              </div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="px-4">
              <div>
                <h3 class="mb-3 flex items-center gap-2 text-lg font-medium">
                  联系方式
                </h3>
                <a-space direction="vertical" :size="8">
                  <div><icon-phone /> {{ serviceInfo?.phone }}</div>
                  <div><icon-location /> {{ serviceInfo?.address }}</div>
                  <div class="text-sm text-gray-500">
                    {{ serviceInfo?.adcode }} {{ serviceInfo?.citycode }} {{ serviceInfo?.township }}
                  </div>
                </a-space>
              </div>
            </div>
          </a-col>
        </a-row>

        <a-divider />

        <!-- 服务号相册 (放在位置信息上方) -->
        <div class="mt-4 px-4">
          <h3 class="mb-3 flex items-center gap-2 text-lg font-medium">
            <icon-camera /> 服务号相册
          </h3>
          <div v-if="serviceInfo?.album?.length" class="mt-4">
            <a-image-preview-group infinite>
              <a-row :gutter="[16, 16]">
                <a-col v-for="(img, index) in serviceInfo.album" :key="index" :span="6" :xs="12" :sm="8" :md="6" :lg="4">
                  <a-image
                    :src="img"
                    width="100%"
                    :height="140"
                    :alt="`${serviceInfo.name}相册图片${index + 1}`"
                    fit="cover"
                    class="cursor-pointer rounded-lg transition-transform hover:scale-[1.02]"
                  />
                </a-col>
              </a-row>
            </a-image-preview-group>
          </div>
          <a-empty v-else class="mt-3" description="暂无相册图片" />
        </div>

        <a-divider />

        <!-- 位置信息 -->
        <div v-if="serviceInfo?.lat && serviceInfo?.lon" class="mt-4 px-4">
          <h3 class="mb-3 flex items-center gap-2 text-lg font-medium">
            <icon-location /> 位置信息
          </h3>
          <div class="mt-3 rounded-lg bg-gray-100 p-4">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-descriptions
                  :data="[
                    { label: '纬度', value: serviceInfo.lat },
                    { label: '经度', value: serviceInfo.lon },
                    { label: '地址', value: serviceInfo.address },
                    { label: '区域', value: `${serviceInfo.citycode} ${serviceInfo.adcode}` },
                    { label: '街道', value: serviceInfo.township || '未知' },
                  ]" layout="inline-horizontal" :column="1"
                />
              </a-col>
              <a-col :span="12">
                <div class="h-48 flex flex-col items-center justify-center rounded-lg bg-gray-200 text-gray-500">
                  <icon-loading />
                  <p>地图加载中...</p>
                  <p class="text-xs">
                    经纬度: {{ serviceInfo.lat }}, {{ serviceInfo.lon }}
                  </p>
                </div>
              </a-col>
            </a-row>
          </div>
        </div>
      </a-card>

      <!-- 加载状态展示 -->
      <a-spin v-else />
    </div>
  </div>
</template>
