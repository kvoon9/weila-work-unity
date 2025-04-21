<script setup lang="ts">
import Message from '@arco-design/web-vue/es/message'
import { useMutation } from '@tanstack/vue-query'
import { weilaApiUrl } from '~/api'
import { weilaRequest } from '~/api/instances/request'

const emits = defineEmits(['success'])

const { t } = useI18n()

const avatarUploaderRef = templateRef('avatarUploaderRef')

const open = defineModel('open', { default: false })

interface Payload {
  name: string
  avatar: string
}

const form = reactive({
  name: '',
  avatar: '',
})

const formRef = templateRef('formRef')

const { mutate, isPending } = useMutation({
  mutationFn: (payload: Payload) => weilaRequest.post(
    weilaApiUrl('/corp/web/org-create'),
    payload,
  ),
  onSuccess: () => {
    formRef.value?.resetFields()
    open.value = false
    Message.success(t('message.success'))
    emits('success')
  },
})

function handleSubmit() {
  return formRef.value?.validate(async (errors) => {
    if (errors)
      return

    // @ts-expect-error type error: `defineExpose` no type declare find
    const { upload } = avatarUploaderRef.value
    if (form.avatar && !isRemoteImage(form.avatar)) {
      await upload()
    }

    mutate(form, {
      onSuccess: () => {
        formRef.value?.resetFields()
      },
    })
  })
}
</script>

<template>
  <DialogRoot v-model:open="open">
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

        <a-form ref="formRef" :model="form" @submit="handleSubmit">
          <a-form-item field="name" :label="t('org-form.name.label')">
            <a-input v-model="form.name" :max-length="20" show-word-limit />
          </a-form-item>
          <a-form-item field="avatar" :label="t('member.form.avatar.label')" :validate-trigger="['change', 'blur']">
            <AvatarUploader ref="avatarUploaderRef" v-model:src="form.avatar" />
          </a-form-item>
        </a-form>

        <div class="mt-[25px] flex justify-end">
          <a-button type="text" @click="() => formRef?.resetFields()">
            {{ t('button.reset') }}
          </a-button>
          <DialogClose as-child>
            <a-button>
              {{ t('button.cancel') }}
            </a-button>
          </DialogClose>
          <a-button type="primary" :loading="isPending" @click="(e) => formRef?.handleSubmit(e)">
            {{ t('button.submit') }}
          </a-button>
        </div>
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
