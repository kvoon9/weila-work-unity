<script setup lang="ts">
import { objectEntries } from '@antfu/utils'
import Message from '@arco-design/web-vue/es/message'
import md5 from 'md5'
import * as v from 'valibot'
import { useForm } from 'zod-arco-rules/valibot'

const { t } = useI18n()

const open = defineModel('open', { default: false })

const { form, handleSubmit, rules, reset } = useForm(v.object({
  old_password: v.pipe(
    v.string('旧密码不能为空'),
    v.minLength(6, '旧密码至少 6 位'),
  ),
  new_password: v.pipe(
    v.string('新密码不能为空'),
    v.minLength(6, '新密码至少 6 位'),
  ),
}))

const { mutate, isPending } = useWeilaMutation('corp/user/change-password', {
  onSuccess() {
    Message.success(t('message.success'))
    reset()
    open.value = false
  },
})

const submit = handleSubmit((values) => {
  mutate(Object.fromEntries(objectEntries(values).map(([key, value]) => [key, md5(value)])))
})
</script>

<template>
  <a-modal v-model:visible="open" :title=" t('button.reset-password')" :footer="false">
    <a-form :model="form" :rules @submit="submit">
      <a-form-item field="old_password" :label="t('old-password')">
        <a-input v-model="form.old_password" :max-length="20" show-word-limit type="password" />
      </a-form-item>
      <a-form-item field="new_password" :label="t('new-password')">
        <a-input v-model="form.new_password" :max-length="20" show-word-limit type="password" />
      </a-form-item>
      <a-form-item>
        <a-button mla type="primary" :loading="isPending" html-type="submit">
          {{ t('button.submit') }}
        </a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
