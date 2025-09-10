<script lang="ts" setup>
import type { SendVerifySmsBody } from '~/api/verify-sms'
import { Message } from '@arco-design/web-vue'
import md5 from 'md5'
import * as v from 'valibot'
import { shallowRef } from 'vue'
import { useForm } from 'zod-arco-rules/valibot'
import { useSmsCountdown } from '~/composables/useSmsCountdown'

definePage({
  meta: {
    layout: 'first',
    requiresAuth: false,
  },
})

const { t } = useI18n()

const { form, rules, handleSubmit } = useForm(v.object({
  phone: v.pipe(
    v.string(() => t('form.error.phone-nonempty')),
    v.minLength(11, () => t('form.error.phone-minLength')),
    v.maxLength(11, () => t('form.error.phone-maxLength')),
  ),
  country_code: v.optional(v.string(), '86'),
  verifycode:
    v.string(() => t('form.error.verify-code-nonempty')),
  password:
    v.string(() => t('form.error.password-nonempty')),
}))
const { data, refetch: refreshImageCode } = useWeilaFetch<{ id: string, image: string }>('common/get-image-verifycode?width=160&height=80')

const { mutateAsync: sendSmsVerifyCode } = useWeilaMutation<never, SendVerifySmsBody>('common/send-sms-verifycode')

const router = useRouter()
const privacyAgreed = shallowRef(false)

const { mutate: regist } = useWeilaMutation<{
  phone: string
  country_code: string
  password: string
}>('/corp/auth/regist', {
  onSuccess() {
    router.push('/login')
    Message.success(t('message.success'))
  },
})

const imageCode = shallowRef('')
const { countdown, isCounting: isActive, updateSendTime } = useSmsCountdown('sms-register')

function handleSendSmsCode() {
  if (!data.value?.id) {
    Message.error(t('message.verify-code-error'))
    return
  }

  if (!imageCode.value.trim()) {
    Message.warning(t('binding-phone-form.placeholder.image-verifycode'))
    return
  }

  if (!form.value.phone) {
    Message.error(t('message.get-phone-error'))
    return
  }

  sendSmsVerifyCode({
    phone: form.value.phone,
    countrycode: '86',
    verify_id: data.value.id,
    verify_answer: imageCode.value.trim(),
    smstype: 'work-regist',
  }, {
    onSuccess: () => {
      Message.success(t('message.success'))
      // 更新发送时间，启动倒计时
      updateSendTime()
    },
  })
}


const submit = handleSubmit((values: any) => {
  if (!privacyAgreed.value) {
    Message.error(t('form.error.privacy-agreement-required'))
    return
  }
  regist({
    phone: values.phone,
    country_code: values.country_code || '86',
    verifycode: values.verifycode,
    password: md5(values.password),
  })
})
</script>

<template>
  <div class="login-form-wrapper">
    <div text-10 text-center leading-loose my8 font-semibold>
      {{ $t('project-name') }}
    </div>
    <div class="login-form-title" mb4 color-neutral-500>
      {{ t('register.form.title') }}
    </div>
    <a-form :model="form" :rules class="login-form" layout="vertical" @submit="submit">
      <a-form-item field="phone" hide-label>
        <a-input
          v-model="form.phone" :max-length="20" :placeholder="t('register.form.phone.placeholder')" allow-clear
          show-word-limit
        >
          <template #prepend>
            <a-tag>
              +86
            </a-tag>
          </template>
        </a-input>
      </a-form-item>

      <a-form-item>
        <a-space>
          <a-input
            v-model="imageCode"
            allow-clear
            :max-length="6"
            :placeholder="t('binding-phone-form.placeholder.image-verifycode')"
          />
          <img v-if="data?.image" :src="data.image" min-w-30 @click="() => refreshImageCode()">
        </a-space>
      </a-form-item>

      <a-form-item field="verifycode" hide-label>
        <a-input v-model="form.verifycode" :placeholder="t('register.form.verifyCode.placeholder')" allow-clear pr0>
          <template #suffix>
            <a-button
              type="text"
              :loading="false"
              :disabled="!(form.phone && imageCode) || isActive"
              @click="handleSendSmsCode"
            >
              {{ isActive ? `${countdown}s` : $t('get-sms-code') }}
            </a-button>
          </template>
        </a-input>
      </a-form-item>

      <a-form-item field="password" hide-label>
        <a-input-password v-model="form.password" :placeholder="t('login.form.password.placeholder')" allow-clear>
          <template #prefix>
            <icon-lock />
          </template>
        </a-input-password>
      </a-form-item>

      <a-space :size="16" direction="vertical">
        <div flex="~ justify-between">
          <a-checkbox v-model="privacyAgreed">
            {{ $t('i-have-read-and-agree') }}
          </a-checkbox>

          <a-link href="https://demoui.weila.hk/common/corp-web/privacy">
            {{ t('privacy-agreement') }}
          </a-link>
        </div>
        <a-button type="primary" long html-type="submit" :disabled="!privacyAgreed">
          {{ t('register.form.submit') }}
        </a-button>

        <router-link to="/login">
          <a-button type="text" long class="login-form-register-btn">
            {{ t('register.form.login') }}
          </a-button>
        </router-link>
      </a-space>
    </a-form>
  </div>
</template>

<style lang="less" scoped>
.login-form {
  &-wrapper {
    width: 320px;
  }

  &-title {
    font-weight: 500;
    font-size: 24px;
    line-height: 32px;
  }

  &-sub-title {
    color: var(--color-text-3);
    font-size: 16px;
    line-height: 24px;
  }

  &-error-msg {
    height: 32px;
    color: rgb(var(--red-6));
    line-height: 32px;
  }

  &-password-actions {
    display: flex;
    justify-content: space-between;
  }

  &-register-btn {
    color: var(--color-text-3) !important;
  }
}
</style>
