<script setup lang="ts">
import type { GetBusinessPointStaffListModel } from '@weila/network'
import Message from '@arco-design/web-vue/es/message'
import { useRouteParams } from '@vueuse/router'
import { useDelBusinessPointStaff, useGetBusinessPointStaffList } from '@weila/network'

const props = defineProps<{
  staff: GetBusinessPointStaffListModel['staffs'][number]
}>()

const pid = useRouteParams('pid', 0, { transform: Number })

const open = defineModel<boolean>('open', { required: true })

const { mutateAsync, isPending: isDeletingBusinessPointStaff } = useDelBusinessPointStaff($v2, {
  onSuccess() {
    open.value = false
    Message.success('删除成功')
    useGetBusinessPointStaffList($v2, { pid: pid.value }).refetch()
  },
})
</script>

<template>
  <TheModal v-model:open="open" title="删除客服">
    <template #content>
      <div>
        <div>确定删除客服 {{ props.staff.name }} 吗？</div>
      </div>
    </template>
    <template #footer>
      <a-button
        :loading="isDeletingBusinessPointStaff"
        type="primary"
        @click="() => mutateAsync({ pid, uid: staff.uid })"
      >
        确定
      </a-button>
    </template>
  </TheModal>
</template>
