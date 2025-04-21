<script setup lang="ts">
import type { Data } from './DataTable/columns'
import type { DeptChangeModel, DeptChangePayload, DeptDeleteModel, DeptDeletePayload, GroupMemberChangePayload, GroupMemberDeletePayload, MemberChangeModel, MemberChangePayload, MemberGetallModel } from '~/fixture/mock'
import { useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import AutoFormFieldWeilaSwitch from '~/components/AutoFormFieldWeilaSwitch.vue'
import { useToast } from '~/components/ui/toast/use-toast'
import { weilaApiUrl } from '~/plugins/api'
import { boolNumSchema } from '~/shared/const'

const props = defineProps<{
  item: Data[number]
}>()

const emits = defineEmits(['done'])

const editSchema = z.object({
  tts: boolNumSchema.default(0),
  loc_share: boolNumSchema.default(0),
})
const editForm = useForm({
  validationSchema: toTypedSchema(editSchema),
})

const { toast } = useToast()
const { $v1 } = useNuxtApp()

const isEditOpen = ref(false)

watchEffect(() => {
  if (isEditOpen.value) {
    editForm.setFieldValue('tts', props.item.tts as 0 | 1)
    editForm.setFieldValue('loc_share', props.item.loc_share as 0 | 1)
  }
})

const route = useRoute('/groups/:group_id()')

const group_id = computed(() => Number(route.params.group_id))

const { mutate: edit, isPending: isEditing } = useMutation({
  mutationFn: (payload: z.infer<typeof editSchema>) => {
    const body: Partial<GroupMemberChangePayload> = {
      ...payload,
      member_id: props.item.user_id,
      group_id: group_id.value,
      prority: 0,
    }
    return $v1<DeptChangeModel>(
      weilaApiUrl('/corp/web/group-member-change'),
      { body },
    )
  },
  onSuccess() {
    toast({ title: '编辑成功' })
    isEditOpen.value = false
    emits('done')
  },
})

const isDeleteOpen = ref(false)
const { mutate: deleteGroupMember, isPending: isDeleting } = useMutation({
  mutationFn: () => $v1<DeptDeleteModel>(
    weilaApiUrl('/corp/web/group-member-delete'),
    { body: {
      group_id: group_id.value,
      member_ids: [props.item.user_id],
    } as GroupMemberDeletePayload },
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
      <DropdownMenuSeparator />
      <!-- <DropdownMenuItem @click="isEditOpen = true">
        <LucideEdit class="mr-2 h-4 w-4" />
        <span>编辑</span>
      </DropdownMenuItem> -->
      <DropdownMenuItem @click="isDeleteOpen = true">
        <LucideDelete class="mr-2 h-4 w-4" />
        <span>删除</span>
        <!-- <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> -->
      </DropdownMenuItem>
    </DropdownMenuContent>

    <Dialog v-model:open="isEditOpen">
      <DialogTrigger as-child />
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑群成员</DialogTitle>
          <DialogDescription>
            编辑群成员信息
          </DialogDescription>
        </DialogHeader>
        <AutoForm
          :form="editForm"
          :schema="editSchema"

          :field-config="{
            tts: { label: 'TTS', component: AutoFormFieldWeilaSwitch },
            loc_share: { label: '位置共享', component: AutoFormFieldWeilaSwitch },
          }"
          class="space-y-2 px-4"

          @submit="edit"
        >
          <div class="flex justify-end">
            <Button v-is-loading="isEditing" type="submit" class="float-right">
              提交
            </Button>
          </div>
        </AutoForm>
        <DialogFooter />
      </DialogContent>
    </Dialog>
    <Dialog v-model:open="isDeleteOpen">
      <DialogTrigger as-child />
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>删除群成员</DialogTitle>
          <DialogDescription>
            删除群成员 <span class="text-neutral-700">{{ item.name }}</span>
          </DialogDescription>
        </DialogHeader>
        <div class="text-red-500">
          确定要删除吗? 此操作无法撤回
        </div>
        <DialogFooter>
          <div class="flex justify-end">
            <Button v-is-loading="isDeleting" variant="destructive" @click="deleteGroupMember">
              确定
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </DropdownMenu>
</template>
