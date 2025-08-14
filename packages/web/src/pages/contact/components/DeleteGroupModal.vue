<script setup lang="ts">
import type { GroupModel } from '~/api/contact'
import Message from '@arco-design/web-vue/es/message'

defineProps<{
  group?: GroupModel
}>()

const emits = defineEmits(['success'])

const { t } = useI18n()

const open = defineModel('open', { default: false })

const { mutate, isPending } = useWeilaMutation<{
  group_id: number
}>('corp/group/delete-group', {
  onSuccess: () => {
    open.value = false
    Message.success(t('message.success'))
    emits('success')
  },
})
</script>

<template>
  <ModalTrigger v-model:open="open" :trigger="{ status: 'danger' }" :title=" t('delete.modal.title') ">
    <template #content>
      <p>
        {{ t('delete.modal.hint') }} {{ t('delete.modal.content') }}
      </p>
    </template>
    <template #footer>
      <a-button
        type="primary" :loading="isPending" @click="(e) => mutate({
          group_id: group?.id,
        })"
      >
        {{ t('button.submit') }}
      </a-button>
    </template>
  </ModalTrigger>
</template>
