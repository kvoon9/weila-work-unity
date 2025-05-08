<script setup lang="ts">
import { objectKeys } from '@antfu/utils'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { nextTick, shallowRef } from 'vue'

import { loginSchema as formSchema } from '~/stores/auth'

definePageMeta({
  layout: 'welcome',
  meta: {
    public: true,
  },
  alias: '/',
})

appHead.value = '微喇企业管理系统'

const { toast } = useToast()

const { login } = useAuthStore()

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(formSchema),
})

const remember = shallowRef(false)
const showSuggestions = shallowRef(false)
const { accountHistoryRecord } = storeToRefs(useAuthStore())

const [account, accountAttrs] = defineField('account')
const [password, passwordAttrs] = defineField('password')

watchEffect(() => {
  if (!account.value)
    password.value = ''
})

const onSubmit = handleSubmit((form) => {
  login(form, {
    remember: remember.value,
  }).catch((errmsg) => {
    toast({
      title: '登录失败',
      description: String(errmsg),
    })
  })
}, ({ errors }) => document.querySelector(`label[for="${objectKeys(errors)[0]}"]`)?.scrollIntoView())

function selectAccount(selectedAccount: string) {
  account.value = selectedAccount
  password.value = accountHistoryRecord.value.get(selectedAccount) || ''
  showSuggestions.value = false
}

function deleteAccount(e: Event, selectedAccount: string) {
  e.stopPropagation()
  accountHistoryRecord.value.delete(selectedAccount)
  toast({
    description: '已删除该账号记录',
  })
}
</script>

<template>
  <div class="mx-auto grid w-[350px] gap-6 p-4 rounded-md shadow-sm">
    <div class="grid gap-2 text-center">
      <h1 class="text-3xl font-bold">
        登录
      </h1>
      <p class="text-balance text-muted-foreground">
        输入微喇号或手机号登录
      </p>
    </div>
    <form flex flex-col space-y-2 @submit="onSubmit">
      <label label for="account">账号</label>
      <div relative w-full>
        <input
          v-bind="accountAttrs"
          v-model="account"
          w-full
          input
          type="text"
          name="account"
          autocomplete="off"
          @focus="showSuggestions = true"
          @blur="nextTick(() => showSuggestions = false)"
        >
        <div
          v-if="showSuggestions && accountHistoryRecord.size"
          class="absolute left-0 right-0 top-full mt-1 max-h-40 overflow-y-auto rounded border bg-white shadow-lg z-10"
        >
          <div
            v-for="savedAccount in Array.from(accountHistoryRecord.keys())"
            :key="savedAccount"
            class="cursor-pointer px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
            @mousedown="selectAccount(savedAccount)"
          >
            <span>{{ savedAccount }}</span>
            <button
              type="button"
              class="color-neutral-500 hover:color-neutral-700 p-1 rounded"
              @mousedown.stop="(e) => deleteAccount(e, savedAccount)"
            >
              <Icon name="carbon:trash-can" />
            </button>
          </div>
        </div>
        <!-- clear button -->
        <button
          v-if="account"
          type="button"
          class="absolute right-0 top-0 bottom-0 p-2"
          @click="account = ''"
        >
          <Icon name="carbon:close" />
        </button>
      </div>
      <span text-red>{{ errors.account }}</span>

      <label label for="password">密码</label>
      <input v-bind="passwordAttrs" v-model="password" input type="password" name="password">
      <span text-red>{{ errors.password }}</span>

      <div class="flex justify-between">
        <NuxtLink to="/reset-password" class="text-sm underline">
          忘记密码?
        </NuxtLink>
        <div class="text-sm flex items-center gap-2">
          <input
            id="remember"
            v-model="remember"
            type="checkbox"
          >
          <label label for="remember" class="cursor-pointer">记住密码</label>
        </div>
      </div>
      <button btn-primary border-none>
        登录
      </button>
      <div class="mt-4 text-center text-sm leading-loose">
        没有账号?
        <NuxtLink to="/register" class="underline">
          注册
        </NuxtLink>
      </div>
      <div class="mt-4 text-center text-sm leading-loose">
        下载
        <a href="https://demo.weila.hk/weila-content/#/app-download" class="underline">
          安卓 APP
        </a>
      </div>
    </form>
  </div>
</template>
