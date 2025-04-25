<script setup lang="ts">
import type { GetBusinessPointListModel } from '@weila/network'
import { useRouteParams } from '@vueuse/router'
import { useBusinessPointList } from '@weila/network'
import CreateBusinessPointModal from '../../components/CreateBusinessPointModal.vue'
import DelBusinessPointModal from '../../components/DelBusinessPointModal.vue'
import EditBusinessPointModal from '../../components/EditBusinessPointModal.vue'

const { t } = useI18n()

const sid = useRouteParams('sid', 0, { transform: Number })
// const ssid = useRouteParams('ssid', 0, { transform: Number })

const { data } = useBusinessPointList($v2, { sid: sid.value })

const currentPoint = shallowRef<GetBusinessPointListModel['points'][number] | null>(null)

const isEditBusinessPointModalOpen = shallowRef<boolean>(false)
const isDeleteBusinessPointModalOpen = shallowRef<boolean>(false)

function handleEdit(point: GetBusinessPointListModel['points'][number]) {
  currentPoint.value = point
  isEditBusinessPointModalOpen.value = true
}

function handleDel(point: GetBusinessPointListModel['points'][number]) {
  currentPoint.value = point
  isDeleteBusinessPointModalOpen.value = true
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
        <CreateBusinessPointModal />
      </div>

      <div>
        <div v-for="point in data?.points" :key="point.id" relative cursor-pointer p4 hover:bg-neutral-100:20 @click="$router.push(`./point/${point.id}-${point.id}`)">
          {{ point.name }}
          <div absolute position-y-center right-4>
            <a-button type="secondary" size="small" @click.stop="() => handleEdit(point)">
              编辑
            </a-button>
            <a-button type="secondary" size="small" @click.stop="() => handleDel(point)">
              删除
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <EditBusinessPointModal v-if="currentPoint" v-model:open="isEditBusinessPointModalOpen" :point="currentPoint" />
  <DelBusinessPointModal v-if="currentPoint" v-model:open="isDeleteBusinessPointModalOpen" :point="currentPoint" />
</template>
