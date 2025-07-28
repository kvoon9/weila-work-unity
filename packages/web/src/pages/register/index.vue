<script lang="ts" setup>
import { Message } from '@arco-design/web-vue'
import md5 from 'md5'
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

const { form, rules, handleSubmit: handleRegister } = useForm(v.object({
  phone: v.string(),
  verify_answer: v.string(),
  password: v.string(),
}))

const { data, refetch: refreshImageCode } = useWeilaFetch<{ id: string, image: string }>('common/get-image-verifycode')

const { mutate: sendSmsVerifyCode } = useWeilaMutation<any, {
  phone: string
  countrycode: string
  verify_id: string
  verify_answer: string
  smstype: 'work-regist' | 'work-login'
}>('common/send-sms-verifycode')

const { mutate } = useWeilaMutation<{
  user_name: string
  country_code: string
  password: string
}>('/corp/web/regist', {
  onSuccess() {

  },
})

const imageCodeModalVisible = shallowRef(false)
const imageCode = shallowRef('')

function handleSendSmsCode() {
  if (!form.value.phone) {
    Message.warning('请输入手机号')
    return
  }

  if (data.value) {
    imageCodeModalVisible.value = true
    imageCode.value = ''
  }
}

function handleImageCodeConfirm() {
  if (!data.value?.id) {
    Message.error('图形验证码异常')
    return
  }

  if (!imageCode.value.trim()) {
    Message.warning('请输入图形验证码')
    return
  }

  if (!form.value.phone) {
    Message.error('获取手机号失败，请重试')
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
      imageCodeModalVisible.value = false
      imageCode.value = ''
      Message.success('短信发送成功')
    },
  })
}

function handleImageCodeCancel() {
  imageCodeModalVisible.value = false
  imageCode.value = ''
}

const register = handleRegister((values: any) => {
  mutate({
    phone: values.phone,
    country_code: values.country_code,
    verify_code: values.verify_code,
    password: md5(values.password),
  })
})
</script>

<template>
  <div class="login-form-wrapper">
    <div class="login-form-title">
      {{ t('register.form.title') }}
    </div>
    <a-form :model="form" :rules class="login-form" layout="vertical" @submit="handleRegister">
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

      <a-form-item field="verify_answer" hide-label>
        <a-input
          v-model="form.verify_answer" :placeholder="t('register.form.verifyCode.placeholder')" allow-clear mr4
          w-auto
        />
        <!-- TODO: button -->
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
