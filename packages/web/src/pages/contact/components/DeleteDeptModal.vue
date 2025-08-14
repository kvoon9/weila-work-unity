<script setup lang="ts">
import type { DeptModel } from '~/api/contact'
import Message from '@arco-design/web-vue/es/message'
import { useQueryClient } from '@tanstack/vue-query'
import { shallowRef } from 'vue'

defineProps<{
  dept?: DeptModel
}>()

const emits = defineEmits(['success'])

const { t } = useI18n()

const open = shallowRef(false)

const qc = useQueryClient()
const { mutate, isPending } = useWeilaMutation('corp/address/delete-dept', {
  onSuccess() {
    open.value = false
    Message.success(t('message.success'))
    qc.invalidateQueries({ queryKey: ['corp/address/get-all-dept'] })
    qc.invalidateQueries({ queryKey: ['corp/address/get-dept-list'] })
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
      <a-button type="primary" :loading="isPending" @click="() => mutate({ dept_id: dept?.id })">
        {{ t('button.submit') }}
      </a-button>
    </template>
  </ModalTrigger>
</template>
