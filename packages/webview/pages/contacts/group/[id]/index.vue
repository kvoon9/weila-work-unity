<script setup lang="ts">
import type { GroupMemberGetallModel, GroupMemberGetallPayload } from '~/fixture/mock'
import { isNumber, isString, toArray } from '@antfu/utils'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { shallowRef } from 'vue'
import { weilaApiUrl } from '~/plugins/api'

definePageMeta({
  layout: 'back',
})

const route = useRoute('contacts-group-id___zh-CN')
const router = useRouter()
const { $v1 } = useNuxtApp()

const groupId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? id : ''
})

const { data: _groupMembers, refetch: refetchGroupMembers } = useQuery({
  queryKey: ['group member', groupId.value],
  queryFn: () => {
    return $v1<GroupMemberGetallModel['data']>(weilaApiUrl('/corp/web/group-member-getall'), {
      body: { group_id: Number(groupId.value) } as GroupMemberGetallPayload,
    }).then(i => i.members)
  },
})

const { data: members } = useMemberList()
const group = useGroup(groupId.value)

const addableMembers = computed(() => {
  const data = []
  for (const member of (members.value || [])) {
    if (!_groupMembers.value?.find(i => i.user_id === member.user_id))
      data.push(member)
  }
  return data
})

const isAddModalVisible = shallowRef(false)
const selectList = shallowRef<Set<number>>(new Set())

const { mutate: addMembers, isPending: isAddingMembers } = useMutation({
  mutationFn: () => {
    return $v1<GroupMemberGetallModel>(weilaApiUrl('/corp/web/group-member-add'), {
      body: {
        group_id: Number(groupId.value),
        member_ids: Array.from(selectList.value),
      },
    })
  },
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '添加成员成功' })
    isAddModalVisible.value = false
    selectList.value = new Set()
    refetchGroupMembers()
  },
})

appHead.value = `${group.value?.name || '群成员'}`

const search = shallowRef(toArray(route.query?.q || '')[0]!)

watch(search, () => {
  router.replace({
    query: {
      ...route.query,
      q: search.value,
    },
  })
})

const filters = [
  (members: GroupMemberGetallModel['data']['members']) => {
    if (!search.value)
      return members

    return members.filter((member) => {
      return Object.values(member).some((value) => {
        if (isNumber(value) || isString(value)) {
          value = String(value)
          return value.toLowerCase().includes(search.value.toLowerCase())
        }
        else {
          return false
        }
      })
    })
  },
]

const groupMembers = computed(() => {
  let result = _groupMembers.value || []
  for (const filter of filters)
    result = filter(result)
  return result
})
</script>

<template>
  <div class="grid gap-4 p-4">
    <div relative flex="~ items-center" border rounded-lg p1>
      <input v-model="search" bg-white type="text" placeholder="部门/微喇号/电话" class="grow-1 p-2" drop-shadow>
      <Icon v-if="search" name="ph:x" :disabled="!search" size-4 mx2 @click="search = ''" />
    </div>
    <div grid="~ cols-2 gap-2">
      <DialogRoot v-model:open="isAddModalVisible">
        <DialogTrigger as-child>
          <button col-span-1 text-center btn-primary>
            添加成员
          </button>
        </DialogTrigger>
        <DialogPortal>
          <DialogOverlay class="backdrop-blur bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
          <DialogContent
            class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100]"
          >
            <DialogTitle class="text-mauve12 m-0 text-[17px] font-semibold">
              添加成员
            </DialogTitle>
            <DialogDescription class="text-mauve11 mt-[10px] mb-5 text-sm leading-normal">
              添加成员到群组 {{ group?.name || '' }}
            </DialogDescription>

            <div v-if="!addableMembers.length" class="text-neutral-400 flex items-center space-x-2">
              <Icon name="ph:warning" />
              <span>没有可添加的成员</span>
            </div>
            <div v-else class="h-[200px] rounded-lg border overflow-y-auto">
              <div v-for="member in addableMembers" :key="member.user_id" class="space-x-2 py-4 border px-4 flex items-center">
                <input
                  :id="`member-${member.user_id}`"
                  type="checkbox"
                  :checked="selectList.has(member.user_id)"
                  class="w-4 h-4"
                  @change="(e) => {
                    const target = e.target as HTMLInputElement
                    if (target?.checked) {
                      selectList.add(member.user_id)
                    }
                    else {
                      selectList.delete(member.user_id)
                    }
                  }"
                >
                <label label :for="`member-${member.user_id}`" class="space-x-2 flex items-center cursor-pointer">
                  <span>{{ member.name }}</span>
                  <span class="text-xs border px-1 rounded">{{ member.user_num }}</span>
                </label>
              </div>
            </div>

            <div flex justify-end space-x-2 mt-4>
              <DialogClose btn btn-secondary>
                取消
              </DialogClose>
              <button v-is-loading="isAddingMembers" btn bg-blue-500 text-white @click.prevent="() => addMembers()">
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
    </div>
    <Empty v-if="groupMembers?.length === 0" />
    <NuxtLink
      v-for="member in groupMembers" :key="member.user_id" :to="`/contacts/group/${groupId}/${member.user_id}`" class="rounded-lg p-4 space-y-4" border
      :class="{
        'border-primary-300 bg-primary-100/12': search,
      }"
      drop-shadow-xl drop-shadow-color-neutral:10
    >
      <div flex="~ items-center" space-x-2>
        <img :src="member.avatar || ''" :alt="member.name" class="w-12 h-12 rounded-full">
        <div>
          <div font-semibold space-x-2>
            {{ member.name }}
          </div>
          <div w-fit font-normal text-sm border px1 rounded :class="member.online ? 'text-green-500 border-green-500' : 'text-neutral-500 border-neutral-500'">
            {{ member.online ? '在线' : '离线' }}
          </div>
        </div>
      </div>
    </NuxtLink>
    <TheTitleRightMenu :routes="route.path">
      <NuxtLink :to="`./${route.params.id}/edit`">
        <Icon name="ph:gear" />
      </NuxtLink>
    </TheTitleRightMenu>
  </div>
</template>
