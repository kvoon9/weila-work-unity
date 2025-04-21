<script setup lang="ts">
import type { OrgCreateModel, OrgCreatePayload } from '~/fixture/mock'
import { objectKeys } from '@antfu/utils'
import { useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { weilaApiUrl } from '~/plugins/api'

definePageMeta({
  layout: 'back',
})

appHead.value = '创建企业'

const avatarRef = templateRef<any>('avatarRef')
const orgCreateSchema = z.object({
  name: z.string().max(20),
  avatar: z.string().optional(),
})

const router = useRouter()

const { $v1 } = useNuxtApp()

const { mutate: createCorp, isPending } = useMutation({
  mutationKey: ['create org'],
  mutationFn: async (values: z.infer<typeof orgCreateSchema>) => {
    const { upload } = avatarRef.value

    const avatar = values.avatar && !isRemoteImage(values.avatar)
      ? await upload()
      : values.avatar

    const body: OrgCreatePayload = {
      ...values,
      avatar,
    }

    return await $v1<OrgCreateModel>(
      weilaApiUrl('/corp/web/org-create'),
      { body },
    )
  },
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '创建企业成功' })
    useCorp().refetch()

    router.back()
  },
})

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(orgCreateSchema),
})

const [name, nameAttrs] = defineField('name')
const [avatar, avatarAttrs] = defineField('avatar')

const onSubmit = handleSubmit((values) => {
  try {
    createCorp(values)
  }
  catch (errmsg) {
    const { toast } = useToast()
    toast({
      title: '创建失败',
      description: String(errmsg),
    })
  }
}, ({ errors }) => document.querySelector(`label[for="${objectKeys(errors)[0]}"]`)?.scrollIntoView())
</script>

<template>
  <div p8>
    <form flex flex-col space-y-2 @submit.prevent="onSubmit">
      <label label for="name">企业名称</label>
      <input v-bind="nameAttrs" v-model="name" input type="text" name="name">
      <span text-red>{{ errors.name }}</span>

      <label label for="avatar">头像</label>
      <AvatarUploader ref="avatarRef" v-bind="avatarAttrs" v-model:src="avatar" />
      <span text-red>{{ errors.avatar }}</span>

      <button v-is-loading="isPending" type="submit" btn-primary border-none>
        创建
      </button>
    </form>
  </div>
</template>
