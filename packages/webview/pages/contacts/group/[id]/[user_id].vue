<script setup lang="ts">
import type { GroupMemberDeletePayload } from '~/fixture/mock'
import { useMutation } from '@tanstack/vue-query'
import { shallowRef } from 'vue'
import { weilaApiUrl } from '~/plugins/api'

definePageMeta({
  layout: 'back',
})

appHead.value = '群成员详情'

const router = useRouter()
const groupId = useRouteParams('id')
const user_id = useRouteParams('user_id', '0', { transform: Number })

$inspect(user_id)

const { refetch } = useMemberList()

const member = useMember(user_id)

const { $v1 } = useNuxtApp()
const { toast } = useToast()

const isDeleteModalVisible = shallowRef(false)
const { mutate: deleteMember, isPending: isDeleting } = useMutation({
  mutationFn: () => {
    return $v1<never>(
      weilaApiUrl('/corp/web/group-member-delete'),
      {
        body: {
          group_id: Number(groupId.value),
          member_ids: [Number(user_id.value)],
        } as GroupMemberDeletePayload,
      },
    )
  },
  onSuccess() {
    toast({ title: '删除成功' })
    isDeleteModalVisible.value = false
    refetch()
    router.back()
  },
})
</script>

<template>
  <div p4 space-y-8 class="bg-gray-50 min-h-screen">
    <div v-if="member">
      <div mb4 flex="~ col justify-center items-center" space-y-2 class="bg-white rounded-lg p-4 shadow-sm">
        <img :src="member.avatar || ''" :alt="member.name" class="w-16 h-16 rounded-full border-2 border-gray-100 shadow">
        <div font-semibold space-x-2>
          <span>{{ member.name }}</span>
          <span font-normal text-sm border px1 rounded :class="member.online ? 'text-green-500 border-green-500' : 'text-neutral-500 border-neutral-500'">
            {{ member.online ? '在线' : '离线' }}
          </span>
        </div>
      </div>
      <div grid="~ cols-1 md:cols-2 gap-4" text-gray-500 class="bg-white rounded-lg p-4 shadow-sm">
        <div flex items-center class="border-b pb-2">
          <span w-24 flex-shrink-0 font-medium text-gray-600>微喇号</span>
          <span class="truncate flex-1 min-w-0">{{ member.user_num }}</span>
        </div>
        <div flex items-center class="border-b pb-2">
          <span w-24 flex-shrink-0 font-medium text-gray-600>电话</span>
          <span class="truncate flex-1 min-w-0">{{ member.phone }}</span>
        </div>
        <div flex items-center class="border-b pb-2">
          <span w-24 flex-shrink-0 font-medium text-gray-600>部门</span>
          <span class="truncate flex-1 min-w-0">{{ member.dept_name }}</span>
        </div>
        <div flex items-center class="border-b pb-2">
          <span w-24 flex-shrink-0 font-medium text-gray-600>性别</span>
          <span class="flex-1 min-w-0">{{ !member.sex ? '男' : '女' }}</span>
        </div>
        <div flex items-center class="border-b pb-2">
          <span w-24 flex-shrink-0 font-medium text-gray-600>轨迹</span>
          <span class="flex-1 min-w-0">
            <span class="px-2 py-0.5 rounded-full text-xs" :class="member.loc_share ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'">
              {{ member.loc_share ? '开启' : '关闭' }}
            </span>
          </span>
        </div>
        <div flex items-center class="border-b pb-2">
          <span w-24 flex-shrink-0 font-medium text-gray-600>位置共享</span>
          <span class="flex-1 min-w-0">
            <span class="px-2 py-0.5 rounded-full text-xs" :class="member.loc_share ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'">
              {{ member.loc_share ? '开启' : '关闭' }}
            </span>
          </span>
        </div>
        <!-- <div flex items-center class="border-b pb-2">
          <span w-24 flex-shrink-0 font-medium text-gray-600>tts</span>
          <span class="flex-1 min-w-0">
            <span class="px-2 py-0.5 rounded-full text-xs" :class="member.tts ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'">
              {{ member.tts ? '开启' : '关闭' }}
            </span>
          </span>
        </div> -->
        <div flex items-center class="border-b pb-2">
          <span w-24 flex-shrink-0 font-medium text-gray-600>创建时间</span>
          <span class="flex-1 min-w-0">{{ new Date(member.created * 1000).toLocaleDateString() }}</span>
        </div>
      </div>
    </div>

    <DialogRoot>
      <DialogTrigger as-child>
        <button w-full btn as-child class="bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm transition-colors duration-200">
          删除群成员
        </button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay class="backdrop-blur bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
        <DialogContent
          class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg focus:outline-none z-[100]"
        >
          <DialogTitle class="text-mauve12 m-0 text-lg font-semibold">
            删除成员 {{ member?.name }}({{ member?.user_num }})
          </DialogTitle>
          <DialogDescription class="text-mauve11 mt-3 mb-5 text-sm leading-normal">
            您确定要从群组中删除此成员吗？
          </DialogDescription>
          <div flex justify-end space-x-3 mt-6>
            <DialogClose class="btn bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200">
              取消
            </DialogClose>
            <button v-is-loading="isDeleting" type="button" class="btn bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200" @click="() => deleteMember()">
              删除
            </button>
          </div>
          <DialogClose
            class="text-gray-500 hover:text-gray-700 hover:bg-gray-100 absolute top-[10px] right-[10px] inline-flex h-[30px] w-[30px] appearance-none items-center justify-center rounded-full focus:outline-none transition-colors duration-200"
            aria-label="Close"
          >
            <Icon name="lucide:x" />
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>
