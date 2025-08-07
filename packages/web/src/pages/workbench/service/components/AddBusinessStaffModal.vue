<script setup lang="ts">
import type { TransferItem } from '@arco-design/web-vue/es/transfer/interface'
import type { MemberModel } from '~/api/contact'
import type { Corp } from '~/types'
import { Message } from '@arco-design/web-vue'
import { useQuery } from '@tanstack/vue-query'
import { useAddBusinessStaffs, useBusinessStaffList } from '@weila/network'
import { ref as deepRef, shallowRef } from 'vue'
import { weilaApiUrl } from '~/api'

const props = defineProps<{
  sid: number
}>()

const { t } = useI18n()
const selectedIds = deepRef<string[]>([])
const open = shallowRef(false)
const { data: staffList, refetch: refetchStaffList, isFetching: isFetchingStaffList } = useBusinessStaffList($v2, { sid: props.sid })

const { data: corp } = useWeilaFetch<Corp>('corp/org/get-my-org')
const org_num = computed(() => corp.value?.num)

const { data: members, isFetching: isFetchingMembers } = useQuery<Array<MemberModel>>({
  enabled: computed(() => Boolean(org_num.value)),
  queryKey: [weilaApiUrl('/corp/web/member-getall'), org_num.value],
  queryFn: () => weilaFetch(weilaApiUrl('/corp/web/member-getall'), {
    body: {
      org_num: org_num.value,
    },
  }).then(i => i.members),
})

const { mutate: addStaffs, isPending: isAddingStaffs } = useAddBusinessStaffs($v2, {
  onSuccess() {
    Message.success(t('message.success') || '添加成功')
    refetchStaffList()
    open.value = false
  },
})

const availableMembers = computed(() => {
  if (!members.value || !staffList.value)
    return []

  const staffUids = new Set(staffList.value.map(staff => staff.uid))

  return members.value.filter(member => !staffUids.has(member.user_id))
})

const transferData = computed<TransferItem[]>(() =>
  availableMembers.value.map(member => ({
    label: `${member.name}(${member.user_num})`,
    value: String(member.user_id),
    disabled: false,
  })) || [],
)

function handleAddStaffs() {
  if (!selectedIds.value.length)
    return

  addStaffs({
    sid: props.sid,
    uids: selectedIds.value.map(id => Number(id)),
  })
}
</script>

<template>
  <TheModal v-model:open="open" title="添加客服">
    <a-button type="primary">
      添加客服
    </a-button>
    <template #content>
      <div relative p-4>
        <LoadingMask :open="isFetchingStaffList || isFetchingMembers" />
        <a-transfer
          v-model:model-value="selectedIds"
          simple
          :title="['可选成员', '已选成员']"
          show-search
          :data="transferData"
        />
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <a-button
          type="primary"
          :disabled="!selectedIds.length"
          :loading="isAddingStaffs"
          @click="handleAddStaffs"
        >
          确定
        </a-button>
      </div>
    </template>
  </TheModal>
</template>
