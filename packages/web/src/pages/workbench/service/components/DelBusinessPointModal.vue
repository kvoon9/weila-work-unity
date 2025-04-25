<script setup lang="ts">
import type { GetBusinessPointListModel } from '@weila/network'
import Message from '@arco-design/web-vue/es/message'
import { delBusinessPoint, useBusinessPointList } from '@weila/network'

const props = defineProps<{
  point: GetBusinessPointListModel['points'][number]
}>()

const isDeleteBusinessPointModalOpen = defineModel<boolean>('open', { required: true })

const { mutateAsync, isPending: isDeletingBusinessPoint } = delBusinessPoint($v2, {
  onSuccess() {
    isDeleteBusinessPointModalOpen.value = false
    Message.success('删除成功')
    useBusinessPointList($v2, { sid: props.point.sid }).refetch()
  },
})
</script>

<template>
  <TheModal v-model:open="isDeleteBusinessPointModalOpen" title="删除服务点">
    <template #content>
      <div>
        <div>确定删除服务点吗？</div>
      </div>
    </template>
    <template #footer>
      <a-button :loading="isDeletingBusinessPoint" type="primary" @click="() => mutateAsync({ pid: point.id })">
        确定
      </a-button>
    </template>
  </TheModal>
</template>
