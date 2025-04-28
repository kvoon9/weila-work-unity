<script setup lang="ts">
import { objectKeys } from '@antfu/utils'
import { useRouteParams } from '@vueuse/router'
import { useMyBusiness } from '@weila/network'
import { ref as deepRef } from 'vue'

const { data: myBusiness } = useMyBusiness($v2)

const sid = useRouteParams('sid', 0, { transform: Number })
const ssid = useRouteParams('ssid', 0, { transform: Number })

const router = useRouter()

const menus = computed<Record<string, string>>(() => {
  return {
    [`/workbench/service/${sid.value}-${ssid.value}/detail`]: myBusiness?.value?.merchant?.name ?? '服务号详情',
    [`/workbench/service/${sid.value}-${ssid.value}/point`]: '服务点管理',
    [`/workbench/service/${sid.value}-${ssid.value}/staff`]: '客服管理',
  }
})

const selectedKeys = deepRef<(string | undefined)[]>([])

watch(router.currentRoute, () => {
  selectedKeys.value = [objectKeys(menus.value).find((menu) => {
    const path = location.href.split('/#')[1]
    return path.includes(menu)
  })]
}, { immediate: true })
</script>

<template>
  <div h-full flex of-hidden>
    <section h-full w60 shrink-0 border-r-1 p2 dark:border-gray-700 bg-base>
      <a-menu v-model:selected-keys="selectedKeys" auto-open-selected :default-open-keys="[myBusiness?.merchant.name]">
        <a-menu-item v-for="label, path in menus" :key="path" @click="$router.push(path)">
          {{ label }}
        </a-menu-item>
        <!-- <button
          v-if="!corp" hover="bg-primary-300" bg-primary color-white list-btn
          @click="isCreateCorpModalVisible = true"
        >
          {{ t('corp.create.form.title') }}
        </button> -->
      </a-menu>
    </section>
    <section relative h-full w-full of-scroll>
      <RouterView absolute inset-0 />
    </section>
  </div>
</template>
