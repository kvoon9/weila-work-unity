<script setup lang="ts">
import type { ResetPasswordModel, ResetPasswordPayload } from '~/fixture/mock'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import md5 from 'md5'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import SendSmsButton from '~/components/SendSmsButton.vue'
import { weilaApiUrl } from '~/plugins/api'

definePageMeta({
  layout: 'welcome',
  meta: {
    public: true,
  },
})

const router = useRouter()

// eslint-disable-next-line ts/ban-ts-comment
// @ts-ignore type error
const verifyImg = templateRef('verifyImg')

const registerSchema = z.object({
  phone: z.string().nonempty().max(20),
  img_verify_code: z.string().nonempty(),
  verify_code: z.string().nonempty(),
  password: z.string().nonempty().max(20),
})

const formSchema = registerSchema

const { handleSubmit, controlledValues } = useForm({
  validationSchema: toTypedSchema(formSchema),
})

const { $v1 } = useNuxtApp()

const { mutate: onSubmit } = useMutation({
  mutationFn: handleSubmit(async (values) => {
    const body: ResetPasswordPayload = {
      phone: values.phone,
      verify_code: values.verify_code,
      password: md5(values.password),
      country_code: '86',
    }

    $v1<ResetPasswordModel>(weilaApiUrl('/corp/web/reset-password'), {
      body,
    }).then(() => {
      toast({ title: '重置成功' })
      router.push('/login')
    })
  }),
  // NOTE: useless
  onSuccess() {},
})

function onVerifyImgCodeError() {
  verifyImg.value?.refetch()
  controlledValues.value.img_verify_code = ''
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

    <form class="space-y-6" @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="phone">
        <FormItem>
          <FormLabel>电话号码</FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" />
          </FormControl>
          <FormDescription />
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="img_verify_code">
        <FormItem>
          <FormLabel>图形验证码</FormLabel>
          <FormControl>
            <div class="space-y-2">
              <Input type="text" v-bind="componentField" />
              <VerifyImg ref="verifyImg" class="ml-auto mr-0" />
            </div>
          </FormControl>
          <FormDescription />
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="verify_code">
        <FormItem>
          <FormLabel>短信验证码</FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" />
            <SendSmsButton
              :opts="{
                phone: controlledValues.phone || '',
                verify_code: controlledValues.img_verify_code || '',
                sms_type: 'reset-password',
                country_code: '86',
              }" @error="onVerifyImgCodeError"
            />
          </FormControl>
          <FormDescription />
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="password">
        <FormItem>
          <FormLabel>密码</FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" />
          </FormControl>
          <FormDescription />
          <FormMessage />
        </FormItem>
      </FormField>
      <Button type="submit" class="w-full">
        提交
      </Button>
      <div class="mt-4 text-center text-sm">
        已有账号?
        <NuxtLink to="/login" class="underline">
          登录
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
