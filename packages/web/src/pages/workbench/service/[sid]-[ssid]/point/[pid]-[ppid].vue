<script setup lang="ts">
import type { GetBusinessPointStaffListModel } from '@weila/network'
import { useRouteParams } from '@vueuse/router'
import { useGetBusinessPointStaffList } from '@weila/network'
import AddBusinessPointStaffModal from '~/pages/workbench/service/components/AddBusinessPointStaffModal.vue'
import DelBusinessPointStaffModal from '~/pages/workbench/service/components/DelBusinessPointStaffModal.vue'

const { t } = useI18n()

const sid = useRouteParams('sid', 0, { transform: Number })
const ssid = useRouteParams('ssid', 0, { transform: Number })
const pid = useRouteParams('pid', 0, { transform: Number })

const { data } = useGetBusinessPointStaffList($v2, { pid: pid.value })

const currentStaff = shallowRef<GetBusinessPointStaffListModel['staffs'][number] | null>(null)
const isDelModalOpen = shallowRef(false)

function handleDelete(staff: GetBusinessPointStaffListModel['staffs'][number]) {
  currentStaff.value = staff
  isDelModalOpen.value = true
}

const tableColumns = [
  {
    title: '头像',
    dataIndex: 'avatar',
    width: 70,
  },
  {
    title: '姓名',
    dataIndex: 'name',
    width: 120,
  },
  {
    title: '微喇号',
    dataIndex: 'num',
    width: 120,
  },
  {
    title: '工号',
    dataIndex: 'job_num',
    width: 120,
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
        <RouterLink :to="`/workbench/service/${sid}-${ssid}/point`">
          <a-breadcrumb-item>服务点管理</a-breadcrumb-item>
        </RouterLink>
        <a-breadcrumb-item>服务点客服管理</a-breadcrumb-item>
      </a-breadcrumb>
    </div>
    <div rounded p4 space-y-2 bg-base>
      <div space-x-2>
        <AddBusinessPointStaffModal :pid="pid" :sid="sid" />
      </div>

      <a-table :columns="tableColumns" :data="data || []">
        <template #columns>
          <a-table-column title="头像" data-index="avatar" :width="70">
            <template #cell="{ record }">
              <a-avatar :image-url="record.avatar" :style="{ backgroundColor: '#3370ff' }" />
            </template>
          </a-table-column>
          <a-table-column title="姓名" data-index="name" :width="120">
            <template #cell="{ record }">
              {{ record.name }}
            </template>
          </a-table-column>
          <a-table-column title="微喇号" data-index="num" :width="120">
            <template #cell="{ record }">
              {{ record.num }}
            </template>
          </a-table-column>
          <a-table-column title="工号" data-index="job_num" :width="120">
            <template #cell="{ record }">
              {{ record.job_num }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150">
            <template #cell="{ record }">
              <div flex gap2>
                <a-button type="secondary" size="small" @click.stop="() => handleDelete(record)">
                  删除
                </a-button>
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>
  <DelBusinessPointStaffModal v-if="currentStaff" v-model:open="isDelModalOpen" :staff="currentStaff" />
</template>
