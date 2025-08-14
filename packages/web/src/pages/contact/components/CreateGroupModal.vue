<script setup lang="ts">
import Message from '@arco-design/web-vue/es/message'
import { useQueryClient } from '@tanstack/vue-query'
import * as v from 'valibot'
import { shallowRef } from 'vue'
import { useForm } from 'zod-arco-rules/valibot'

const { t } = useI18n()

const open = shallowRef(false)

const qc = useQueryClient()

const avatarUploaderRef = templateRef('avatarUploaderRef')

// type BurstMode = 0 | 1 | 2

const { form, rules, handleSubmit, reset } = useForm(v.object({
  name: v.pipe(
    v.string('名称必须是字符串'),
    v.nonEmpty('名称不能为空'),
  ),
  burst_mode: v.optional(
    v.pipe(
      v.number('爆发模式必须是数字'),
      v.minValue(0, '爆发模式不能小于0'),
    ),
    0,
  ),
  avatar: v.optional(
    v.string('头像必须是字符串'),
    '',
  ),
}))

const { mutate, isPending } = useWeilaMutation('corp/group/create-group', {
  onSuccess() {
    reset()
    open.value = false
    Message.success(t('message.success'))
    qc.invalidateQueries({ queryKey: ['corp/group/get-group-list'] })
  },
})

watchEffect(() => {
  if (open.value)
    reset()
})

const submit = handleSubmit(async (values) => {
  try {
    if (form.value.avatar && !isRemoteImage(form.value.avatar))
    // @ts-expect-error type error: `defineExpose` no type declare find
      await avatarUploaderRef.value.upload()

    mutate(values)
  }
  catch (error) {
    console.error('error', error)
  }
})
</script>

<template>
  <a-button type="primary" @click="open = true">
    {{ t('button.create-group') }}
  </a-button>
  <a-modal v-model:visible="open" :title=" t('button.create-group') " :footer="false">
    <a-form :rules :model="form" auto-label-width @submit="submit">
      <a-form-item field="name" :label="t('org-form.name.label')">
        <a-input v-model="form.name" :max-length="20" show-word-limit />
      </a-form-item>
      <a-form-item field="avatar" :label="t('avatar')">
        <AvatarUploader ref="avatarUploaderRef" v-model:src="form.avatar" />
      </a-form-item>
      <a-form-item field="burst_mode" :label="t('burst-mode')">
        <a-radio-group v-model="form.burst_mode" direction="vertical">
          <a-radio :value="0">
            {{ t('burst-mode-0') }}
          </a-radio>
          <a-radio :value="1">
            {{ t('burst-mode-1') }}
          </a-radio>
          <a-radio :value="2">
            {{ t('burst-mode-2') }}
          </a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item>
        <a-button mla html-type="submit" type="primary" :loading="isPending">
          {{ t('button.submit') }}
        </a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
