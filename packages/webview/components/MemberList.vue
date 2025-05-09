<script setup lang="ts">
import type { MemberChangePayload, MemberGetallModel } from '~/fixture/mock'
import { isNumber, isString } from '@antfu/utils'
import { useMutation } from '@tanstack/vue-query'
import { useRouteQuery } from '@vueuse/router'
import { shallowRef } from 'vue'
import { weilaApiUrl } from '~/plugins/api'

const props = defineProps<{
  deptId?: number
}>()

const { $v1 } = useNuxtApp()
const { org_num } = useCorp()

const { data: _members, refetch, devices } = useMemberList()

const { refetch: refetchDepts } = useDeptList()
const search = useRouteQuery('q')
const dept_id = useRouteQuery<string | number | undefined>('dept_id', props.deptId ?? undefined)
const dept = useDept(computed(() => Number(dept_id.value)))

// 添加设备相关的状态
const isAddDeviceModalVisible = shallowRef(false)
const selectedDevices = shallowRef<Set<number>>(new Set())

// 可添加的设备列表
const addableDevices = computed(() => {
  if (!dept_id.value || !devices.value)
    return []

  return devices.value.filter(device => device.dept_id !== Number(dept_id.value))
})

// 添加设备的mutation
const { mutate: addDevices, isPending: isAddingDevices } = useMutation({
  mutationFn: async () => {
    const promises = Array.from(selectedDevices.value).map(deviceId =>
      $v1<MemberGetallModel>(weilaApiUrl('/corp/web/member-change'), {
        body: {
          org_num: org_num.value,
          member_id: deviceId,
          dept_id: Number(dept_id.value),
        } as MemberChangePayload,
      }),
    )
    return Promise.all(promises)
  },
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '添加设备成功' })
    isAddDeviceModalVisible.value = false
    selectedDevices.value = new Set()
    refetch()
    refetchDepts()
  },
})

const members = computed(() => {
  let result = _members.value || []

  if (dept_id.value !== undefined) {
    result = result.filter(member => member.dept_id === Number(dept_id.value))
  }

  if (search.value) {
    result = result.filter((member) => {
      return Object.values(member).some((value) => {
        if (isNumber(value) || isString(value)) {
          value = String(value)
          return value.toLowerCase().includes(String(search.value).toLowerCase())
        }
        else {
          return false
        }
      })
    })
  }

  return result
})

const addableMembers = computed(() => {
  if (!dept_id.value)
    return []

  return (_members.value || []).filter(member => member.dept_id !== Number(dept_id.value))
})

const typeMap = {
  0: '成员',
  1: '设备',
  255: '企业主',
}

const isAddModalVisible = shallowRef(false)
const selectList = shallowRef<Set<number>>(new Set())
const { mutate: addMembers, isPending: isAddingMembers } = useMutation({
  mutationFn: async () => {
    const promises = Array.from(selectList.value).map(memberId =>
      $v1<MemberGetallModel>(weilaApiUrl('/corp/web/member-change'), {
        body: {
          org_num: org_num.value,
          member_id: memberId,
          dept_id: Number(dept_id.value),
        } as MemberChangePayload,
      }),
    )
    return Promise.all(promises)
  },
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '添加成员成功' })
    isAddModalVisible.value = false
    selectList.value = new Set()
    refetch()
    refetchDepts()
  },
})
</script>

<template>
  <div relative class="grid gap-4 p-4">
    <div flex="~ items-center" border rounded-lg p1 bg-white drop-shadow>
      <input v-model="search" type="text" placeholder="部门/微喇号/工号/电话" class="grow-1 p-2" focus:outline-none>
      <Icon v-if="search" name="ph:x" :disabled="!search" size-4 mx2 @click="search = ''" />
    </div>
    <div v-if="!dept" flex space-x-2>
      <NuxtLink to="/contacts/member/create" grow-1 text-center btn-primary space-x-2>
        <Icon name="ph:user-plus" />
        <span>创建成员</span>
      </NuxtLink>
      <NuxtLink to="/contacts/device/add" grow-1 text-center btn-primary space-x-2>
        <Icon name="ph:android-logo" />
        <span>添加设备</span>
      </NuxtLink>
    </div>
    <div v-else-if="dept.id !== 0" grid="~ cols-2 gap-2">
      <DialogRoot v-model:open="isAddModalVisible">
        <DialogTrigger as-child>
          <button text-center btn-primary>
            添加成员
          </button>
        </DialogTrigger>
        <DialogPortal>
          <DialogOverlay class="backdrop-blur bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
          <DialogContent
            class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100]"
          >
            <DialogTitle class="text-mauve12 m-0 text-[17px] font-semibold">
              添加成员到 <span class="text-primary">{{ dept.name }}</span>
            </DialogTitle>
            <DialogDescription class="text-mauve11 mt-[10px] mb-5 text-sm leading-normal">
              请选择要添加的成员
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
                  <span class="text-xs border px-1 rounded">{{ member.dept_name }}</span>
                </label>
              </div>
            </div>

            <div flex justify-end space-x-2 mt-4>
              <DialogClose btn btn-secondary>
                取消
              </DialogClose>
              <button v-if="addableMembers.length" v-is-loading="isAddingMembers" btn bg-blue-500 text-white @click.prevent="() => addMembers()">
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
      <DialogRoot v-model:open="isAddDeviceModalVisible">
        <DialogTrigger as-child>
          <button text-center btn-primary>
            添加设备
          </button>
        </DialogTrigger>
        <DialogPortal>
          <DialogOverlay class="backdrop-blur bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
          <DialogContent
            class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100]"
          >
            <DialogTitle class="text-mauve12 m-0 text-[17px] font-semibold">
              添加设备到 <span class="text-primary">{{ dept.name }}</span>
            </DialogTitle>
            <DialogDescription class="text-mauve11 mt-[10px] mb-5 text-sm leading-normal">
              请选择要添加的设备
            </DialogDescription>

            <div v-if="!addableDevices.length" class="text-neutral-400 flex items-center space-x-2">
              <Icon name="ph:warning" />
              <span>没有可添加的设备</span>
            </div>
            <div v-else class="h-[200px] rounded-lg border overflow-y-auto">
              <div v-for="device in addableDevices" :key="device.user_id" class="space-x-2 py-4 border px-4 flex items-center">
                <input
                  :id="`device-${device.user_id}`"
                  type="checkbox"
                  :checked="selectedDevices.has(device.user_id)"
                  class="w-4 h-4"
                  @change="(e) => {
                    const target = e.target as HTMLInputElement
                    if (target?.checked) {
                      selectedDevices.add(device.user_id)
                    }
                    else {
                      selectedDevices.delete(device.user_id)
                    }
                  }"
                >
                <label label :for="`device-${device.user_id}`" class="space-x-2 flex items-center cursor-pointer">
                  <span>{{ device.name }}</span>
                  <span class="text-xs border px-1 rounded">{{ device.user_num }}</span>
                  <span class="text-xs border px-1 rounded">{{ device.dept_name }}</span>
                </label>
              </div>
            </div>

            <div flex justify-end space-x-2 mt-4>
              <DialogClose btn btn-secondary>
                取消
              </DialogClose>
              <button v-if="addableDevices.length" v-is-loading="isAddingDevices" btn bg-blue-500 text-white @click.prevent="() => addDevices()">
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

    <!-- <div text-sm text-right>
      <span> 在线 <span class="text-primary font-semibold">{{ members?.filter(member => member.online).length || 0 }} / {{ members?.length || 0 }}</span></span>
    </div> -->

    <Empty v-if="members?.length === 0" />
    <NuxtLink
      v-for="member, idx in members" :key="member.user_id"
      :to=" member.type === 1
        ? `/contacts/device/${member.user_id}/edit`
        : `/contacts/member/${member.user_id}/edit`
      "
      class="rounded-lg p-4" border flex="~ justify-between items-center" relative
      :class="{
        'border-primary-300 bg-primary-100/12': search,
      }"
      bg-white drop-shadow-xl drop-shadow-color-neutral:10
    >
      <div absolute top-1 left-1 text-xs text-neutral-300 font-semibold>
        {{ idx + 1 }}
      </div>
      <div flex items-center space-x-3>
        <div relative>
          <img :src="member.avatar || ''" :alt="member.name" class="w-12 h-12 rounded-full">
          <!-- <div
            text-xs absolute bottom--1 h-fit position-x-center break-keep
            btn-outline bg-white px1 space-x-0.5
            bg-op-65
            :class="member.online ? 'border-primary color-primary' : 'border-neutral-500 color-neutral-500'"
          >
            <div class="size-1.5 rounded-full " :class="member.online ? 'bg-primary' : 'bg-neutral-500'" />
            <span>{{ member.online ? '在线' : '离线' }}</span>
          </div> -->
        </div>
        <div>
          <div space-x-2 flex="~ items-center">
            <span font-semibold> {{ member.name }} </span>
            <span tag-primary>{{ typeMap[member.type as keyof typeof typeMap] }}</span>
          </div>

          <div space-x-1>
            <span w-fit font-normal text-sm rounded color-neutral-500 border-neutral-500>{{ member.dept_name }}</span>
          </div>
        </div>
      </div>
      <div flex justify-end space-x-2>
        <!-- <MemberStateToggle v-if="member.type !== 255" :member="member" /> -->
      </div>
    </NuxtLink>
  </div>
</template>
