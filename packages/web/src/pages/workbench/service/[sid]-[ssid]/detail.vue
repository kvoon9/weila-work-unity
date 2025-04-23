<script setup lang="ts">
import { useRouteParams } from '@vueuse/router'
import { useMyBusiness, useServiceLegal } from '@weila/network'
import { computed } from 'vue'
import EditBusinessModal from './components/EditBusinessModal.vue'

const { t } = useI18n()

const { data: businessData } = useMyBusiness($v2)
const { data: legalData } = useServiceLegal($v2)

const ssid = useRouteParams('ssid', 0, { transform: Number })
const sid = useRouteParams('sid', 0, { transform: Number })

// 获取服务号信息的简便访问
const serviceInfo = computed(() => {
  if (!businessData.value?.merchant)
    return null
  return businessData.value.merchant
})

interface TypeMap {
  [key: number]: string
}

const typeMap: TypeMap = {
  1: '个体工商户',
  2: '企业',
  3: '个人',
}

const isEditBusinessModalOpen = shallowRef(false)
const isEditLegalModalOpen = shallowRef(false)
</script>

<template>
  <div p4 space-y-4>
    <div>
      <a-breadcrumb>
        <RouterLink to="/workbench">
          <a-breadcrumb-item>{{ t('menu.workbench') }}</a-breadcrumb-item>
        </RouterLink>
        <a-breadcrumb-item>{{ serviceInfo?.name ?? '服务号详情' }}</a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <div>
      <a-skeleton v-if="!businessData" animation>
        <a-space direction="vertical" :style="{ width: '100%' }" size="large">
          <a-skeleton-line :rows="4" />
        </a-space>
      </a-skeleton>

      <a-card v-else :bordered="false" class="rounded-lg shadow-sm">
        <!-- 服务号基本信息 -->
        <div relative p-4>
          <!-- 头像和名称部分 - 使用flex布局水平排列 -->
          <div class="flex items-center gap-4">
            <a-avatar
              :size="48"
              :image-url="serviceInfo?.avatar"
              :alt="serviceInfo?.name"
            />
            <div class="flex-1">
              <h1 class="m-0 flex items-center gap-2 text-2xl font-semibold">
                {{ serviceInfo?.name }}
              </h1>
            </div>
          </div>
          <div absolute position-y-center right-0>
            <EditBusinessModal />
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
          <div class="mt-3 rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-descriptions
                  :data="[
                    { label: '纬度', value: serviceInfo.lat },
                    { label: '经度', value: serviceInfo.lon },
                    { label: '区域', value: `${serviceInfo.citycode} ${serviceInfo.adcode}` },
                    { label: '地址', value: serviceInfo.address },
                    { label: '街道', value: serviceInfo.township || '未知' },
                  ]" layout="inline-horizontal" :column="1"
                />
              </a-col>
              <a-col :span="12">
                <div class="h-48 flex flex-col items-center justify-center rounded-lg bg-neutral-200 text-gray-500 dark:bg-neutral-700">
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

        <a-divider />

        <!-- 资质信息 -->
        <div class="mt-4 px-4">
          <h3 class="mb-3 flex items-center gap-2 text-lg font-medium">
            <icon-book /> 资质信息
          </h3>
          <div v-if="legalData" class="grid grid-cols-1 gap-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-500">ID</span>
              <span>{{ legalData.id }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">类别</span>
              <span>{{ legalData.category }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">类型</span>
              <span>{{ typeMap[legalData.type] || legalData.type }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">营业执照</span>
              <a-image
                :src="legalData.merchant.business_license"
                width="96"
                height="96"
                fit="cover"
                class="cursor-pointer rounded-lg"
                preview
              />
            </div>
            <div class="flex justify-end">
              <TheModal v-model:open="isEditLegalModalOpen" title="编辑资质信息">
                <a-button type="primary">
                  编辑资质
                </a-button>
                <template #content>
                  123
                </template>
              </TheModal>
            </div>
          </div>
          <a-skeleton v-else animation>
            <a-space direction="vertical" :style="{ width: '100%' }" size="large">
              <a-skeleton-line :rows="4" />
            </a-space>
          </a-skeleton>
        </div>
      </a-card>
    </div>
  </div>
</template>
