<script setup lang="ts">
import { useMyBusiness, useServiceLegal } from '@weila/network'
import { shallowRef } from 'vue'
import CreateBusinessModal from './service/components/CreateBusinessModal.vue'

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

const { data: myBusiness, isPending: isFetchingBusiness } = useMyBusiness($v2)
const { data: myLegal, isPending: isFetchingLegal } = useServiceLegal($v2)

const isFetchingService = computed(() => isFetchingBusiness.value || isFetchingLegal.value)

enum ServiceState {
  Uncreated = '未创建',
  Unverified = '未认证',
  Verified = '已开通',
}

const hasBusiness = computed(() => !!myBusiness.value)
// const hasLicense = computed(() => !!myLegal.value?.merchant?.business_license)
const isVerified = computed(() => myLegal.value?.state === 8)

const serviceState = computed(() => {
  if (hasBusiness.value && isVerified.value)
    return ServiceState.Verified

  if (!hasBusiness.value)
    return ServiceState.Uncreated

  return ServiceState.Unverified
})

const serviceRoute = computed(() => {
  if (hasBusiness.value && isVerified.value)
    return `/workbench/service/${myBusiness.value?.sid}-${myBusiness.value?.id}`

  if (!isVerified.value)
    return '/workbench/service/set-license'

  // if (!hasBusiness.value)
  //   return '/workbench/service/create'

  return '/workbench/service/set-license'
})

const isCreateBusinessModalOpen = shallowRef(false)
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
        class="rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 dark:bg-neutral-800 hover:shadow-lg"
      >
        <div class="mb-4 flex items-center">
          <i class="i-carbon-map mr-3 text-2xl text-primary-600 dark:text-primary-400" />
          <h3 class="text-xl text-gray-900 font-semibold dark:text-gray-100">
            用户轨迹
          </h3>
        </div>
      </RouterLink>

      <button
        :disabled="isFetchingService"
        class="rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 dark:bg-neutral-800 hover:shadow-lg"
        @click="() => {
          if (!hasBusiness) {
            isCreateBusinessModalOpen = true
          }
          else {
            $router.push(serviceRoute)
          }
        }"
      >
        <div class="mb-4 flex items-center gap3">
          <a-spin v-if="isFetchingService" />
          <i v-else class="i-carbon-group text-2xl text-primary-600 dark:text-primary-400" />
          <h3 class="text-xl text-gray-900 font-semibold dark:text-gray-100">
            <span>服务号</span>
            <span v-if="myLegal" ml-2 text-sm font-normal>{{ serviceState }}</span>
          </h3>
        </div>
      </button>

      <RouterLink
        to="/workbench/service-adt"
        class="rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 dark:bg-neutral-800 hover:shadow-lg"
      >
        <div class="mb-4 flex items-center">
          <i class="i-carbon-document-view mr-3 text-2xl text-primary-600 dark:text-primary-400" />
          <h3 class="text-xl text-gray-900 font-semibold dark:text-gray-100">
            服务号审核
          </h3>
        </div>
      </RouterLink>
    </div>
    <CreateBusinessModal v-model:open="isCreateBusinessModalOpen" />
  </div>
</template>
