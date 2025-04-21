<script setup lang="ts">
import { objectKeys } from '@antfu/utils'
import { toTypedSchema } from '@vee-validate/zod'
import md5 from 'md5'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { weilaApiUrl } from '~/plugins/api'

definePageMeta({
  layout: 'back',
})

appHead.value = '修改密码'

const { $v1 } = useNuxtApp()
const { toast } = useToast()

const resetPasswordSchema = z.object({
  old_password: z.string().nonempty(),
  new_password: z.string().nonempty(),
})

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(resetPasswordSchema),
})

const onSubmit = handleSubmit((values) => {
  return $v1(
    weilaApiUrl('/corp/web/user-change-password'),
    {
      body: {
        old_password: md5(values.old_password),
        new_password: md5(values.new_password),
      },
    },
  ).then(() => {
    toast({ title: '重置成功', description: '请重新登录' })
    const { logout } = useAuthStore()
    logout()
  }).catch((errmsg: Error) => {
    toast({
      title: '重置失败',
      description: errmsg.message,
    })
  })
}, ({ errors }) => document.querySelector(`label[for="${objectKeys(errors)[0]}"]`)?.scrollIntoView())

const [oldPassword, oldPasswordAttrs] = defineField('old_password')
const [newPassword, newPasswordAttrs] = defineField('new_password')
</script>

<template>
  <div p8>
    <form flex flex-col space-y-2 @submit="onSubmit">
      <label label for="old_password">旧密码</label>
      <input v-bind="oldPasswordAttrs" v-model="oldPassword" input type="password" name="old_password">
      <span text-red>{{ errors.old_password }}</span>

      <label label for="new_password">新密码</label>
      <input v-bind="newPasswordAttrs" v-model="newPassword" input type="password" name="new_password">
      <span text-red>{{ errors.new_password }}</span>

      <button btn-primary border-none>
        提交
      </button>
    </form>
  </div>
</template>
