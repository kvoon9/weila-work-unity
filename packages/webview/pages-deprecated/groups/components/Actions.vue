<script setup lang="ts">
import type { Data } from './DataTable/columns'
import type { GroupDeletePayload } from '~/fixture/mock'
import { useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import AutoFormFieldAvatar from '~/components/AutoFormFieldAvatar.vue'
import AutoFormFieldBurstMode from '~/components/AutoFormFieldBurstMode.vue'
import { useToast } from '~/components/ui/toast'
import { weilaApiUrl } from '~/plugins/api'

const props = defineProps<{
  item: Data[number]
}>()

const emits = defineEmits(['done'])

const router = useRouter()

const editSchema = z.object({
  name: z.string().max(20),
  burst_mode: z.number(),
  avatar: z.string().optional(),
})
const avatarRef = templateRef<any>('avatarRef')

const editForm = useForm({
  validationSchema: toTypedSchema(editSchema),
})

const { toast } = useToast()
const { $v1 } = useNuxtApp()
const { org_num } = useCorp()

const isEditOpen = ref(false)

watchEffect(() => {
  if (isEditOpen.value === true) {
    editForm.setFieldValue('name', props.item.name)
    editForm.setFieldValue('avatar', props.item.avatar)
    editForm.setFieldValue('burst_mode', props.item.burst_mode)
  }
})

const { mutate: edit, isPending: isEditing } = useMutation({
  mutationFn: async (values: z.infer<typeof editSchema>) => {
    const { upload } = avatarRef.value

    const avatar = values.avatar && !isRemoteImage(values.avatar)
      ? await upload()
      : values.avatar

    interface Payload {
      org_num: number
      group_id: number
      name: string
      avatar: string
      burst_mode: number
    }

    const body: Payload = {
      ...values,
      avatar,
      org_num: org_num.value!,
      group_id: props.item.id,
    }

    return $v1('/corp/web/group-change', { body })
  },
  onSuccess() {
    toast({ title: '编辑成功' })
    isEditOpen.value = false
    emits('done')
  },
})

const isDeleteOpen = ref(false)
const { mutate: deleteItem, isPending: isDeleting } = useMutation({
  mutationFn: (body: GroupDeletePayload) => $v1(
    weilaApiUrl('/corp/web/group-delete'),
    { body },
  ),
  onSuccess() {
    toast({ title: '操作成功' })
    isDeleteOpen.value = false
    emits('done')
  },
})
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline">
        操作
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-fit">
      <DropdownMenuLabel>操作</DropdownMenuLabel>
      <DropdownMenuItem @click="router.push(`/groups/${item.id}`)">
        <LucideEye class="mr-2" />
        <span>查看成员</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="isEditOpen = true">
        <LucideEdit class="mr-2 h-4 w-4" />
        <span>编辑</span>
        <!-- <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> -->
      </DropdownMenuItem>
      <DropdownMenuItem @click="isDeleteOpen = true">
        <LucideDelete class="mr-2 h-4 w-4" />
        <span>删除</span>
        <!-- <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> -->
      </DropdownMenuItem>
    </DropdownMenuContent>

    <Dialog v-model:open="isEditOpen">
      <DialogTrigger as-child>
        <!-- <Button size="sm" variant="secondary">
          编辑
        </Button> -->
      </DialogTrigger>
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑群组</DialogTitle>
          <DialogDescription>
            填写群组信息以编辑群组
          </DialogDescription>
        </DialogHeader>
        <AutoForm
          class="space-y-2 px-4"
          :form="editForm"
          :schema="editSchema"
          :field-config="{
            name: { label: '名称' },
            // avatar: { label: '头像', component: AutoFormFieldAvatar },
            burst_mode: { label: '模式', component: AutoFormFieldBurstMode },
          }"
          @submit="edit"
        >
          <template #avatar="slotProps">
            <AutoFormField v-bind="slotProps" field-name="头像" class="w-full">
              <AutoFormFieldAvatar v-bind="slotProps" ref="avatarRef" />
            </AutoFormField>
          </template>
          <Button v-is-loading="isEditing" type="submit" class="float-right">
            提交
          </Button>
        </AutoForm>
        <DialogFooter />
      </DialogContent>
    </Dialog>
    <Dialog v-model:open="isDeleteOpen">
      <DialogTrigger as-child>
        <!-- <Button size="sm" variant="destructive">
          删除
        </Button> -->
      </DialogTrigger>
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>删除群组</DialogTitle>
          <DialogDescription>
            删除群组:{{ item.name }}
          </DialogDescription>
        </DialogHeader>
        <div>
          确定要删除吗? 此操作无法撤回
        </div>
        <DialogFooter>
          <div class="flex justify-end">
            <Button
              v-is-loading="isDeleting"
              class="w-fit"
              variant="destructive" @click="() => deleteItem({
                group_id: item.id,
              })"
            >
              确定
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </DropdownMenu>
</template>
