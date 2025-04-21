<script setup lang="ts">
import type { DeptCreateModel } from '~/fixture/mock'
import { useMutation } from '@tanstack/vue-query'
import * as z from 'zod'
import { useToast } from '~/components/ui/toast/use-toast'

import { weilaApiUrl } from '~/plugins/api'
import Actions from './components/Actions.vue'
import { columns } from './components/DataTable/columns'
import DeptDataTable from './components/DataTable/index.vue'

definePageMeta({
  layout: 'dashboard',
  name: '部门管理',
})

const { $v1 } = useNuxtApp()

const { org_num } = useCorp()
const { data, refetch } = useDepts()

const createDeptSchema = z.object({
  name: z.string().max(20),
})

const { toast } = useToast()

const isCreateOpen = ref(false)
const { mutate: create, isPending: isCreating } = useMutation({
  mutationFn: (values: z.infer<typeof createDeptSchema>) => $v1<DeptCreateModel>(weilaApiUrl('/corp/web/dept-create'), { body: {
    ...values,
    org_num: org_num.value!,
  } }),
  onSuccess() {
    toast({ title: '创建成功' })
    refetch()
    isCreateOpen.value = false
  },
})
</script>

<template>
  <div>
    <header class="space-x-2 mb-5">
      <Dialog v-model:open="isCreateOpen">
        <DialogTrigger as-child>
          <Button size="sm">
            <LucidePlus />
            创建部门
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>创建部门</DialogTitle>
            <DialogDescription>
              填写部门信息以创建部门
            </DialogDescription>
          </DialogHeader>
          <AutoForm
            class="space-y-2 px-4"
            :schema="createDeptSchema" :field-config="{
              name: {
                label: '名称',
              },
            }"
            @submit="create"
          >
            <Button v-is-loading="isCreating" type="submit" class="float-right">
              提交
            </Button>
          </AutoForm>
          <DialogFooter />
        </DialogContent>
      </Dialog>
    </header>

    <ScrollArea class="h-[70vh] rounded-md">
      <DeptDataTable
        :columns="[
          {
            id: 'actions',
            header: '操作',
            enableHiding: false,
            cell: ({ row }) => {
              if (row.original.id === 0)
                return ''

              return h(Actions, { item: row.original, onDone: refetch })
            },
          },
          ...columns,
        ]" :data="data || []"
      />
    </ScrollArea>
  </div>
</template>
