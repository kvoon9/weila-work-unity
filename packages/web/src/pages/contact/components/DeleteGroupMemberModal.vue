<script setup lang="ts">
import type { Member } from '~/types/api'
import Message from '@arco-design/web-vue/es/message'
import { shallowRef } from 'vue'

defineProps<{
  groupId?: number
  member?: Member
}>()

const emits = defineEmits(['success'])

const { t } = useI18n()

const open = shallowRef(false)

const { mutateAsync, isPending } = useWeilaMutation<{
  group_id: number
  user_id: number
}>('corp/group/delete-group-member', {
  onSuccess() {
    open.value = false
    Message.success(t('message.success'))
    emits('success')
  },
})
</script>

<template>
  <ModalTrigger v-model:open="open" :trigger="{ status: 'danger' }" :title=" t('delete.modal.title') ">
    <template #content>
      <a-list my-4>
        <a-list-item v-if="member">
          {{ member.name }} ({{ member.user_num }})
        </a-list-item>
      </a-list>
    </template>
    <template #footer>
      <a-button
        type="primary" :loading="isPending" :disabled="!member" @click="(e) => mutateAsync({
          group_id: groupId,
          user_id: member?.user_id,
        })"
      >
        {{ t('button.submit') }}
      </a-button>
    </template>
  </ModalTrigger>
</template>
