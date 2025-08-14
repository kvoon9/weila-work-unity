<script setup lang="ts">
import type { Member } from '~/types/api'
import Message from '@arco-design/web-vue/es/message'
import { useQueryClient } from '@tanstack/vue-query'
import { ref as deepRef, shallowRef } from 'vue'

const props = defineProps<{
  deptId: number
}>()

const qc = useQueryClient()
const { t } = useI18n()

const open = shallowRef(false)

const checkedKeys = deepRef<string[]>([])
const checkedMemberKeys = computed(() => checkedKeys.value.filter(i => i.startsWith('member-')))

const { data: deptMembers, refetch } = useWeilaFetch<Member[]>('corp/address/get-dept-all-member', {
  body: { dept_id: props.deptId },
})

watchEffect(() => open.value && refetch())

const { mutate, isPending } = useWeilaMutation<never, {
  dept_id: number
  user_ids: number[]
}>('corp/address/add-dept-members', {
  onSuccess() {
    Message.success(t('message.success'))
    open.value = false
    qc.invalidateQueries({ queryKey: ['corp/address/get-dept-member-list'] })
  },
})
</script>

<template>
  <ModalTrigger v-model:open="open" title="添加部门成员" :trigger="{ type: 'primary' }">
    <template #content>
      <div relative p4 min-w-100 max-h-60vh of-y-auto>
        <ContactSelectTree
          v-model:checked-keys="checkedKeys"
          :uncheckable-ids="deptMembers.map(i => i.user_id)"
        />
      </div>
    </template>
    <template #footer>
      <a-button
        type="primary" :disabled="!checkedMemberKeys?.length" :loading="isPending" @click="() => mutate({
          dept_id: Number(props.deptId),
          user_ids: checkedKeys.filter((key) => key.startsWith('member')).map((key) => {
            return Number(key.replace('member-', ''))
          }),
        })"
      >
        {{ t('button.submit') }}
      </a-button>
    </template>
  </ModalTrigger>
</template>
