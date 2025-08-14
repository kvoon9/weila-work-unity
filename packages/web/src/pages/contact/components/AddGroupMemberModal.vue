<script setup lang="ts">
import type { Member } from '~/types/api'
import { Message } from '@arco-design/web-vue'
import { useQueryClient } from '@tanstack/vue-query'
import { ref as deepRef, shallowRef } from 'vue'

const props = defineProps<{
  groupId: number
}>()

const qc = useQueryClient()
const { t } = useI18n()

const open = shallowRef(false)

const checkedKeys = deepRef<string[]>([])
const checkedMemberKeys = computed(() => checkedKeys.value.filter(i => i.startsWith('member-')))

const { data: groupMembers, refetch } = useWeilaFetch<Member[]>('corp/group/get-group-all-member', {
  body: { group_id: props.groupId },
})

watchEffect(() => open.value && refetch())

const { mutate, isPending } = useWeilaMutation('corp/group/add-group-members', {
  onSuccess() {
    Message.success(t('message.success'))
    open.value = false
    qc.invalidateQueries({ queryKey: ['corp/group/get-group-member-list'] })
  },
})
</script>

<template>
  <ModalTrigger :trigger="{type: 'primary'}" :title=" t('button.add-group-member') ">
    <template #content>

        <div relative p4 min-w-100 max-h-60vh of-y-auto>
          <ContactSelectTree
            v-model:checked-keys="checkedKeys"
            :uncheckable-ids="groupMembers.map(i => i.user_id)"
            :is-item-enable="(member) => {
              return member.grp_cnt < member.grp_lmt
            }"
          />
        </div>
    </template>
    <template #footer>

          <a-button
            type="primary" :disabled="!checkedMemberKeys?.length" :loading="isPending" @click="() => mutate({
              group_id: Number(props.groupId),
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
