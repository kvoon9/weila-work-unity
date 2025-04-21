<script setup lang="ts">
import type { GroupCreateModel, GroupCreatePayload } from '~/fixture/mock'
import { objectKeys } from '@antfu/utils'
import { useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { weilaApiUrl } from '~/plugins/api'
import { burstModeOptions } from '~/shared/const'

definePageMeta({
  layout: 'back',
})

appHead.value = '创建群组'

const router = useRouter()
const { org_num } = useCorp()
const { $v1 } = useNuxtApp()
const avatarRef = templateRef<any>('avatarRef')
const { refetch: refetchGroupList } = useGroupList()

const createSchema = z.object({
  name: z.string().max(20).nonempty(),
  burst_mode: z.number().default(0),
  avatar: z.string().default('').optional(),
})

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(createSchema),
})

const [name, nameAttrs] = defineField('name')
const [burst_mode, burst_modeAttrs] = defineField('burst_mode')
const [avatar, avatarAttrs] = defineField('avatar')

const { mutate: create, isPending } = useMutation({
  mutationFn: async (values: z.infer<typeof createSchema>) => {
    const { upload } = avatarRef.value

    const avatar = values.avatar && !isRemoteImage(values.avatar)
      ? await upload()
      : values.avatar

    const body: Partial<GroupCreatePayload> = {
      ...values,
      avatar,
      org_num: org_num.value!,
    }

    return await $v1<GroupCreateModel>(weilaApiUrl('/corp/web/group-create'), {
      body,
    })
  },
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '创建成功' })
    refetchGroupList()
    router.back()
  },
})

const onSubmit = handleSubmit((values) => {
  try {
    create(values)
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
      <label label for="name">名称</label>
      <input v-bind="nameAttrs" v-model="name" input type="text" name="name">
      <span text-red>{{ errors.name }}</span>

      <label label for="avatar">头像</label>
      <AvatarUploader ref="avatarRef" v-bind="avatarAttrs" v-model:src="avatar" />
      <span text-red>{{ errors.avatar }}</span>

      <label label for="burst_mode">模式</label>
      <select v-bind="burst_modeAttrs" v-model="burst_mode" select name="burst_mode">
        <option v-for="option in burstModeOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <span text-red>{{ errors.burst_mode }}</span>

      <button v-is-loading="isPending" type="submit" btn-primary border-none>
        创建群组
      </button>
    </form>
  </div>
</template>

<style scoped>
select {
  --at-apply: p2 rounded bg-secondary;
}
</style>
