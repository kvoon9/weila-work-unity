<script setup lang="ts">
import type { DeptChangeModel, DeptChangePayload, DeptDeleteModel, DeptDeletePayload } from '~/fixture/mock'
import { objectKeys } from '@antfu/utils'
import { useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { shallowRef } from 'vue'
import * as z from 'zod'
import { weilaApiUrl } from '~/plugins/api'

definePageMeta({
  layout: 'back',
})

appHead.value = '编辑部门'

const router = useRouter()
const route = useRoute('contacts-dept-id-edit___zh-CN')
const { org_num } = useCorp()
const { $v1 } = useNuxtApp()

const { data: depts } = useDeptList()

const dept = computed(() => depts.value?.find(dept => dept.id === Number(route.params.id)))

const editDeptSchema = z.object({
  name: z.string().max(20),
})

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(editDeptSchema),
  initialValues: {
    name: dept.value?.name,
  },
})

const [name, nameAttrs] = defineField('name')

const { mutate: editDept, isPending } = useMutation({
  mutationFn: (values: z.infer<typeof editDeptSchema>) => $v1<DeptChangeModel>(weilaApiUrl('/corp/web/dept-change'), {
    body: {
      ...values,
      org_num: org_num.value!,
      dept_id: dept.value!.id,
    } as DeptChangePayload,
  }),
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '编辑部门成功' })
    router.back()
  },
})

const onSubmit = handleSubmit((values) => {
  try {
    editDept(values)
  }
  catch (errmsg) {
    const { toast } = useToast()
    toast({
      title: '编辑失败',
      description: String(errmsg),
    })
  }
}, ({ errors }) => document.querySelector(`label[for="${objectKeys(errors)[0]}"]`)?.scrollIntoView())

const isDeleteModalVisible = shallowRef(false)
const { mutate: deleteDept, isPending: isDeleting } = useMutation({
  mutationFn: (dept_id: number) =>
    $v1<DeptDeleteModel>(
      weilaApiUrl('/corp/web/dept-delete'),
      {
        body: {
          org_num: org_num.value,
          dept_id,
        } as DeptDeletePayload,
      },
    ),
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '删除成功' })
    isDeleteModalVisible.value = false
    useDeptList().refetch()
    router.go(-2)
  },
})
</script>

<template>
  <div p8>
    <form flex flex-col space-y-2 @submit.prevent="onSubmit">
      <label label for="name">名称</label>
      <input v-bind="nameAttrs" v-model="name" :disabled="!dept?.id" input type="text" name="name">
      <span text-red>{{ errors.name }}</span>

      <button v-if="dept?.id" v-is-loading="isPending" type="submit" btn-primary border-none>
        保存
      </button>

      <DialogRoot v-if="dept?.id" v-model:open="isDeleteModalVisible">
        <DialogTrigger as-child>
          <button type="button" btn-ghost text-red>
            删除
          </button>
        </DialogTrigger>
        <DialogPortal>
          <DialogOverlay class="backdrop-blur bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
          <DialogContent
            class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100]"
          >
            <DialogTitle class="text-mauve12 m-0 text-[17px] font-semibold">
              删除部门
            </DialogTitle>
            <DialogDescription class="text-mauve11 mt-[10px] mb-5 text-sm leading-normal">
              您确定要删除"{{ dept?.name }}"吗？此操作无法撤销。
            </DialogDescription>
            <div flex justify-end space-x-2 mt-4>
              <DialogClose btn btn-secondary>
                取消
              </DialogClose>
              <button v-is-loading="isDeleting" type="button" btn bg-red-400 text-white @click="() => dept && deleteDept(dept.id)">
                确认
              </button>
            </div>
            <DialogClose
              class="text-grass11 hover:bg-green4 focus:shadow-green7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
              aria-label="Close"
            >
              <Icon name="lucide:x" />
            </DialogClose>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>
    </form>
  </div>
</template>
