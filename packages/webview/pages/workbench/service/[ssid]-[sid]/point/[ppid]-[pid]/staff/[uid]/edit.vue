<script setup lang="ts">
import type { GetBusinessStaffListModel } from '~/composables/service'
import { ref as deepRef, shallowRef } from 'vue'

definePageMeta({
  layout: 'back',
})

appHead.value = '客服详情'

const uid = useRouteParams('uid', 0, { transform: Number })
const pid = useRouteParams('pid', 0, { transform: Number })

const { toast } = useToast()

const router = useRouter()

const isDeleteModalVisible = shallowRef(false)

const { refetch } = useGetBusinessPointStaffList({ pid: pid.value })

// 定义staff类型
type Staff = GetBusinessStaffListModel['staffs'][0]

// 获取单个客服的数据
const staff = deepRef<Staff | null>(null)
const isLoading = shallowRef(true)

async function fetchStaff() {
  try {
    isLoading.value = true
    const result = await useGetBusinessPointStaffList({ pid: pid.value }).refetch()
    // 确保result.data存在，并从中找到匹配uid的客服
    if (result.data && Array.isArray(result.data)) {
      const currentStaff = result.data.find((s: Staff) => s.uid === uid.value)
      staff.value = currentStaff || null
    }
  }
  catch (error) {
    console.error('获取客服信息失败', error)
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchStaff()
})

// 使用解构并重命名变量以避免lint警告
const { mutate: delStaff, isPending: isDeleting } = useDelBusinessPointStaff({
  onSuccess() {
    toast({ title: '删除成功' })
    isDeleteModalVisible.value = false
    refetch()
    router.back()
  },
})

function handleDelete() {
  delStaff({
    pid: pid.value,
    uid: uid.value,
  })
}
</script>

<template>
  <div p4 space-y-8 class="bg-gray-50 min-h-screen">
    <div v-if="isLoading" class="flex justify-center items-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
    </div>

    <template v-else-if="staff">
      <div mb4 flex="~ col justify-center items-center" space-y-2 class="bg-white rounded-lg p-4 shadow-sm">
        <img :src="staff.avatar || ''" :alt="staff.name" class="w-16 h-16 rounded-full border-2 border-gray-100 shadow">
        <div font-semibold space-x-2>
          <span>{{ staff.name }}</span>
          <!-- <span font-normal text-sm border px1 rounded :class="staff.state === 1 ? 'text-green-500 border-green-500' : 'text-neutral-500 border-neutral-500'">
            {{ staff.state === 1 ? '在线' : '离线' }}
          </span> -->
        </div>
      </div>

      <div grid="~ cols-1 md:cols-2 gap-4" text-gray-500 class="bg-white rounded-lg p-4 shadow-sm">
        <div flex items-center class="border-b pb-2">
          <span w-24 flex-shrink-0 font-medium text-gray-600>微喇号</span>
          <span class="truncate flex-1 min-w-0">{{ staff.num }}</span>
        </div>
        <div flex items-center class="border-b pb-2">
          <span w-24 flex-shrink-0 font-medium text-gray-600>工号</span>
          <span class="truncate flex-1 min-w-0">{{ staff.job_num }}</span>
        </div>
        <div flex items-center class="border-b pb-2">
          <span w-24 flex-shrink-0 font-medium text-gray-600>性别</span>
          <span class="flex-1 min-w-0">{{ staff.sex === 0 ? '男' : '女' }}</span>
        </div>
        <div flex items-center class="border-b pb-2">
          <span w-24 flex-shrink-0 font-medium text-gray-600>状态</span>
          <span class="flex-1 min-w-0">
            <span class="px-2 py-0.5 rounded-full text-xs" :class="staff.state === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'">
              {{ staff.state === 1 ? '在线' : '离线' }}
            </span>
          </span>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="bg-white rounded-lg p-6 text-center shadow-sm">
        <p class="text-gray-500">
          未找到客服信息
        </p>
      </div>
    </template>

    <DialogRoot>
      <DialogTrigger as-child>
        <button w-full btn as-child class="bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm transition-colors duration-200">
          删除客服
        </button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay class="backdrop-blur bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
        <DialogContent
          class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg focus:outline-none z-[100]"
        >
          <DialogTitle class="text-mauve12 m-0 text-lg font-semibold">
            删除客服 {{ staff?.name }}({{ staff?.num }})
          </DialogTitle>
          <DialogDescription class="text-mauve11 mt-3 mb-5 text-sm leading-normal">
            您确定要删除此客服吗？
          </DialogDescription>
          <div flex justify-end space-x-3 mt-6>
            <DialogClose class="btn bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200">
              取消
            </DialogClose>
            <button v-is-loading="isDeleting" type="button" class="btn bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200" @click="handleDelete">
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
