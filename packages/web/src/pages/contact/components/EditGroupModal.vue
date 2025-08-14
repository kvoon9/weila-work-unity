<script setup lang="ts">
import type { GroupGetallModel } from 'generated/mock/weila'
import Message from '@arco-design/web-vue/es/message'
import * as v from 'valibot'
import { shallowRef } from 'vue'
import { useForm } from 'zod-arco-rules/valibot'

const props = defineProps<{
  group?: GroupGetallModel['data']['groups'][number]
}>()
const emits = defineEmits(['success'])

const { t } = useI18n()

const open = shallowRef(false)

const avatarUploaderRef = templateRef('avatarUploaderRef')

const { form, rules, handleSubmit, reset } = useForm(v.object({
  name: v.optional(v.string(), () => props.group?.name),
  burst_mode: v.optional(v.number(), () => props.group?.burst_mode),
  group_id: v.optional(v.number(), () => props.group?.id),
  avatar: v.optional(v.string(), () => props.group?.avatar),
}), {
  watch: [() => props.group],
})

const { mutateAsync: change, isPending } = useWeilaMutation('corp/group/change-group', {
  onSuccess: () => {
    open.value = false
    Message.success(t('message.success'))
    emits('success')
    reset()
  },
})

const submit = handleSubmit(async (values) => {
  // @ts-expect-error type error: `defineExpose` no type declare find
  const { upload } = avatarUploaderRef.value
  if (form.value.avatar && !isRemoteImage(form.value.avatar)) {
    await upload()
  }

  change(values)
})
</script>

<template>
  <div inline-block @click="open = true">
    <slot />
  </div>
  <a-modal v-model:visible="open" :title=" t('button.edit-group') " :footer="false">
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
      <!-- <a-form-item field="shutup" :label="t('shutup')" >
            <a-radio-group v-model="form.shutup" direction="vertical">
              <a-radio :value="0">
                {{ t('shutup-disable') }}
              </a-radio>
              <a-radio :value="1">
                {{ t('shutup-enable') }}
              </a-radio>
            </a-radio-group>
          </a-form-item> -->
      <a-form-item>
        <a-button mla type="primary" :loading="isPending" html-type="submit">
          {{ t('button.submit') }}
        </a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
