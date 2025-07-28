<script lang="ts" setup>
import { useQueryClient } from '@tanstack/vue-query'
import md5 from 'md5'
import * as v from 'valibot'
import { useForm } from 'zod-arco-rules/valibot'
import { useWeilaMutation } from '~/composables/useWeilaMutation'
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

const { form, rules, handleSubmit } = useForm(v.object({
  account: v.string(),
  password: v.string(),
}))

const [isRememberPassword, toggleRememberPassword] = useToggle(false)

const { mutate, isPending } = useWeilaMutation<{ access_token: string }>('/corp/auth/login', {
  onSuccess,
})

function onSuccess(res: any) {
  localStorage.setItem('token', res.access_token)
  accountHistoryRecord.value.set(form.value.account, form.value.password)

  router.push('/contact/org').catch(console.error)
}

const submit = handleSubmit((values: any) => {
  mutate({ ...values, password: md5(values.password) })
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
    <a-form :model="form" :rules class="login-form" layout="vertical" @submit="submit">
      <a-form-item field="account" hide-label>
        <a-auto-complete
          v-model="form.account" :data="Array.from(accountHistoryRecord.keys())"
          :placeholder="t('login.form.userName.placeholder')" allow-clear relative
          @select="(account: string) => form.password = accountHistoryRecord.get(account) || form.password"
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
          v-model="form.password"
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
        <a-button type="primary" html-type="submit" long :loading="isPending">
          {{ t('login.form.login') }}
        </a-button>
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
