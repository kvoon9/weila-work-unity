<script setup lang="ts">
import type { GetBusinessStaffListModel } from '@weila/network'
import Message from '@arco-design/web-vue/es/message'
import { useRouteParams } from '@vueuse/router'
import { useBusinessStaffList, useDelBusinessStaff } from '@weila/network'

const props = defineProps<{
  staff: GetBusinessStaffListModel['staffs'][number]
}>()

const sid = useRouteParams('sid', 0, { transform: Number })

const isDeleteBusinessStaffModalOpen = defineModel<boolean>('open', { required: true })

const { mutateAsync, isPending: isDeletingBusinessStaff } = useDelBusinessStaff($v2, {
  onSuccess() {
    isDeleteBusinessStaffModalOpen.value = false
    Message.success('删除成功')
    useBusinessStaffList($v2, { sid: sid.value }).refetch()
  },
})
</script>

<template>
  <TheModal v-model:open="isDeleteBusinessStaffModalOpen" title="删除客服">
    <template #content>
      <div>
        <div>确定删除客服 {{ props.staff.name }} 吗？</div>
      </div>
    </template>
    <template #footer>
      <a-button
        :loading="isDeletingBusinessStaff"
        type="primary"
        @click="() => mutateAsync({ sid, uid: staff.uid })"
      >
        确定
      </a-button>
    </template>
  </TheModal>
</template>
