<script setup lang="ts">
import type { OrgCreateModel, OrgCreatePayload } from '~/fixture/mock'
import { useMutation } from '@tanstack/vue-query'
import * as z from 'zod'
import { weilaApiUrl } from '~/plugins/api'
import { useToast } from './ui/toast/use-toast'

const emits = defineEmits(['success'])

const avatarRef = templateRef<any>('avatarRef')
const orgCreateSchema = z.object({
  name: z.string().max(20),
  avatar: z.string().optional(),
})

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
    emits('success')
    useCorp().refetch()
  },
})
</script>

<template>
  <AutoForm
    class="space-y-2 px-4"
    :schema="orgCreateSchema"
    :field-config="{
      name: { label: '名称' },
      // avatar: { label: '头像' },
    }"
    @submit="createCorp"
  >
    <template #avatar="slotProps">
      <AutoFormField v-bind="slotProps" field-name="头像" class="w-full">
        <AutoFormFieldAvatar v-bind="slotProps" ref="avatarRef" />
      </AutoFormField>
    </template>
    <div class="flex justify-end">
      <Button v-is-loading="isPending" type="submit">
        提交
      </Button>
    </div>
  </AutoForm>
</template>
