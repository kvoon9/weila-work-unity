<script setup lang="ts">
import type { RegistModel } from '~/fixture/mock'
import { objectKeys } from '@antfu/utils'
import { toTypedSchema } from '@vee-validate/zod'
import md5 from 'md5'
import { useField, useForm } from 'vee-validate'
import { useRouter } from 'vue-router'
import * as z from 'zod'
import SendSmsButton from '~/components/SendSmsButton.vue'
import { weilaApiUrl } from '~/plugins/api'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'welcome',
  meta: {
    public: true,
  },
})

appHead.value = '微喇企业管理系统'

const { toast } = useToast()
const router = useRouter()

const verifyImg = templateRef<any>('verifyImg')

const registerSchema = z.object({
  phone: z.string().nonempty().max(20),
  img_verify_code: z.string().nonempty(),
  verify_code: z.string().nonempty(),
  password: z.string().nonempty().max(20),
})

const formSchema = registerSchema

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(formSchema),
})

const { value: phone } = useField<string>('phone')
const { value: imgVerifyCode } = useField<string>('img_verify_code')
const { value: verifyCode } = useField<string>('verify_code')
const { value: password } = useField<string>('password')

const { $v1 } = useNuxtApp()

const onSubmit = handleSubmit(async (values) => {
  const body = {
    phone: values.phone,
    verify_code: values.verify_code,
    password: md5(values.password),
  }

  try {
    await $v1<RegistModel['data']>(weilaApiUrl('/corp/web/regist'), {
      body,
    })
    toast({ title: '注册成功' })
    const { login } = useAuthStore()
    await login({
      account: values.phone,
      password: md5(values.password),
    })
    router.push('/org')
  }
  catch (error) {
    toast({
      title: '注册失败',
      description: String(error),
    })
  }
}, ({ errors }) => document.querySelector(`label[for="${objectKeys(errors)[0]}"]`)?.scrollIntoView())

function onVerifyImgCodeError() {
  verifyImg.value?.refetch()
  imgVerifyCode.value = ''
}
</script>

<template>
  <div class="mx-auto grid w-[350px] gap-6 p-4 rounded-md shadow-sm">
    <div class="grid gap-2 text-center">
      <h1 class="text-3xl font-bold">
        注册
      </h1>
      <p class="text-balance text-muted-foreground">
        验证手机号以注册账号
      </p>
    </div>
    <form flex flex-col space-y-2 @submit="onSubmit">
      <label label for="phone">电话号码</label>
      <input v-model="phone" input type="text" name="phone">
      <span text-red>{{ errors.phone }}</span>

      <label label for="img_verify_code">图形验证码</label>
      <div flex space-x-2>
        <input v-model="imgVerifyCode" input w-40 type="text" name="img_verify_code">
        <VerifyImg ref="verifyImg" shrink-0 rounded />
      </div>
      <span text-red>{{ errors.img_verify_code }}</span>

      <label label for="verify_code">短信验证码</label>
      <div class="flex space-x-2">
        <input v-model="verifyCode" w-40 input type="text" name="verify_code">
        <SendSmsButton
          :opts="{
            phone: phone || '',
            verify_code: imgVerifyCode || '',
            sms_type: 'regist',
            country_code: '86',
          }"
          @error="onVerifyImgCodeError"
        />
      </div>
      <span text-red>{{ errors.verify_code }}</span>

      <label label for="password">密码</label>
      <input v-model="password" input type="password" name="password">
      <span text-red>{{ errors.password }}</span>

      <button btn-primary border-none>
        注册
      </button>
      <div class="mt-4 text-center text-sm leading-loose">
        已有账号?
        <NuxtLink to="/login" class="underline">
          登录
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
