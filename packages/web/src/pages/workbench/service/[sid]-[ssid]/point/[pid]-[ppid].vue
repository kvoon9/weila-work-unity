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

      <div>
        <div v-for="staff in data" :key="staff.uid" relative cursor-pointer p4 hover:bg-neutral-100:20>
          {{ staff.name }}
          <div absolute position-y-center right-4>
            <a-button type="secondary" size="small" @click="handleDelete(staff)">
              删除
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <DelBusinessPointStaffModal v-if="currentStaff" v-model:open="isDelModalOpen" :staff="currentStaff" />
</template>
