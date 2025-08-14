<script setup lang="ts">
import type { DeptModel } from '~/api/contact'
import Message from '@arco-design/web-vue/es/message'
import { useQueryClient } from '@tanstack/vue-query'
import * as v from 'valibot'
import { useForm } from 'zod-arco-rules/valibot'

const props = defineProps<{
  dept?: DeptModel
}>()

const emits = defineEmits(['success'])

const { t } = useI18n()

const open = defineModel('open', { default: false })

const { form, rules, handleSubmit, reset } = useForm(v.object({
  dept_id: v.optional(v.number(), () => props.dept?.id),
  name: v.optional(v.string(), () => props.dept?.name),
}))

watchEffect(() => open.value && reset())

const qc = useQueryClient()

const { mutateAsync, isPending } = useWeilaMutation('corp/address/change-dept', {
  onSuccess() {
    open.value = false
    Message.success(t('message.success'))
    qc.invalidateQueries({ queryKey: ['corp/address/get-all-dept'] })
    qc.invalidateQueries({ queryKey: ['corp/address/get-dept-list'] })
    emits('success')
  },
})

watch(open, (val) => {
  if (val)
    form.value.name = props.dept?.name || ''
})

const submit = handleSubmit((values: any) => {
  mutateAsync({
    ...values,
    dept_id: props.dept!.id,
  })
})
</script>

<template>
  <ModalTrigger v-model:open="open" :title=" t('edit')">
    <template #content>
      <a-form :rules :model="form" @submit="submit">
        <a-form-item field="name" :label="t('org-form.name.label')">
          <a-input v-model="form.name" :max-length="20" show-word-limit />
        </a-form-item>

        <a-button type="primary" mla w-fit :loading="isPending" html-type="submit">
          {{ t('button.submit') }}
        </a-button>
      </a-form>
    </template>
  </ModalTrigger>
</template>
