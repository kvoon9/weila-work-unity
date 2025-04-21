<script setup lang="ts">
import type { DeptCreateModel } from '~/fixture/mock'
import { objectKeys } from '@antfu/utils'
import { useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { weilaApiUrl } from '~/plugins/api'

definePageMeta({
  layout: 'back',
})

appHead.value = '创建部门'

const router = useRouter()
const { org_num } = useCorp()
const { $v1 } = useNuxtApp()

const createDeptSchema = z.object({
  name: z.string().max(20),
})

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(createDeptSchema),
})

const [name, nameAttrs] = defineField('name')

const { mutate: createDept, isPending } = useMutation({
  mutationFn: (values: z.infer<typeof createDeptSchema>) => $v1<DeptCreateModel>(weilaApiUrl('/corp/web/dept-create'), {
    body: {
      ...values,
      org_num: org_num.value!,
    },
  }),
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '创建部门成功' })
    router.back()
  },
})

const onSubmit = handleSubmit((values) => {
  try {
    createDept(values)
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

      <button v-is-loading="isPending" type="submit" btn-primary border-none>
        创建
      </button>
    </form>
  </div>
</template>
