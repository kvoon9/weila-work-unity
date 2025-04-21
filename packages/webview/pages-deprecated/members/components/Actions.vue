<script lang="ts" setup>
import type { Data } from './columns'
import type { MemberDeleteModel, MemberResetPasswordModel, MemberResetPasswordPayload } from '~/fixture/mock'
import { useMutation } from '@tanstack/vue-query'
import md5 from 'md5'
import { useToast } from '~/components/ui/toast/use-toast'
import { weilaApiUrl } from '~/plugins/api'
import EditDeviceTrigger from './EditDeviceTrigger.vue'
import EditMemberTrigger from './EditMemberTrigger.vue'
import StateToggle from './StateToggle.vue'

const props = defineProps<{
  item: Data[number]
}>()

const emits = defineEmits(['done'])
const { org_num } = useCorp()
const { $v1 } = useNuxtApp()
const itemType = computed(() => {
  if (props.item.type === 0)
    return 'member'
  else if (props.item.type === 1)
    return 'device'
  else if (props.item.type === 255)
    return 'owner'
  else
    return 'unknown'
})

const isEditMemberOpen = ref(false)
const isEditDeviceOpen = ref(false)
const isResetPasswordOpen = ref(false)
const isDeleteOpen = ref(false)

const info = computed(() => `${props.item.name}(${props.item.user_num})`)

const resetPasswordPayload = reactive<MemberResetPasswordPayload>({
  member_id: props.item.user_id,
  org_num: org_num.value!,
  password: '',
})

const { toast } = useToast()

const { mutate: resetPassword, isPending: isResetPasswordPending } = useMutation({
  mutationFn: () => {
    if (!resetPasswordPayload.password) {
      throw new Error('no data')
    }

    return $v1<MemberResetPasswordModel>(
      weilaApiUrl('/corp/web/member-reset-password'),
      {
        body: {
          ...resetPasswordPayload,
          password: md5(resetPasswordPayload.password),
        },
      },
    )
  },
  onSuccess() {
    toast({ title: '修改成功' })
    isResetPasswordOpen.value = false
    emits('done')
    useAllMember().refetch()
    useDepts().refetch()
  },
})

const { mutate: deleteItem, isPending: isDeleting } = useMutation({
  mutationFn: () =>
    $v1<MemberDeleteModel>(
      weilaApiUrl('/corp/web/member-delete'),
      {
        body: {
          org_num: org_num.value,
          member_id: props.item.user_id,
        },
      },
    ),
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '删除成功' })
    isDeleteOpen.value = false
    emits('done')
    useAllMember().refetch()
    useDepts().refetch()
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
      <DropdownMenuLabel>状态</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <!-- @vue-expect-error type error of state -->
      <StateToggle :state="item.state" :member_id="item.user_id" @done="() => useAllMember().refetch()" />
      <DropdownMenuLabel>操作</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        @click="itemType === 'device'
          ? isEditDeviceOpen = true
          : isEditMemberOpen = true
        "
      >
        <LucideEdit class="mr-2 h-4 w-4" />
        <span>编辑</span>
        <!-- <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> -->
      </DropdownMenuItem>
      <DropdownMenuItem @click="isResetPasswordOpen = true">
        <LucideLock class="mr-2 h-4 w-4" />
        <span>重置密码</span>
        <!-- <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> -->
      </DropdownMenuItem>
      <DropdownMenuItem @click="isDeleteOpen = true">
        <LucideDelete class="mr-2 h-4 w-4" />
        <span>删除</span>
        <!-- <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> -->
      </DropdownMenuItem>
    </DropdownMenuContent>

    <EditMemberTrigger v-model:open="isEditMemberOpen" :member="item" />

    <EditDeviceTrigger v-model:open="isEditDeviceOpen" :member="item" />

    <Dialog v-model:open="isResetPasswordOpen">
      <DialogTrigger as-child />
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>重置密码</DialogTitle>
          <DialogDescription>
            重置成员: {{ info }} 的密码
          </DialogDescription>
        </DialogHeader>
        <Input v-model:model-value="resetPasswordPayload.password" type="password" />
        <DialogFooter>
          <Button v-is-loading="isResetPasswordPending" @click="resetPassword">
            提交
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="isDeleteOpen">
      <DialogTrigger as-child />
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>删除</DialogTitle>
          <DialogDescription>
            删除成员: {{ info }}
          </DialogDescription>
        </DialogHeader>
        此操作无法撤销 您确定要删除吗？
        <DialogFooter>
          <Button v-is-loading="isDeleting" class="w-fit ml-auto" variant="destructive" @click="deleteItem">
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </DropdownMenu>
</template>
