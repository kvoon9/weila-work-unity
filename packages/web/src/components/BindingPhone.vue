<script setup lang="ts">
import Message from '@arco-design/web-vue/es/message'
import { useMutation } from '@tanstack/vue-query'

const emits = defineEmits(['success'])
const { t } = useI18n()

interface BindingPhonePayload {
  phone: string
  password: string
  verify_code: string
  verify_img_code: string
}

const verifyImg = templateRef('verifyImg')

const formRef = templateRef('formRef')
const form = reactive<BindingPhonePayload>({
  phone: '',
  password: '',
  verify_code: '',
  verify_img_code: '',
})

const { mutate, isPending } = useMutation({
  mutationFn: (data: BindingPhonePayload) => $weilaRequestV1.post('/corp/web/user-bind-phone', data),
  onSuccess() {
    Message.success('Success')
  },
  onError(error) {
    Message.error(error.message || 'Request Error')

    verifyImg.value?.refetch()
  },
})

function handleSubmit() {
  return formRef.value?.validate((errors) => {
    if (errors)
      return

    mutate(form, {
      onSuccess: () => {
        formRef.value?.resetFields()
        emits('success')
      },
    })
  })
}
</script>

<template>
  <DialogRoot>
    <DialogTrigger>
      <slot />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="data-[state=open]:animate-overlayShow fixed inset-0 z-100 bg-black:60" />
      <DialogContent
        bg-base
        class="fixed left-[50%] top-[50%] z-[100] max-h-[85vh] max-w-[450px] w-[90vw] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] data-[state=open]:animate-ease-in bg-base focus:outline-none"
      >
        <DialogTitle class="m0 text-center text-lg font-semibold leading-loose">
          {{ t('binding-phone-form.title') }}
        </DialogTitle>

        <a-form ref="formRef" :model="form" layout="vertical" @submit="handleSubmit">
          <a-form-item
            :label="t('phone-number')" field="phone"
            :rules="[{ required: true, message: t('binding-phone-form.err-msg.phone-number') }]"
            :validate-trigger="['blur', 'change']"
          >
            <a-input v-model="form.phone" :max-length="12" show-word-limit />
          </a-form-item>

          <a-form-item
            :label="t('verify-image-code')" field="verify_img_code"
            :rules="[{ required: true, message: t('binding-phone-form.err-msg.verify-image-code') }]"
            :validate-trigger="['blur', 'change']"
          >
            <div class="flex items-center">
              <a-input v-model="form.verify_img_code" class="mr-2 flex-grow" />
              <VerifyImg ref="verifyImg" class="flex-shrink-0" />
            </div>
          </a-form-item>

          <a-form-item
            :label="t('sms-code')" field="verify_code"
            :rules="[{ required: true, message: t('binding-phone-form.err-msg.verify-code') }]"
            :validate-trigger="['blur', 'change']"
          >
            <div class="flex items-center">
              <a-input v-model="form.verify_code" :max-length="20" show-word-limit class="mr-2 flex-grow" />
              <SendSmsButton
                :opts="{
                  phone: form.phone,
                  verify_code: form.verify_code,
                  country_code: '86',
                  sms_type: 'bind-phone',
                }" @error="() => verifyImg?.refetch()"
              />
            </div>
          </a-form-item>

          <a-form-item
            :label="t('password')" field="password"
            :rules="[{ required: true, message: t('binding-phone-form.err-msg.password') }]"
            :validate-trigger="['blur', 'change']"
          >
            <a-input-password v-model="form.password" />
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
