<script lang="ts" setup>
import type { SendVerifySmsBody } from '~/api/verify-sms'
import { Message } from '@arco-design/web-vue'
import { useQueryClient } from '@tanstack/vue-query'
import md5 from 'md5'
import * as v from 'valibot'
import { shallowRef } from 'vue'
import { useForm } from 'zod-arco-rules/valibot'
import { accountHistoryRecord } from '~/shared/const'

definePage({
  meta: {
    layout: 'first',
    requiresAuth: false,
  },
})

const { t } = useI18n()
const router = useRouter()
const qc = useQueryClient()
const activeTab = shallowRef<'password' | 'sms'>('password')

const { form: loginForm, rules: loginRules, handleSubmit: handleLogin } = useForm(v.object({
  account: v.string(),
  password: v.string(),
}))

const { form: smsLoginForm, rules: smsLoginRules, handleSubmit: handleSmsLogin } = useForm(v.object({
  phone: v.string(),
  country_code: v.optional(v.string(), '86'),
  verifycode: v.string(),
}))

$inspect(activeTab)

const { data, refetch: refreshImageCode } = useWeilaFetch<{ id: string, image: string }>(
  'common/get-image-verifycode',
  // @ts-expect-error type error
  {
    enabled: () => activeTab.value === 'sms',
  },
)

const { mutate: sendSmsVerifyCode } = useWeilaMutation<never, SendVerifySmsBody>('common/send-sms-verifycode')

const imageCodeModalVisible = shallowRef(false)
const imageCode = shallowRef('')

let currentPhoneInfo: {
  phone: string
  countrycode: string
} | null = null

const [isRememberPassword, toggleRememberPassword] = useToggle(false)

const { mutate: passwordMutate, isPending: passwordPending } = useWeilaMutation<{ access_token: string }>('/corp/auth/login', {
  onSuccess,
})

const { mutate: smsMutate, isPending: smsPending } = useWeilaMutation<{ access_token: string }>('/corp/auth/login-by-sms', {
  onSuccess,
})

function onSuccess(res: any) {
  localStorage.setItem('token', res.access_token)
  if (activeTab.value === 'password') {
    accountHistoryRecord.value.set(loginForm.value.account, loginForm.value.password)
  }
  router.push('/contact/org').catch(console.error)
}

function handleSendSmsCode() {
  if (!smsLoginForm.value.phone) {
    Message.warning('请输入手机号')
    return
  }

  currentPhoneInfo = {
    phone: smsLoginForm.value.phone,
    countrycode: smsLoginForm.value.country_code || '86',
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
    smstype: 'work-login',
  }, {
    onSuccess: () => {
      imageCodeModalVisible.value = false
      imageCode.value = ''
      Message.success('短信发送成功')
      // 这里可以账号密码添加倒计时等逻辑
    },
  })
}

function handleImageCodeCancel() {
  imageCodeModalVisible.value = false
  imageCode.value = ''
}

const login = handleLogin((values: any) => {
  passwordMutate({ ...values, password: md5(values.password) })
})

const loginBySms = handleSmsLogin((values: any) => {
  smsMutate(values)
})

onMounted(async () => {
  const form = document.querySelector('form')
  form?.setAttribute('autocomplete', 'on')

  await qc.invalidateQueries()
  qc.clear()
})
</script>

<template>
  <div class="login-form-wrapper">
    <div class="login-form-title" mb-4>
      {{ t('login.form.title') }}
    </div>
    <a-tabs v-model:active-key="activeTab">
      <a-tab-pane key="password" title="密码登录">
        <a-form :model="loginForm" :rules="loginRules" class="login-form" layout="vertical" @submit="login">
          <a-form-item field="account" hide-label>
            <a-auto-complete
              v-model="loginForm.account" :data="Array.from(accountHistoryRecord.keys())"
              :placeholder="t('login.form.userName.placeholder')" allow-clear relative
              @select="(account: string) => loginForm.password = accountHistoryRecord.get(account) || loginForm.password"
            >
              <template #option="{ data: { label } }">
                <div w-full flex justify-between>
                  <span>
                    {{ label }}
                  </span>
                </div>
              </template>
            </a-auto-complete>
          </a-form-item>
          <a-form-item field="password" hide-label>
            <a-input-password
              v-model="loginForm.password"
              :input-attrs="{ password: 'password', autocomplete: 'current-password' }"
              :placeholder="t('login.form.password.placeholder')" allow-clear :invisible-button="false"
            >
              <template #prefix>
                <icon-lock />
              </template>
            </a-input-password>
          </a-form-item>
          <a-space :size="16" direction="vertical">
            <div class="login-form-password-actions">
              <a-checkbox
                checked="rememberPassword" :model-value="isRememberPassword"
                @change="() => toggleRememberPassword()"
              >
                {{ t('login.form.rememberPassword') }}
              </a-checkbox>
              <RouterLink to="/reset-password">
                <a-link>{{ t('login.form.forgetPassword') }}</a-link>
              </RouterLink>
            </div>
            <a-button type="primary" html-type="submit" long :loading="passwordPending">
              {{ t('login.form.login') }}
            </a-button>
          </a-space>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="sms" title="短信登录">
        <a-form :model="smsLoginForm" :rules="smsLoginRules" class="login-form" layout="vertical" @submit="loginBySms">
          <a-form-item field="phone" hide-label>
            <a-input-group>
              <a-select v-model="smsLoginForm.country_code" style="width: 90px" placeholder="区号">
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
                v-model="smsLoginForm.phone"
                placeholder="请输入手机号"
                allow-clear
              />
            </a-input-group>
          </a-form-item>
          <a-form-item field="verifycode" hide-label>
            <a-input
              v-model="smsLoginForm.verifycode"
              placeholder="请输入验证码"
              allow-clear
            >
              <template #suffix>
                <a-button
                  type="text"
                  :loading="false"
                  :disabled="!smsLoginForm.phone"
                  @click="handleSendSmsCode"
                >
                  获取短信验证码
                </a-button>
              </template>
            </a-input>
          </a-form-item>
          <a-space :size="16" direction="vertical">
            <a-button type="primary" html-type="submit" long :loading="smsPending">
              {{ t('login.form.login') }}
            </a-button>
          </a-space>
        </a-form>
      </a-tab-pane>
    </a-tabs>
    <a-space :size="16" w-full direction="vertical" style="margin-top: 16px;">
      <router-link to="/register">
        <a-button type="text" long class="login-form-register-btn">
          {{ t('login.form.register') }}
        </a-button>
      </router-link>
      <a href="https://demo.weila.hk/weila-content/#/app-download">
        <a-button type="text" long class="login-form-register-btn">
          安卓 APP 下载
        </a-button>
      </a>
    </a-space>

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
