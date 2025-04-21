<script setup lang="ts">
import type { GroupCreateModel, GroupGetallModel } from '~/fixture/mock'
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

appHead.value = '编辑群组'

const { $v1 } = useNuxtApp()
const route = useRoute('contacts-group-id-edit___zh-CN')
const router = useRouter()
const { org_num } = useCorp()
const avatarRef = templateRef<any>('avatarRef')

const { data: groups, refetch } = useGroupList()

const group = computed(() => groups.value?.find(group => group.id === Number(route.params.id)))

const editSchema = z.object({
  name: z.string().max(20).nonempty(),
  burst_mode: z.number().default(0),
  avatar: z.string().default('').optional(),
})

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(editSchema),
  initialValues: {
    name: group.value?.name,
    burst_mode: group.value?.burst_mode,
    avatar: group.value?.avatar,
  },
})

const [name, nameAttrs] = defineField('name')
const [burst_mode, burst_modeAttrs] = defineField('burst_mode')
const [avatar, avatarAttrs] = defineField('avatar')

const { mutate: edit, isPending } = useMutation({
  mutationFn: async (values: z.infer<typeof editSchema>) => {
    const { upload } = avatarRef.value

    const avatar = values.avatar && !isRemoteImage(values.avatar)
      ? await upload()
      : values.avatar

    const body = {
      ...values,
      avatar,
      org_num: org_num.value!,
      group_id: route.params.id,
    }

    return await $v1<GroupCreateModel>('/corp/web/group-change', {
      body,
    })
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

const isDeleteModalVisible = shallowRef(false)
const { mutate: deleteGroup, isPending: isDeleting } = useMutation({
  mutationFn: (groupId: number) =>
    $v1<GroupGetallModel['data']['groups'][number]>(
      weilaApiUrl('/corp/web/group-delete'),
      {
        body: {
          group_id: groupId,
        },
      },
    ),
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '删除成功' })
    isDeleteModalVisible.value = false
    refetch()
    router.go(-2)
  },
})
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
        <option :value="0">
          排麦
        </option>
        <option :value="1">
          抢麦
        </option>
        <option :value="2">
          抢断
        </option>
      </select>
      <span text-red>{{ errors.burst_mode }}</span>

      <button v-is-loading="isPending" type="submit" btn-primary border-none>
        保存修改
      </button>

      <DialogRoot v-model:open="isDeleteModalVisible">
        <DialogTrigger as-child>
          <button btn-ghost text-red>
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
              您确定要删除"{{ group?.name }}"吗？此操作无法撤销。
            </DialogDescription>
            <div flex justify-end space-x-2 mt-4>
              <DialogClose btn btn-secondary>
                取消
              </DialogClose>
              <button v-is-loading="isDeleting" btn bg-red-400 text-white @click="() => deleteGroup(group!.id)">
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

<style scoped>
select {
  --at-apply: p2 rounded bg-secondary;
}
</style>
