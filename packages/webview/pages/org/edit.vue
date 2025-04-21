<script setup lang="ts">
import type { OrgChangeModel, OrgChangePayload } from '~/fixture/mock'
import { objectKeys } from '@antfu/utils'
import { useMutation } from '@tanstack/vue-query'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { weilaApiUrl } from '~/plugins/api'

definePageMeta({
  layout: 'back',
})

appHead.value = '编辑企业'

const { data, org_num, refetch } = useCorp()

const router = useRouter()

const { $v1 } = useNuxtApp()

const editSchema = z.object({
  name: z.string().max(20).default(data.value?.name || ''),
  avatar: z.string().optional().default(data.value?.avatar || ''),
})

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(editSchema),
})

const [name, nameAttrs] = defineField('name')
const [avatar, avatarAttrs] = defineField('avatar')

const avatarRef = templateRef<any>('avatarRef')

const { mutate: edit, isPending } = useMutation({
  mutationFn: async (values: z.infer<typeof editSchema>) => {
    const { upload } = avatarRef.value

    const avatar = values.avatar && !isRemoteImage(values.avatar)
      ? await upload()
      : values.avatar

    const body: OrgChangePayload = {
      ...values,
      avatar,
      org_num: org_num.value!,
    }

    return $v1<OrgChangeModel>(weilaApiUrl('/corp/web/org-change'), { body })
  },
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '编辑成功' })
    refetch()
    router.back()
  },
})

const onSubmit = handleSubmit((values) => {
  try {
    edit(values)
  }
  catch (errmsg) {
    const { toast } = useToast()
    toast({
      title: '编辑失败',
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
        保存
      </button>
    </form>
  </div>
</template>
