<script lang="ts" setup>
import type { OnSubmitParams } from '~/types'
import { objectKeys } from '@antfu/utils'
import Message from '@arco-design/web-vue/es/message'
import { useMutation } from '@tanstack/vue-query'
import md5 from 'md5'
import { shallowRef } from 'vue'

import { useAuthStore } from '~/stores/auth'

definePage({
  meta: {
    layout: 'first',
    requiresAuth: false,
  },
})

const { login } = useAuthStore()

const { t } = useI18n()
const errorMessage = shallowRef('')

const verifyImg = templateRef('verifyImg')

const account = shallowRef('')
const router = useRouter()

interface Form {
  phone: string
  verify_code: string
  img_verify_code: string
  password: string
}

const form = reactive<Form>({
  phone: '',
  verify_code: '',
  img_verify_code: '',
  password: '',
})

const { mutate: register } = useMutation({
  async mutationFn(params: Omit<Form, 'img_verify_code'>) {
    const { data } = await weilaRequest.post<{
      user_name: string
      country_code: string
      password: string // temp password
    }>('/corp/web/regist', params)

    if (!data)
      throw new Error('Request Error')

    account.value = data.user_name
    return data
  },
  onSuccess(data) {
    Message.success({
      content: t('register.form.successMsg'),
    })
    // isCopyModalVisible.value = true
    login({
      account: data.user_name,
      password: data.password,
    })
      .then(() => {
        router.push('/contact')
      })
  },
})

function handleSubmit({ values, errors }: OnSubmitParams<Omit<Form, 'img_verify_code'>>) {
  if (errors && objectKeys(errors).length)
    return

  register({
    phone: values.phone,
    verify_code: values.verify_code,
    password: md5(values.password),
  })
}

function onVerifyImgCodeError() {
  verifyImg.value?.refetch()
  form.img_verify_code = ''
}
</script>

<template>
  <div class="login-form-wrapper">
    <div class="login-form-title">
      {{ t('register.form.title') }}
    </div>
    <div class="login-form-error-msg">
      {{ errorMessage }}
    </div>
    <!-- @vue-expect-error type error -->
    <a-form :model="form" class="login-form" layout="vertical" @submit="handleSubmit">
      <a-form-item
        field="phone" :rules="[{ required: true, message: t('register.form.phone.errMsg') }]"
        :validate-trigger="['change', 'blur']" hide-label
      >
        <a-input
          v-model="form.phone" :max-length="20" :placeholder="t('register.form.phone.placeholder')" allow-clear
          show-word-limit w-320px
        >
          <template #prepend>
            <a-tag>
              +86
            </a-tag>
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        field="img_verify_code"
        :rules="[{ required: true, message: t('register.form.imgVerifyCode.errMsg') }]"
        :validate-trigger="['change', 'blur']" hide-label
      >
        <a-input
          v-model="form.img_verify_code" :placeholder="t('register.form.imgVerifyCode.placeholder')" allow-clear
          mr4 w50
        />
        <VerifyImg ref="verifyImg" />
      </a-form-item>

      <a-form-item
        field="verify_code" :rules="[{ required: true, message: t('register.form.verifyCode.errMsg') }]"
        :validate-trigger="['change', 'blur']" hide-label
      >
        <a-input
          v-model="form.verify_code" :placeholder="t('register.form.verifyCode.placeholder')" allow-clear mr4
          w-auto
        />
        <SendSmsButton
          :opts="{
            phone: form.phone,
            verify_code: form.img_verify_code,
            sms_type: 'regist',
            country_code: '86',
          }" @error="onVerifyImgCodeError"
        />
      </a-form-item>

      <a-form-item
        field="password" :rules="[{ required: true, message: t('register.form.password.errMsg') }]"
        :validate-trigger="['change', 'blur']" hide-label
      >
        <a-input-password v-model="form.password" :placeholder="t('login.form.password.placeholder')" allow-clear>
          <template #prefix>
            <icon-lock />
          </template>
        </a-input-password>
      </a-form-item>

      <a-space :size="16" direction="vertical">
        <a-button type="primary" long html-type="submit">
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
    color: var(--color-text-1);
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
