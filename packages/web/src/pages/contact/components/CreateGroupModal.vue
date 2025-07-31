<script setup lang="ts">
import Message from '@arco-design/web-vue/es/message'
import { useQueryClient } from '@tanstack/vue-query'
import * as v from 'valibot'
import { shallowRef } from 'vue'
import { useForm } from 'zod-arco-rules/valibot'

const { t } = useI18n()

const open = shallowRef(false)

const queryClient = useQueryClient()

const avatarUploaderRef = templateRef('avatarUploaderRef')

// type BurstMode = 0 | 1 | 2

const { form, rules, handleSubmit, reset } = useForm(v.object({
  name: v.string(),
  burst_mode: v.optional(v.number(), 0),
  avatar: v.optional(v.string(), ''),
}))

const { mutate, isPending } = useWeilaMutation('corp/group/create-group', {
  onSuccess() {
    reset()
    open.value = false
    Message.success(t('message.success'))
    queryClient.invalidateQueries({ queryKey: ['corp/group/get-group-list'] })
  },
})

watchEffect(() => {
  if (open.value)
    reset()
})

const submit = handleSubmit(async (values) => {
  if (form.value.avatar && !isRemoteImage(form.value.avatar))
    // @ts-expect-error type error: `defineExpose` no type declare find
    await avatarUploaderRef.value.upload()

  mutate(values)
})
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger>
      <!-- <i i-ph-plus inline-block /> {{ t('dept.create') }} -->
      <slot />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="data-[state=open]:animate-overlayShow fixed inset-0 z-100 bg-black:60" />
      <DialogContent
        bg-base
        class="fixed left-[50%] top-[50%] z-[100] max-h-[85vh] max-w-[450px] w-[90vw] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] data-[state=open]:animate-ease-in focus:outline-none"
      >
        <DialogTitle class="m0 text-center text-lg font-semibold leading-loose">
          {{ t('button.create-group') }}
        </DialogTitle>

        <a-form :rules :model="form" auto-label-width @submit="submit">
          <a-form-item field="name" :label="t('org-form.name.label')" :rules="[{ required: true }]">
            <a-input v-model="form.name" :max-length="20" show-word-limit />
          </a-form-item>
          <a-form-item field="avatar" :label="t('avatar')" :rules="[{}]">
            <AvatarUploader ref="avatarUploaderRef" v-model:src="form.avatar" />
          </a-form-item>
          <a-form-item field="burst_mode" :label="t('burst-mode')" :rules="[{ required: true }]">
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
        <DialogClose
          class="text-grass11 absolute right-[10px] top-[10px] h-[25px] w-[25px] inline-flex appearance-none items-center justify-center rounded-full hover:bg-gray2 focus:shadow-[0_0_0_2px] focus:shadow-gray7 focus:outline-none"
          aria-label="Close"
        >
          <i i-carbon-close />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
