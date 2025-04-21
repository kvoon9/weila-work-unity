<script setup lang="ts">
import type { GroupGetallModel, GroupMemberAddModel, GroupMemberAddPayload, GroupMemberGetallModel, GroupMemberGetallPayload } from '~/fixture/mock'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { useToast } from '~/components/ui/toast'
import { weilaApiUrl } from '~/plugins/api'
import Actions from './components/Actions.vue'
import { columns } from './components/DataTable/columns'
import DataTable from './components/DataTable/index.vue'

definePageMeta({
  layout: 'dashboard',
  breadcrumb: [{
    name: '群组管理',
    href: '/groups',
  }],
  name: '',
})

const { $v1 } = useNuxtApp()
const route = useRoute('/groups/:group_id()')

const { data: groups, refetch: refetchGroups } = useGroups()
const group_id = Number(route.params.group_id)
const group = shallowRef<GroupGetallModel['data']['groups'][number] | undefined>(undefined)

const { data: groupMembers, refetch: refetchGroupMembers } = useQuery({
  queryKey: ['group member', group_id],
  queryFn: () => {
    return $v1<GroupMemberGetallModel['data']>(weilaApiUrl('/corp/web/group-member-getall'), {
      body: { group_id } as GroupMemberGetallPayload,
    }).then(i => i.members)
  },
})

const { data: members, refetch: refetchMembers, isPending: isAddMembersPending } = useAllMember()

const addableMembers = computed(() => {
  const data = []
  for (const member of (members.value || [])) {
    if (!groupMembers.value?.find(i => i.user_id === member.user_id))
      data.push(member)
  }
  return data
})

watchEffect(() => {
  group.value = groups.value?.find(group => group.id === group_id)
  if (group.value)
    route.meta.name = group.value?.name
})

const open = shallowRef(false)
const selectList = ref(new Set())
const { mutate: addMembers } = useMutation({
  mutationFn: () => {
    return $v1<GroupMemberAddModel>(weilaApiUrl('/corp/web/group-member-add'), {
      body: {
        group_id,
        member_ids: Array.from(selectList.value),
      } as GroupMemberAddPayload,
    })
  },
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '添加成员成功' })
    open.value = false
    refetch()
  },
})

function refetch() {
  refetchGroups()
  refetchGroupMembers()
  refetchMembers()
}
</script>

<template>
  <div>
    <header class="space-x-2 mb-5">
      <Dialog v-model:open="open">
        <DialogTrigger as-child>
          <Button size="sm">
            <LucidePlus />
            添加群成员
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加群成员</DialogTitle>
            <DialogDescription>
              将成员添加到 <span class="text-neutral-700">{{ group?.name || 'unknown' }}</span>
            </DialogDescription>
          </DialogHeader>

          <div v-if="!addableMembers.length" class="text-neutral-400">
            <Icon name="ph:warning" />
            没有可添加的成员
          </div>
          <ScrollArea v-else class="h-[200px]  rounded-lg border ">
            <div v-for="member in addableMembers" :key="member.user_id" class="space-x-2 py-4 border px-4 flex items-center">
              <Checkbox
                :id="`${member.user_id}`" @update:checked="(select) => {
                  if (select) {
                    selectList.add(member.user_id)
                  }
                  else {
                    selectList.delete(member.user_id)
                  }
                }"
              />
              <Label :for="`${member.user_id}`" class="space-x-2 flex items-center">
                <span>{{ member.name }}</span>
                <Badge variant="outline">
                  {{ member.user_num }}
                </Badge>
                <!-- <span v-if="member.dept_name" class="text-gray-400">({{ member.dept_name }})</span> -->
              </Label>
            </div>
          </ScrollArea>
          <DialogFooter>
            <div class="flex justify-end">
              <Button v-is-loading="isAddMembersPending" @click="addMembers">
                提交
              </Button>
            </div>
          </DialogFooter>
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
              return h(Actions, { item: row.original, onDone: () => refetch() })
            },
          },
          ...columns,
        ]" :data="groupMembers || []"
      />
    </ScrollArea>
  </div>
</template>
