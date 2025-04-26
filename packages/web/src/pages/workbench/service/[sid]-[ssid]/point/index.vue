<script setup lang="ts">
import type { GetBusinessPointListModel } from '@weila/network'
import { useRouteParams } from '@vueuse/router'
import { useBusinessPointList } from '@weila/network'
import { useRouter } from 'vue-router'
import CreateBusinessPointModal from '../../components/CreateBusinessPointModal.vue'
import DelBusinessPointModal from '../../components/DelBusinessPointModal.vue'
import EditBusinessPointModal from '../../components/EditBusinessPointModal.vue'

const { t } = useI18n()
const router = useRouter()

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

function onPointSelect(point: GetBusinessPointListModel['points'][number], _: PointerEvent) {
  router.push(`./point/${point.id}-${point.id}`)
}

const tableColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    width: 150,
  },
  {
    title: '电话',
    dataIndex: 'phone',
    width: 150,
  },
  {
    title: '操作',
    width: 150,
  },
]
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

      <a-table :columns="tableColumns" :data="data?.points || []" @row-click="onPointSelect">
        <template #columns>
          <a-table-column title="名称" data-index="name" :width="150">
            <template #cell="{ record }">
              {{ record.name }}
            </template>
          </a-table-column>
          <a-table-column title="电话" data-index="phone" :width="150">
            <template #cell="{ record }">
              {{ record.phone }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150">
            <template #cell="{ record }">
              <div flex gap2>
                <a-button type="secondary" size="small" @click.stop="() => handleEdit(record)">
                  编辑
                </a-button>
                <a-button type="secondary" size="small" @click.stop="() => handleDel(record)">
                  删除
                </a-button>
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>
  <EditBusinessPointModal v-if="currentPoint" v-model:open="isEditBusinessPointModalOpen" :point="currentPoint" />
  <DelBusinessPointModal v-if="currentPoint" v-model:open="isDeleteBusinessPointModalOpen" :point="currentPoint" />
</template>
