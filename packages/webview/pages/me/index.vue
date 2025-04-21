<script setup lang="ts">
import type { UserSelfinfoModel } from '~/fixture/mock'
import { shallowRef } from 'vue'
import { weilaApiUrl } from '~/plugins/api'

definePageMeta({
  title: '我的',
  layout: 'home',
})

appHead.value = '我的'

const { logout } = useAuthStore()

const { $v1 } = useNuxtApp()

const { data: user } = useAsyncData(
  'self-info',
  () => $v1<UserSelfinfoModel['data']>(weilaApiUrl('/corp/web/user-selfinfo')),
  {
    transform(data) {
      return data.user
    },
  },
)

const isDeleteLoginRecord = shallowRef(false)
</script>

<template>
  <div relative h-full>
    <OrgCard m2 />
    <div p2 m2 rounded-lg border bg-gradient-to-r from-white to-neutral-50>
      <div relative flex items-center>
        <img :src="user?.avatar || ''" :alt="user?.name || ''" size-12 rounded m2>
        <div>
          <div class="font-semibold leading-loose">
            {{ user?.name }}
          </div>
          <div>
            <div flex items-center space-x-1 text-sm text-gray-500>
              <span>微喇号 {{ user?.num }}</span>
            </div>
            <div flex items-center space-x-1 text-sm text-gray-500>
              <span>绑定手机号 {{ user?.bind_phone }}</span>
            </div>
          </div>
          <!-- <button btn absolute right-0 top-0>
            变更
          </button> -->
        </div>
      </div>
    </div>

    <!-- user info -->

    <NuxtLink to="/me/bind-phone" class="item">
      <Icon name="ph:phone" />
      <span>
        绑定手机号
      </span>
    </NuxtLink>
    <NuxtLink to="/me/change-password" class="item">
      <Icon name="ph:lock" />
      <span>
        修改密码
      </span>
    </NuxtLink>

    <DialogRoot>
      <DialogTrigger as-child>
        <div class="item" color-red>
          <Icon name="ph:sign-out" />
          <span>
            退出登录
          </span>
        </div>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay class="backdrop-blur bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
        <DialogContent
          class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100]"
        >
          <DialogTitle class="text-mauve12 m-0 text-[17px] font-semibold">
            退出登录
          </DialogTitle>
          <DialogDescription class="text-mauve11 mt-[10px] mb-5 text-sm leading-normal">
            确定要退出登录吗？
          </DialogDescription>

          <div flex items-center space-x-2 text-sm>
            <span>删除登录记录</span>
            <input v-model="isDeleteLoginRecord" type="checkbox" class="checkbox">
          </div>

          <div flex justify-end space-x-4 mt-4>
            <DialogClose btn btn-secondary>
              取消
            </DialogClose>
            <DialogClose btn bg-red text-white @click="() => logout(isDeleteLoginRecord)">
              确认
            </DialogClose>
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
</template>

<style scoped>
.item {
  --uno: 'flex items-center space-x-2 p4 border-b';
}
</style>
