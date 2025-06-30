<script setup lang="ts">
import { objectKeys } from '@antfu/utils'
import { ref as deepRef, reactive, shallowRef } from 'vue'
import CreateCorpModal from './contact/components/CreateCorpModal.vue'

definePage({
  // alias: ['/'],
  meta: {
    menu: { label: 'menu.contact', order: 1, icon: 'icon-user-group' },
  },
})

const router = useRouter()

const corpStore = useCorpStore()
const { refetch } = corpStore

const isCreateCorpModalVisible = shallowRef(false)

const menus = reactive({
  '/contact/org': 'corp-info',
  '/contact/group': 'submenu.group-manage',
  '/contact/dept': 'submenu.dept-manage',
  '/contact/member': 'submenu.member-manage',
} as const)

const selectedKeys = deepRef<(string | undefined)[]>([])

watch(router.currentRoute, (curRoute) => {
  selectedKeys.value = [objectKeys(menus).find((menu) => {
    return Boolean(curRoute.matched.find((i) => {
      return i.path.includes(menu)
    }))
  })]
}, { immediate: true })
</script>

<template>
  <div h-full flex of-hidden>
    <section relative h-full w-full of-scroll>
      <RouterView absolute inset-0 />
    </section>
    <CreateCorpModal v-model:open="isCreateCorpModalVisible" @success="refetch" />
  </div>
</template>
