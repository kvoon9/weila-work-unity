<script setup lang="ts">
import type { MemberGetallModel } from '~/fixture/mock'
import { toArray } from '@antfu/utils'
import { shallowRef } from 'vue'

definePageMeta({
  layout: 'back',
})

const { data: myBusiness } = useMyBusiness()

// appHead.value = '客服列表'
watchEffect(() => {
  if (myBusiness.value)
    appHead.value = myBusiness.value.merchant.name
})

const route = useRoute('workbench-service-ssid-sid-staff___zh-CN')
const router = useRouter()
const sid = useRouteParams('sid', 0, { transform: Number })

const search = shallowRef(toArray(route.query?.q || '')[0]!)

watch(search, () => {
  router.replace({
    query: {
      ...route.query,
      q: search.value,
    },
  })
})

const { data: _staffList, refetch: refetchStaffList } = useBusinessStaffList({ sid: sid.value })
const staffList = computed(() =>
  _staffList.value
    ?.filter(i => Object.values(i).some(val => String(val).includes(search.value))),
)

const isAddModalVisible = shallowRef(false)
const selectList = shallowRef(new Set<number>())
const { data: members } = useMemberList()

const addableMembers = computed(() => {
  const data: MemberGetallModel['data']['members'][number][] = []
  if (!members.value || !staffList.value)
    return data

  for (const staff of members.value) {
    if (!staffList.value.find?.(i => i.uid === staff.user_id))
      data.push(staff)
  }
  return data
})

const { mutate: addMembers, isPending: isAddingMembers } = useAddBusinessStaffs({
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '添加成员成功' })
    isAddModalVisible.value = false
    selectList.value = new Set()
    refetchStaffList()
  },
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
          <button col-span-1 text-center btn-primary space-x-2>
            <Icon name="ph:user-plus" />
            <span>
              添加客服成员
            </span>
          </button>
        </DialogTrigger>
        <DialogPortal>
          <DialogOverlay class="backdrop-blur bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
          <DialogContent
            class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100]"
          >
            <DialogTitle class="text-mauve12 m-0 text-[17px] font-semibold">
              添加客服成员
            </DialogTitle>
            <DialogDescription class="text-mauve11 mt-[10px] mb-5 text-sm leading-normal">
              添加成员到客服列表
            </DialogDescription>

            <div v-if="!addableMembers.length" class="text-neutral-400 flex items-center space-x-2">
              <Icon name="ph:warning" />
              <span>没有可添加的成员</span>
            </div>
            <div v-else class="h-[200px] rounded-lg border overflow-y-auto">
              <div v-for="staff in addableMembers" :key="staff.user_id" class="space-x-2 py-4 border px-4 flex items-center">
                <input
                  :id="`staff-${staff.user_id}`"
                  type="checkbox"
                  :checked="selectList.has(staff.user_id)"
                  class="w-4 h-4"
                  @change="(e) => {
                    const target = e.target as HTMLInputElement
                    if (target?.checked) {
                      selectList.add(staff.user_id)
                    }
                    else {
                      selectList.delete(staff.user_id)
                    }
                  }"
                >
                <label :for="`staff-${staff.user_id}`" class="space-x-2 flex items-center cursor-pointer">
                  <span>{{ staff.name }}</span>
                  <span class="text-xs border px-1 rounded">{{ staff.user_num }}</span>
                </label>
              </div>
            </div>

            <div flex justify-end space-x-2 mt-4>
              <DialogClose btn btn-secondary>
                取消
              </DialogClose>
              <button
                v-is-loading="isAddingMembers" btn bg-blue-500 text-white @click="() => addMembers({
                  sid,
                  uids: Array.from(selectList),
                })"
              >
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

    <Empty v-if="!staffList?.length" />

    <NuxtLink
      v-for="staff in staffList" :key="staff.uid" class="rounded-lg p-4 space-y-4" border

      :to="`./staff/${staff.uid}/edit`"
      :class="{
        'border-primary-300 bg-primary-100/12': search,
      }"
    >
      <div flex="~ items-center" space-x-2>
        <img :src="staff.avatar || ''" :alt="staff.name" class="w-12 h-12 rounded-full">
        <div>
          <div font-semibold space-x-2>
            {{ staff.name }}
          </div>
          <!-- <div w-fit font-normal text-sm border px1 rounded :class="staff.online ? 'text-green-500 border-green-500' : 'text-neutral-500 border-neutral-500'">
            {{ staff.online ? '在线' : '离线' }}
          </div> -->
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
