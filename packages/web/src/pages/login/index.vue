<script lang="ts" setup>
import type { OnSubmitParams } from '~/types'
import { objectKeys } from '@antfu/utils'
import { Message } from '@arco-design/web-vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useAuthStore } from '~/stores/auth'

definePage({
  meta: {
    layout: 'first',
    requiresAuth: false,
  },
})

const { t } = useI18n()
const router = useRouter()
const qc = useQueryClient()
const authStore = useAuthStore()
const { login } = authStore
const { accountHistoryRecord } = storeToRefs(authStore)

interface Form {
  account: string
  password: string
}

const form = reactive<Form>({
  account: '',
  password: '',
})

const [isRememberPassword, toggleRememberPassword] = useToggle(false)

const { mutate, isPending, data } = useMutation({
  mutationFn: (params: Form) => login(params, { remember: isRememberPassword.value }),
  onSuccess(data) {
    Message.success({
      content: t('login.form.successMsg'),
    })

    if (!data)
      throw new Error('no data')

    router.push('/contact')
  },
})

$inspect(data)

function handleSubmit({ values, errors }: OnSubmitParams<Form>) {
  if (errors && objectKeys(errors).length)
    return

  mutate(values)
}

onMounted(async () => {
  const form = document.querySelector('form')
  form?.setAttribute('autocomplete', 'on')

  await qc.invalidateQueries()
  await qc.clear()
})
</script>

<template>
  <div class="login-form-wrapper">
    <div class="login-form-title" mb-4>
      {{ t('login.form.title') }}
    </div>
    <a-form :model="form" class="login-form" layout="vertical" @submit="handleSubmit">
      <a-form-item
        field="account" :rules="[{ required: true, message: t('login.form.userName.errMsg') }]"
        :validate-trigger="['change', 'blur']" hide-label
      >
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
      <a-form-item
        field="password" :rules="[{ required: true, message: t('login.form.password.errMsg') }]"
        :validate-trigger="['change', 'blur']" hide-label
      >
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
        <router-link to="/android-download">
          <a-button type="text" long class="login-form-register-btn">
            安卓 APP 下载
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
