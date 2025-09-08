<script setup lang="ts">
import { objectKeys } from '@antfu/utils'
import { toTypedSchema } from '@vee-validate/zod'
import md5 from 'md5'
import { useField, useForm } from 'vee-validate'
import { useRouter } from 'vue-router'
import * as z from 'zod'
import { useToast } from '@/components/ui/toast'
import SendSmsButton from '~/components/SendSmsButton.vue'
import { weilaApiUrl } from '~/plugins/api'

definePageMeta({
  layout: 'welcome',
  meta: {
    public: true,
  },
})

appHead.value = '重置密码'

const { toast } = useToast()
const router = useRouter()

const verifyImg = templateRef<any>('verifyImg')

const resetPasswordSchema = z.object({
  phone: z.string().nonempty().max(20),
  img_verify_code: z.string().nonempty(),
  verify_code: z.string().nonempty(),
  password: z.string().nonempty().max(20),
})

const formSchema = resetPasswordSchema

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
    country_code: '86',
  }

  try {
    await $v1(weilaApiUrl('/corp/web/reset-password'), {
      body,
    })
    toast({ title: '重置成功' })
    router.push('/login')
  }
  catch (error) {
    toast({
      title: '重置失败',
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
  <div class="mx-auto grid w-[350px] gap-6">
    <div class="grid gap-2 text-center">
      <h1 class="text-3xl font-bold">
        重置密码
      </h1>
      <p class="text-balance text-muted-foreground">
        验证手机号以重置密码
      </p>
    </div>
    <form flex flex-col space-y-2 @submit="onSubmit">
      <label label for="phone">电话号码</label>
      <input v-model="phone" input type="text" name="phone">
      <span text-red>{{ errors.phone }}</span>

      <label label for="img_verify_code">图形验证码</label>
      <div class="flex space-x-2">
        <input v-model="imgVerifyCode" w-40 input type="text" name="img_verify_code">
        <VerifyImg ref="verifyImg" shrink-0 class="ml-auto mr-0" />
      </div>
      <span text-red>{{ errors.img_verify_code }}</span>

      <label label for="verify_code">短信验证码</label>
      <div class="flex space-x-2">
        <input v-model="verifyCode" w-40 input type="text" name="verify_code">
        <SendSmsButton
          shrink-0
          :opts="{
            phone: phone || '',
            verify_code: imgVerifyCode || '',
            sms_type: 'reset-password',
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
        提交
      </button>
      <div class="mt-4 text-center text-sm">
        已有账号?
        <NuxtLink to="/login" class="underline">
          登录
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
