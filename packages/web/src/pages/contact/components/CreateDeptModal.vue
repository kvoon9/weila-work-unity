<script setup lang="ts">
import Message from '@arco-design/web-vue/es/message'
import { useQueryClient } from '@tanstack/vue-query'
import * as v from 'valibot'
import { useForm } from 'zod-arco-rules/valibot'

const { t } = useI18n()

const open = defineModel('open', { default: false })

const { form, rules, handleSubmit } = useForm(v.object({
  name: v.pipe(
    v.string('姓名必须是字符串'),
    v.nonEmpty('姓名不能为空'),
  ),
}))

const qc = useQueryClient()

const { mutate, isPending } = useWeilaMutation('corp/address/create-dept', {
  onSuccess() {
    open.value = false
    Message.success(t('message.success'))
    qc.invalidateQueries({ queryKey: ['corp/address/get-all-dept'] })
    qc.invalidateQueries({ queryKey: ['corp/address/get-dept-list'] })
  },
})

const submit = handleSubmit((values: any) => {
  mutate(values)
})
</script>

<template>
  <ModalTrigger v-model:open="open" :trigger="{ type: 'primary' }" :title=" t('button.create-dept') ">
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
