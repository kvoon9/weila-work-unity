<script lang="ts" setup>
import { Message } from '@arco-design/web-vue'
import md5 from 'md5'
import * as v from 'valibot'
import { shallowRef } from 'vue'
import { useForm } from 'zod-arco-rules/valibot'
import { SendVerifySmsBody } from '~/api/verify-sms'

definePage({
  meta: {
    layout: 'first',
    requiresAuth: false,
  },
})

const { t } = useI18n()

const { form, rules, handleSubmit } = useForm(v.object({
  phone: v.string(),
  country_code: v.optional(v.string(), '86'),
  verifycode: v.string(),
  password: v.string(),
}))

const { data, refetch: refreshImageCode } = useWeilaFetch<{ id: string, image: string }>('common/get-image-verifycode')

const { mutate: sendSmsVerifyCode } = useWeilaMutation<never, SendVerifySmsBody>('common/send-sms-verifycode')

const { mutate: regist } = useWeilaMutation<{
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

const submit = handleSubmit((values: any) => {
  regist({
    user_name: values.phone,
    country_code: values.country_code || '86',
    verifycode: values.verifycode,
    password: md5(values.password),
  })
})
</script>

<template>
  <div class="login-form-wrapper">
    <div class="login-form-title" mb4>
      {{ t('register.form.title') }}
    </div>
    <a-form :model="form" :rules class="login-form" layout="vertical" @submit="submit">
      <a-form-item field="phone" hide-label>
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

      <a-form-item field="verifycode" hide-label>
        <a-input v-model="form.verifycode" :placeholder="t('register.form.verifyCode.placeholder')" allow-clear mr4 w-auto>
          <template #suffix>
            <a-button
              type="text"
              :loading="false"
              :disabled="!form.phone"
              @click="handleSendSmsCode"
            >
              获取短信验证码
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

    <a-modal
      v-model:visible="imageCodeModalVisible"
      title="图形验证"
      :footer="false"
      @cancel="handleImageCodeCancel"
    >
      <div space-y-8>
        <div flex gap2>
          <a-input
            v-model="imageCode"
            placeholder="请输入图形验证码"
            allow-clear
            :max-length="6"
          />
          <img v-if="data?.image" :src="data.image" alt="验证码" @click="() => refreshImageCode()">
        </div>
        <div flex gap4>
          <div flex-1 />
          <a-button @click="handleImageCodeCancel">
            取消
          </a-button>
          <a-button type="primary" @click="handleImageCodeConfirm">
            确认
          </a-button>
        </div>
      </div>
    </a-modal>
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
