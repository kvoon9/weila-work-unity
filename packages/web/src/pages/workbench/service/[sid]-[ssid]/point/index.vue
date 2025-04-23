<script setup lang="ts">
import { useRouteParams } from '@vueuse/router'
import { useBusinessPointList } from '@weila/network'
import TheModal from '~/components/TheModal.vue'

const { t } = useI18n()

const sid = useRouteParams('sid', 0, { transform: Number })
const ssid = useRouteParams('ssid', 0, { transform: Number })

const { data } = useBusinessPointList($v2, { sid: sid.value })

function handleEdit(id: number) {
  console.log('edit', id)
}

function handleDel(id: number) {
  console.log('del', id)
}
</script>

<template>
  <div p4 space-y-4>
    <div>
      <a-breadcrumb>
        <RouterLink to="/workbench">
          <a-breadcrumb-item>{{ t('menu.workbench') }}</a-breadcrumb-item>
        </RouterLink>
        <a-breadcrumb-item>服务点管理</a-breadcrumb-item>
      </a-breadcrumb>
    </div>
    <div rounded p4 space-y-2 bg-base>
      <div space-x-2>
        <TheModal title="创建服务点">
          <a-button type="primary">
            创建服务点
          </a-button>
          <template #content>
            <div>
              create
            </div>
          </template>
        </TheModal>
      </div>

      <div>
        <div v-for="point in data?.points" :key="point.id" relative cursor-pointer p4 hover:bg-neutral-100:20 @click="$router.push(`./point/${point.id}-${point.id}`)">
          {{ point.name }}

          <div absolute position-y-center right-4>
            <a-button type="secondary" size="small" @click.stop="() => handleEdit(point.id)">
              编辑
            </a-button>
            <a-button type="secondary" size="small" @click.stop="() => handleDel(point.id)">
              删除
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
