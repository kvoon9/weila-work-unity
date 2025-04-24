<script setup lang="ts">
import Message from '@arco-design/web-vue/es/message'
import { useMutation } from '@tanstack/vue-query'
import md5 from 'md5'
import { weilaApiUrl } from '~/api'

definePage({
  meta: {
    layout: 'first',
    requiresAuth: false,
  },
})

const { t } = useI18n()
const router = useRouter()

interface Model {
  phone: string
  country_code: '86'
  verify_code: string
  verify_img_code: string
  password: string
}

const verifyImg = templateRef('verifyImg')

const form = reactive<Model>({
  phone: '',
  password: '',
  country_code: '86',
  verify_code: '',
  verify_img_code: '',
})

const { mutate: submit, isPending: isSubmiting } = useMutation({
  mutationFn: async (data: Model) => {
    return await weilaRequest.post(weilaApiUrl('/corp/web/reset-password'), {
      ...data,
      password: md5(data.password),
    })
  },
  onSuccess() {
    Message.success(t('message.success'))
  },
  onError(error) {
    Message.error(error.message || 'Request Error')

    verifyImg.value?.refetch()
  },
})
</script>

<template>
  <div p2>
    <h2 class="mb-6 text-2xl font-bold">
      {{ t('reset-password-form.title') }}
    </h2>

    <a-form :model="form" layout="vertical" @submit="() => submit(form)">
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
            classes="flex-shrink-0" :opts="{
              phone: form.phone,
              verify_code: form.verify_img_code,
              country_code: '86',
              sms_type: 'reset-password',
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

      <a-button type="primary" html-type="submit" :loading="isSubmiting" class="w-full">
        {{ t('button.submit') }}
      </a-button>
      <a-button mt2 color-gray-3 type="text" @click="() => router.go(-1)">
        {{ t('button.login') }}
      </a-button>
    </a-form>
  </div>
</template>
