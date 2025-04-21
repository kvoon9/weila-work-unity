<script setup lang="ts">
import { objectKeys } from '@antfu/utils'
import { reactive } from 'vue'
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
const { data: corp, isFetching } = storeToRefs(corpStore)

const isCreateCorpModalVisible = ref(false)

const menus = reactive({
  '/contact/org': 'corp-info',
  '/contact/group': 'submenu.group-manage',
  '/contact/dept': 'submenu.dept-manage',
  '/contact/member': 'submenu.member-manage',
} as const)

const selectedKeys = ref<(string | undefined)[]>([])

watch(router.currentRoute, (curRoute) => {
  selectedKeys.value = [objectKeys(menus).find((menu) => {
    return Boolean(curRoute.matched.find((i) => {
      return i.path.includes(menu)
    }))
  })]
}, { immediate: true })
</script>

<template>
  <div h-full flex>
    <section h-full w60 shrink-0 border-r-1 p2 dark:border-gray-700 bg-base>
      <a-skeleton v-if="isFetching" animation>
        <a-space direction="vertical" :style="{ width: '100%' }" size="large">
          <a-skeleton-line :rows="4" />
        </a-space>
      </a-skeleton>
      <a-menu v-else v-model:selected-keys="selectedKeys" auto-open-selected :default-open-keys="[corp?.name]">
        <template v-if="corp">
          <a-menu-item v-for="label, path in menus" :key="path" @click="router.push(path)">
            {{ path === '/contact/org' ? corp?.name || t(label) : t(label) }}
          </a-menu-item>
        </template>
        <button
          v-if="!corp" hover="bg-primary-300" bg-primary color-white list-btn
          @click="isCreateCorpModalVisible = true"
        >
          {{ t('corp.create.form.title') }}
        </button>
      </a-menu>
    </section>
    <section h-full w-full>
      <RouterView h-full w-full />
    </section>
  </div>

  <CreateCorpModal v-model:open="isCreateCorpModalVisible" @success="refetch" />
</template>
