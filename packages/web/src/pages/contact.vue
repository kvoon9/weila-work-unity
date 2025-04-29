<script setup lang="ts">
import { objectKeys } from '@antfu/utils'
import { ref as deepRef, reactive, shallowRef } from 'vue'
import CreateCorpModal from './contact/components/CreateCorpModal.vue'

definePage({
  alias: ['/'],
  meta: {
    menu: { label: 'menu.contact', order: 1, icon: 'icon-user-group' },
  },
})

const { t } = useI18n()
const router = useRouter()

const corpStore = useCorpStore()
const { refetch } = corpStore
const { data: corp, isSuccess } = storeToRefs(corpStore)

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
    <section relative h-full w60 shrink-0 border-r-1 dark:border-gray-700 bg-base>
      <LoadingMask :open="!isSuccess" />
      <a-menu v-model:selected-keys="selectedKeys" auto-open-selected :default-open-keys="[corp?.name]">
        <button
          v-if="!corp"
          hover="bg-primary-300" bg-primary-400 color-white list-btn
          @click="isCreateCorpModalVisible = true"
        >
          {{ t('corp.create.form.title') }}
        </button>

        <template v-if="corp">
          <a-menu-item v-for="label, path in menus" :key="path" @click="router.push(path)">
            {{ path === '/contact/org' ? corp?.name || t(label) : t(label) }}
          </a-menu-item>
        </template>
      </a-menu>
    </section>
    <section relative h-full w-full of-scroll>
      <RouterView absolute inset-0 />
    </section>
    <CreateCorpModal v-model:open="isCreateCorpModalVisible" @success="refetch" />
  </div>
</template>
