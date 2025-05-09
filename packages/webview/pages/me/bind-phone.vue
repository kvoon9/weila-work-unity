<script setup lang="ts">
import type { UserSelfinfoModel } from '~/fixture/mock'
import { objectKeys } from '@antfu/utils'
import { toTypedSchema } from '@vee-validate/zod'
import md5 from 'md5'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import SendSmsButton from '~/components/SendSmsButton.vue'
import { weilaApiUrl } from '~/plugins/api'

definePageMeta({
  layout: 'back',
})

appHead.value = '绑定手机号'

const { $v1 } = useNuxtApp()

const { toast } = useToast()

const router = useRouter()

const { data: user } = useAsyncData(
  'self-info',
  () => $v1<UserSelfinfoModel['data']>(weilaApiUrl('/corp/web/user-selfinfo')),
  {
    transform(data) {
      return data.user
    },
  },
)

const bindPhoneSchema = z.object({
  phone: z.preprocess(
    val => val === '' ? 0 : val, // NOTE: fix type error for zod error
    z.number({ coerce: true })
      .positive({ message: '必填' })
      .int({ message: '手机号必须为整数' })
      .refine(
        val => !user.value?.bind_phone || String(val) !== user.value?.bind_phone,
        { message: '新手机号不能与当前手机号相同' },
      )
      .refine(
        val => String(val).length === 11,
        { message: '手机号长度为11位' },
      ),
  ).refine(
    val => val !== undefined,
    { message: '手机号不能为空' },
  ),
  img_verify_code: z.string().nonempty({ message: '图形验证码不能为空' }),
  verify_code: z.string().nonempty({ message: '短信验证码不能为空' }),
  password: z.string().nonempty({ message: '密码不能为空' }).max(20, { message: '密码长度不能超过20位' }),
})

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(bindPhoneSchema),
})

const onSubmit = handleSubmit(async (values) => {
  return $v1(
    weilaApiUrl('/corp/web/user-bind-phone'),
    {
      body: {
        phone: values.phone,
        password: md5(values.password),
        verify_code: values.verify_code,
      },
    },
  ).then(() => {
    toast({ title: '绑定成功' })
    router.back()
  }).catch((errmsg) => {
    toast({
      title: '绑定失败',
      description: String(errmsg),
    })
  })
}, ({ errors }) => document.querySelector(`label[for="${objectKeys(errors)[0]}"]`)?.scrollIntoView())

const [phone, phoneAttrs] = defineField('phone')
const [imgVerifyCode, imgVerifyCodeAttrs] = defineField('img_verify_code')
const [verifyCode, verifyCodeAttrs] = defineField('verify_code')
const [password, passwordAttrs] = defineField('password')

const verifyImg = templateRef<any>('verifyImg')

function onVerifyImgCodeError() {
  verifyImg.value?.refetch()
  imgVerifyCode.value = ''
}
</script>

<template>
  <div p6>
    <div text-sm text-gray-500 mb-12 text-center>
      当前绑定手机号: {{ user?.bind_phone || '未绑定' }}
    </div>
    <form flex flex-col space-y-2 @submit="onSubmit">
      <label label for="phone">电话号码</label>
      <input v-bind="phoneAttrs" v-model.number="phone" type="number" input name="phone">
      <span text-red>{{ errors.phone }}</span>

      <label label for="img_verify_code">图形验证码</label>
      <div grid="~ cols-[1fr_auto] gap1 items-end">
        <input v-bind="imgVerifyCodeAttrs" v-model="imgVerifyCode" input type="text" name="img_verify_code">
        <VerifyImg ref="verifyImg" shrink-0 rounded />
      </div>
      <span text-red>{{ errors.img_verify_code }}</span>

      <label label for="verify_code">短信验证码</label>
      <div grid="~ cols-[1fr_auto] gap1">
        <input v-bind="verifyCodeAttrs" v-model="verifyCode" input type="text" name="verify_code">
        <SendSmsButton
          break-keep px1
          :opts="{
            phone: phone ? String(phone) : '',
            verify_code: imgVerifyCode || '',
            sms_type: 'bind-phone',
            country_code: '86',
          }"
          @error="onVerifyImgCodeError"
        />
      </div>
      <span text-red>{{ errors.verify_code }}</span>

      <label label for="password">密码</label>
      <input v-bind="passwordAttrs" v-model="password" input type="password" name="password">
      <span text-red>{{ errors.password }}</span>

      <button btn-primary border-none>
        提交
      </button>
    </form>
  </div>
</template>
