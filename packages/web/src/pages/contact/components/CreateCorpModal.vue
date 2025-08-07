<script setup lang="ts">
import type { Corp } from '~/types'
import Message from '@arco-design/web-vue/es/message'
import * as v from 'valibot'
import { useForm } from 'zod-arco-rules/valibot'

const emits = defineEmits(['success'])

const { t } = useI18n()

const avatarUploaderRef = templateRef('avatarUploaderRef')

const { data: corp, isFetching, refetch } = useWeilaFetch<Corp>('corp/org/get-my-org')

const open = computed(() => {
  if (!isFetching.value && !corp.value)
    return true
  else
    return false
})

const { reset, rules, form, handleSubmit } = useForm(v.object({
  name: v.string(),
  avatar: v.optional(v.string(), ''),
}))

const { mutate, isPending } = useWeilaMutation<{
  name: string
  avatar: string
}>('corp/org/create-org', {
  onSuccess: () => {
    reset()
    Message.success(t('message.success'))
    refetch()
    emits('success')
  },

})

const submit = handleSubmit(async (values: any) => {
  // @ts-expect-error type error: `defineExpose` no type declare find
  const { upload } = avatarUploaderRef.value
  if (form.value.avatar && !isRemoteImage(form.value.avatar)) {
    await upload()
  }

  mutate(values)
})
</script>

<template>
  <DialogRoot :open="open">
    <DialogTrigger>
      <slot />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="data-[state=open]:animate-overlayShow fixed inset-0 z-100 bg-black:60" />
      <DialogContent
        bg-base
        class="fixed left-[50%] top-[50%] z-[100] max-h-[85vh] max-w-[450px] w-[90vw] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] data-[state=open]:animate-ease-in focus:outline-none"
      >
        <DialogTitle class="m0 text-center text-lg font-semibold leading-loose">
          {{ t('corp.create.form.title') }}
        </DialogTitle>

        <a-form :rules :model="form" @submit="submit">
          <a-form-item field="name" :label="t('org-form.name.label')">
            <a-input v-model="form.name" :max-length="20" show-word-limit />
          </a-form-item>
          <a-form-item field="avatar" :label="t('member.form.avatar.label')">
            <AvatarUploader ref="avatarUploaderRef" v-model:src="form.avatar" />
          </a-form-item>

          <a-form-item>
            <a-button type="primary" mla :loading="isPending" html-type="submit">
              {{ t('button.submit') }}
            </a-button>
          </a-form-item>
        </a-form>
        <!-- <DialogClose
          class="text-grass11 absolute right-[10px] top-[10px] h-[25px] w-[25px] inline-flex appearance-none items-center justify-center rounded-full hover:bg-gray2 focus:shadow-[0_0_0_2px] focus:shadow-gray7 focus:outline-none"
          aria-label="Close"
        >
          <i i-carbon-close />
        </DialogClose> -->
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
