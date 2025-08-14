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
  phone: v.string(),
  country_code: v.optional(v.string(), '86'),
  verifycode: v.string(),
  password: v.string(),
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
    Message.warning('请输入手机号')
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
    Message.error('图形验证码异常')
    return
  }

  if (!imageCode.value.trim()) {
    Message.warning('请输入图形验证码')
    return
  }

  if (!currentPhoneInfo) {
    Message.error('获取手机号失败，请重试')
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
      Message.success('短信发送成功')
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
          <a-select v-model="form.country_code" style="width: 90px" placeholder="区号">
            <a-option value="86">
              +86
            </a-option>
            <a-option value="852">
              +852
            </a-option>
            <a-option value="853">
              +853
            </a-option>
            <a-option value="886">
              +886
            </a-option>
          </a-select>
          <a-input
            v-model="form.phone"
            placeholder="请输入手机号"
            allow-clear
          />
        </a-input-group>
      </a-form-item>

      <a-form-item field="verifycode" hide-label>
        <a-input
          v-model="form.verifycode"
          placeholder="请输入验证码"
          allow-clear
        >
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
        <a-input-password
          v-model="form.password"
          placeholder="请设置新密码"
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
