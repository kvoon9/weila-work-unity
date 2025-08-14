<script setup lang="ts">
import type { Corp } from '~/types'
import Message from '@arco-design/web-vue/es/message'
import { useQueryClient } from '@tanstack/vue-query'
import * as v from 'valibot'
import { useForm } from 'zod-arco-rules/valibot'

const { t } = useI18n()

const { data: corp } = useWeilaFetch<Corp>('corp/org/get-my-org')
const avatarUploaderRef = templateRef('avatarUploaderRef')

const open = defineModel('open', { default: false })

const { rules, form, reset, handleSubmit } = useForm(v.object({
  name: v.optional(v.string(), () => corp.value.name),
  avatar: v.optional(v.string(), () => corp.value.avatar),
}), {
  watch: [corp],
})

const formRef = templateRef('formRef')

const qc = useQueryClient()

const { mutateAsync: change, isPending } = useWeilaMutation('corp/org/change-org', {
  onSuccess: () => {
    reset()
    open.value = false
    Message.success(t('message.success'))
    qc.invalidateQueries({ queryKey: ['corp/org/get-my-org'] })
  },
})

const submit = handleSubmit(async (values: any) => {
  // @ts-expect-error type error: `defineExpose` no type declare find
  const { upload } = avatarUploaderRef.value
  if (form.value.avatar && !isRemoteImage(form.value.avatar)) {
    await upload()
  }

  await change(values)
})
</script>

<template>
  <ModalTrigger v-model:open="open" :title=" t('edit') ">
    <template #content>
      <a-form ref="formRef" :rules :model="form" @submit="submit">
        <a-form-item field="name" :label="t('org-form.name.label')">
          <a-input v-model="form.name" :max-length="20" show-word-limit />
        </a-form-item>
        <a-form-item field="avatar" :label="t('member.form.avatar.label')" :validate-trigger="['change', 'blur']">
          <AvatarUploader ref="avatarUploaderRef" v-model:src="form.avatar" />
        </a-form-item>
      </a-form>
    </template>
    <template #footer>
      <a-button type="primary" :loading="isPending" @click="(e) => formRef?.handleSubmit(e)">
        {{ t('button.submit') }}
      </a-button>
    </template>
  </ModalTrigger>
</template>
