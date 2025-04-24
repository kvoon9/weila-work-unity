<script setup lang="ts">
import { useMyBusiness, useServiceLegal } from '@weila/network'

const { t } = useI18n()

definePage({
  meta: {
    menu: {
      label: 'menu.workbench',
      order: 0,
      icon: 'icon-common',
    },
  },
})

const { data: myBusiness } = useMyBusiness($v2)
const { data: myLegal } = useServiceLegal($v2)

enum ServiceState {
  Uncreated = '未创建',
  Unverified = '未认证',
  Verified = '已开通',
}

const hasBusiness = computed(() => !!myBusiness.value)
// const hasLicense = computed(() => !!myLegal.value?.legal)
const isVerified = computed(() => myLegal.value?.state === 8)

const serviceState = computed(() => {
  if (hasBusiness.value && isVerified.value)
    return ServiceState.Verified

  if (!hasBusiness.value)
    return ServiceState.Uncreated

  return ServiceState.Unverified
})
</script>

<template>
  <div p4>
    <a-breadcrumb>
      <RouterLink to="/workbench">
        <a-breadcrumb-item>{{ t('menu.workbench') }}</a-breadcrumb-item>
      </RouterLink>
    </a-breadcrumb>
  </div>
  <div>
    <div class="grid grid-cols-1 gap-4 px-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
      <RouterLink
        to="/workbench/user-track"
        class="rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 dark:bg-gray-800 hover:shadow-lg"
      >
        <div class="mb-4 flex items-center">
          <i class="i-carbon-map mr-3 text-2xl text-primary-600 dark:text-primary-400" />
          <h3 class="text-xl text-gray-900 font-semibold dark:text-gray-100">
            用户轨迹
          </h3>
        </div>
      </RouterLink>

      <button
        :disabled="!myBusiness"
        class="rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 dark:bg-gray-800 hover:shadow-lg"
        @click="() => $router.push(`/workbench/service/${myBusiness?.sid}-${myBusiness?.id}`)"
      >
        <div class="mb-4 flex items-center gap3">
          <!-- <a-spin v-if="isFetchingBusiness" /> -->
          <i class="i-carbon-group text-2xl text-primary-600 dark:text-primary-400" />
          <h3 class="text-xl text-gray-900 font-semibold dark:text-gray-100">
            <span>服务号</span>
            <span
              v-if="myLegal"
              class="ml-2 text-sm font-normal"
            >{{ serviceState }}</span>
          </h3>
        </div>
      </button>
    </div>
  </div>
</template>
