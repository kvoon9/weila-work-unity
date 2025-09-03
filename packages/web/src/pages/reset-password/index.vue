<script setup lang="ts">
import type { SendVerifySmsBody } from '~/api/verify-sms'
import { Message } from '@arco-design/web-vue'
import * as v from 'valibot'
import { shallowRef } from 'vue'
import { useForm } from 'zod-arco-rules/valibot'

definePage({
  meta: {
    layout: 'first',
    requiresAuth: false,
  },
})

const { t } = useI18n()
const router = useRouter()

const { form, rules, handleSubmit } = useForm(v.object({
  phone: v.pipe(
    v.string(() => t('form-error.phone-required')),
    v.minLength(11, () => t('form-error.phone-min-length')),
    v.maxLength(11, () => t('form-error.phone-max-length')),
  ),
  country_code: v.optional(v.string(), '86'),
  verifycode: v.pipe(v.string(() => t('form-error.verifycode-required'))),
  password: v.string(() => t('form-error.password-required')),
}))
const { data, refetch: refreshImageCode } = useWeilaFetch<{ id: string, image: string }>('common/get-image-verifycode?width=160&height=80')

const { mutate: sendSmsVerifyCode } = useWeilaMutation<never, SendVerifySmsBody>('common/send-sms-verifycode')

const imageCodeModalVisible = shallowRef(false)
const imageCode = shallowRef('')

let currentPhoneInfo: {
  phone: string
  countrycode: string
} | null = null

const { mutate: resetPassword, isPending: isSubmiting } = useWeilaMutation('/corp/auth/reset-password')

const submit = handleSubmit((values) => {
  resetPassword(values)
})

function handleSendSmsCode() {
  if (!form.value.phone) {
    Message.warning(t('message.please-enter-phone-number'))
    return
  }

  currentPhoneInfo = {
    phone: form.value.phone,
    countrycode: form.value.country_code || '86',
  }

  if (data.value) {
    imageCodeModalVisible.value = true
    imageCode.value = ''
  }
}

function handleImageCodeConfirm() {
  if (!data.value?.id) {
    Message.error(t('message.verify-code-error'))
    return
  }

  if (!imageCode.value.trim()) {
    Message.warning(t('binding-phone-form.placeholder.image-verifycode'))
    return
  }

  if (!currentPhoneInfo) {
    Message.error(t('message.get-phone-error'))
    return
  }

  sendSmsVerifyCode({
    phone: currentPhoneInfo.phone,
    countrycode: currentPhoneInfo.countrycode,
    verify_id: data.value.id,
    verify_answer: imageCode.value.trim(),
    smstype: 'work-reset-password',
  }, {
    onSuccess: () => {
      imageCodeModalVisible.value = false
      imageCode.value = ''
      Message.success(t('message.success'))
    },
  })
}

function handleImageCodeCancel() {
  imageCodeModalVisible.value = false
  imageCode.value = ''
}
</script>

<template>
  <div class="reset-password-form-wrapper">
    <div class="reset-password-form-title" mb-4>
      {{ t('reset-password-form.title') }}
    </div>

    <a-form :model="form" :rules layout="vertical" @submit="submit">
      <a-form-item field="phone" hide-label>
        <a-input-group>
          <a-select v-model="form.country_code" style="width: 90px" :placeholder="t('binding-phone-form.placeholder.country-code')">
            <a-option value="86" label="+86" />
            <a-option value="852" label="+852" />
            <a-option value="853" label="+853" />
            <a-option value="886" label="+886" />
          </a-select>
          <a-input
            v-model="form.phone"
            :placeholder="t('phone')"
            allow-clear
          />
        </a-input-group>
      </a-form-item>

      <a-form-item field="verifycode" hide-label>
        <a-input
          v-model="form.verifycode"
          :placeholder="$t('verify-code')"
          allow-clear
        >
          <template #suffix>
            <a-button
              type="text"
              :loading="false"
              :disabled="!form.phone"
              @click="handleSendSmsCode"
            >
              {{ $t('get-sms-code') }}
            </a-button>
          </template>
        </a-input>
      </a-form-item>

      <a-form-item field="password" hide-label>
        <a-input-password
          v-model="form.password"
          :placeholder="t('form-placeholder.please-enter-new-password')"
          allow-clear
        />
      </a-form-item>

      <a-button type="primary" html-type="submit" :loading="isSubmiting" long>
        {{ t('button.submit') }}
      </a-button>
      <a-button type="text" long mt-4 @click="() => router.go(-1)">
        {{ t('button.login') }}
      </a-button>
    </a-form>

    <a-modal
      v-model:visible="imageCodeModalVisible"
      :title="t('img-verify-code')"
      :footer="false"
      @cancel="handleImageCodeCancel"
    >
      <div space-y-8>
        <div flex gap2>
          <a-input
            v-model="imageCode"
            :placeholder="t('binding-phone-form.placeholder.image-verifycode')"
            allow-clear
            :max-length="6"
          />
          <img v-if="data?.image" :src="data.image" @click="() => refreshImageCode()">
        </div>
        <div flex gap4>
          <div flex-1 />
          <a-button @click="handleImageCodeCancel">
            {{ $t('button.cancel') }}
          </a-button>
          <a-button type="primary" @click="handleImageCodeConfirm">
            {{ $t('button.ok') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
.reset-password-form {
  &-wrapper {
    width: 320px;
  }

  &-title {
    color: var(--color-text-1);
    font-weight: 500;
    font-size: 24px;
    line-height: 32px;
  }
}
</style>
