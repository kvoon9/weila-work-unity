<script setup lang="ts">
import type { GroupCreateModel, GroupCreatePayload } from '~/fixture/mock'
import { useMutation } from '@tanstack/vue-query'
import * as z from 'zod'
import AutoFormFieldAvatar from '~/components/AutoFormFieldAvatar.vue'
import AutoFormFieldBurstMode from '~/components/AutoFormFieldBurstMode.vue'
import { useToast } from '~/components/ui/toast/use-toast'
import { weilaApiUrl } from '~/plugins/api'
import Actions from './components/Actions.vue'
import { columns } from './components/DataTable/columns'
import DataTable from './components/DataTable/index.vue'

definePageMeta({
  layout: 'dashboard',
  name: '群组管理',
})

const open = ref(false)

const createSchema = z.object({
  name: z.string().max(20),
  burst_mode: z.number().default(0),
  avatar: z.string().optional(),
})
const avatarRef = templateRef<any>('avatarRef')

const { data, refetch } = useGroups()
const { org_num } = useCorp()

const { $v1 } = useNuxtApp()
const { mutate: create, isPending: isCreating } = useMutation({
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

    return $v1<GroupCreateModel>(weilaApiUrl('/corp/web/group-create'), { body })
  },
  onSuccess() {
    const { toast } = useToast()
    open.value = false
    toast({ title: '创建成功' })
    refetch()
  },
})
</script>

<template>
  <div>
    <header class="space-x-2 mb-5">
      <Dialog v-model:open="open">
        <DialogTrigger as-child>
          <Button size="sm">
            <LucidePlus />
            创建群组
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>创建群组</DialogTitle>
            <DialogDescription>
              填写群组信息以创建群组
            </DialogDescription>
          </DialogHeader>
          <AutoForm
            class="space-y-2 px-4"
            :schema="createSchema"
            :field-config="{
              name: { label: '名称' },
              // avatar: { label: '头像', component: AutoFormFieldAvatar },
              burst_mode: { label: '模式', component: AutoFormFieldBurstMode },
            }"
            @submit="create"
          >
            <template #avatar="slotProps">
              <AutoFormField v-bind="slotProps" field-name="头像" class="w-full">
                <AutoFormFieldAvatar v-bind="slotProps" ref="avatarRef" />
              </AutoFormField>
            </template>
            <Button v-is-loading="isCreating" type="submit" class="float-right">
              提交
            </Button>
          </AutoForm>
          <DialogFooter />
        </DialogContent>
      </Dialog>
    </header>

    <ScrollArea class="h-[70vh] rounded-md">
      <DataTable
        :columns="[
          {
            id: 'actions',
            header: '操作',
            enableHiding: false,
            cell: ({ row }) => {
              return h(Actions, { item: row.original, onDone: refetch })
            },
          },
          ...columns,
        ]" :data="data || []"
      />
    </ScrollArea>
  </div>
</template>
