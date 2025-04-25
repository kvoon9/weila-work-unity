<script setup lang="ts">
import type { GetBusinessStaffListModel } from '@weila/network'
import { useRouteParams } from '@vueuse/router'
import { useBusinessStaffList } from '@weila/network'
import AddBusinessStaffModal from '../components/AddBusinessStaffModal.vue'
import DelBusinessStaffModal from '../components/DelBusinessStaffModal.vue'

const { t } = useI18n()

const sid = useRouteParams('sid', 0, { transform: Number })
// const ssid = useRouteParams('ssid', 0, { transform: Number })

const { data } = useBusinessStaffList($v2, { sid: sid.value })

const currentStaff = shallowRef<GetBusinessStaffListModel['staffs'][number] | null>(null)

const isDeleteBusinessStaffModalOpen = shallowRef<boolean>(false)

function handleDel(staff: GetBusinessStaffListModel['staffs'][number]) {
  currentStaff.value = staff
  isDeleteBusinessStaffModalOpen.value = true
}
</script>

<template>
  <div p4 space-y-4>
    <div>
      <a-breadcrumb>
        <RouterLink to="/workbench">
          <a-breadcrumb-item>{{ t('menu.workbench') }}</a-breadcrumb-item>
        </RouterLink>
        <a-breadcrumb-item>客服管理</a-breadcrumb-item>
      </a-breadcrumb>
    </div>
    <div rounded p4 space-y-2 bg-base>
      <div space-x-2>
        <AddBusinessStaffModal :sid="sid" />
      </div>

      <div>
        <div v-for="staff in data" :key="staff.uid" relative cursor-pointer p4 hover:bg-neutral-100:20>
          {{ staff.name }}

          <div absolute position-y-center right-4>
            <a-button type="secondary" size="small" @click.stop="() => handleDel(staff)">
              删除
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <DelBusinessStaffModal v-if="currentStaff" v-model:open="isDeleteBusinessStaffModalOpen" :staff="currentStaff" />
</template>
