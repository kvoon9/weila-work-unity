<script setup lang="ts">
import type { MemberGetallModel } from '~/fixture/mock'
import { useQuery } from '@tanstack/vue-query'
import { weilaApiUrl } from '~/plugins/api'
import Actions from './components/Actions.vue'
import AddDeviceTrigger from './components/AddDeviceTrigger.vue'
import { columns } from './components/columns'
import CreateMemberTrigger from './components/CreateMemberTrigger.vue'
import DataTable from './components/DataTable.vue'

definePageMeta({
  layout: 'dashboard',
  name: '成员管理',
  alias: '/members/:id',
})

const { data } = useAllMember()

const route = useRoute()

// @ts-expect-error type error
const searchInput = shallowRef<string>(route.params?.id || '')

const debouncedSearchInput = useDebounce(searchInput)
</script>

<template>
  <div>
    <header class="flex gap-2 py-2">
      <CreateMemberTrigger />
      <AddDeviceTrigger />
      <Input v-model:model-value="searchInput" class="truncate flex-1 max-w-36" placeholder="名称/微喇号/工号/电话..." />
    </header>
    <ScrollArea class="h-[70vh] rounded-md">
      <DataTable
        v-if="data" :search-input="debouncedSearchInput" class="mt-5" :columns="[
          {
            id: 'actions',
            header: '操作',
            enableHiding: false,
            cell: ({ row }) => {
              return h(
                'div',
                { class: 'relative' },
                h(Actions, {
                  item: row.original,
                }),
              )
            },
          },
          ...columns,
        ]" :data
      />
    </ScrollArea>
  </div>
</template>
