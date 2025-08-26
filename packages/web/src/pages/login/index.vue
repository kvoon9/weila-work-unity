<script lang="ts" setup>
import type { SendVerifySmsBody } from '~/api/verify-sms'
import type { AuthModel } from '~/stores/auth'
import type { Corp } from '~/types'
import { Message } from '@arco-design/web-vue'
import md5 from 'md5'
import * as v from 'valibot'
import { shallowRef } from 'vue'
import { useForm } from 'zod-arco-rules/valibot'
import { useLocalCrypto } from '~/composables/useLocalCrypto'
import { autoLogin } from '~/shared/states'

definePage({
  meta: {
    layout: 'first',
    requiresAuth: false,
  },
})

const authStore = useAuthStore()
const router = useRouter()
const accountHistoryRecord = useLocalCrypto('account-history-record')
const tempAccount = useLocalCrypto('temp-account')

const { t } = useI18n()
const activeTab = shallowRef<'password' | 'sms'>('password')

const { form: loginForm, rules: loginRules, handleSubmit: handleLogin } = useForm(v.object({
  account: v.string('账号不能为空'),
  password: v.string('密码不能为空'),
}))

const { form: smsLoginForm, rules: smsLoginRules, handleSubmit: handleSmsLogin } = useForm(v.object({
  phone: v.string('手机号不能为空'),
  country_code: v.optional(v.string(), '86'),
  verifycode: v.string('验证码不能为空'),
}))

$inspect(activeTab)

const { data, refetch: refreshImageCode } = useWeilaFetch<{ id: string, image: string }>(
  'common/get-image-verifycode?width=160&height=80',
  {},
  {
    enabled: () => activeTab.value === 'sms',
  },
)

const { mutateAsync: sendSmsVerifyCode } = useWeilaMutation<never, SendVerifySmsBody>('common/send-sms-verifycode')

const imageCodeModalVisible = shallowRef(false)
const imageCode = shallowRef('')

watchEffect(() => imageCodeModalVisible.value && refreshImageCode())

let currentPhoneInfo: {
  phone: string
  countrycode: string
} | null = null

const [isRememberPassword, toggleRememberPassword] = useToggle(false)

const { mutateAsync: passwordLogin, isPending: passwordPending } = useWeilaMutation('/corp/auth/login', {
  // @ts-expect-error type error
  onSuccess,
})

const { mutateAsync: smsLogin, isPending: smsPending } = useWeilaMutation('/corp/auth/login-by-sms', {
  // @ts-expect-error type error
  onSuccess,
})

if (autoLogin.value && tempAccount.value.size) {
  passwordLogin({
    account: tempAccount.value.get('account'),
    password: tempAccount.value.get('password'),
  })
}

function onSuccess({ access_token, expires_in, refresh_token, org, account }: AuthModel & {
  org?: Corp
  account: {
    user_number: string
    password: string
    country_code: string
  }
}) {
  authStore.$patch({
    token: access_token,
    expiresIn: expires_in,
    refreshToken: refresh_token,
    loginTime: Date.now(),
  })

  tempAccount.value.set('account', account.user_number)
  tempAccount.value.set('password', account.password)
  autoLogin.value = true

  if (activeTab.value === 'password' && isRememberPassword.value) {
    accountHistoryRecord.value.set(loginForm.value.account, loginForm.value.password)
  }

  nextTick(() => {
    if (!org)
      router.push('/create-org')
    else
      router.replace('/contact/org')
  })
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
  passwordLogin({ ...values, password: md5(values.password) })
})

const loginBySms = handleSmsLogin((values: any) => {
  smsLogin(values)
})

// onMounted(async () => {
//   const form = document.querySelector('form')
//   form?.setAttribute('autocomplete', 'on')
// })
</script>

<template>
  <div class="login-form-wrapper">
    <div text-10 text-center leading-loose my8 font-semibold>
      微喇企业版
    </div>
    <div class="login-form-title" mb-4 color-neutral-500>
      {{ t('login.form.title') }}
    </div>
    <a-tabs v-model:active-key="activeTab">
      <a-tab-pane key="password" title="账号密码登录">
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
      <a-tab-pane key="sms" title="手机号登录">
        <a-form :model="smsLoginForm" :rules="smsLoginRules" class="login-form" layout="vertical" @submit="loginBySms">
          <a-form-item field="phone" hide-label>
            <a-input-group flex w-full>
              <a-select v-model="smsLoginForm.country_code" w-fit placeholder="区号">
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
                flex-1
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
              pr0
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
          <img v-if="data?.image" :src="data.image" alt="验证码" min-w-30 @click="() => refreshImageCode()">
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
