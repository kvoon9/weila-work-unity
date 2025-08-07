<script setup lang="ts">
import type { RouteRecordNormalized } from 'vue-router'
import type { Corp } from '~/types'
import type { Legal } from '~/types/api'

const router = useRouter()

const { data: corp } = useWeilaFetch<Corp>('corp/org/get-my-org')

const { data: legal } = useWeilaFetch<Legal>('corp/legal/get-legal')

interface Menu {
  [key: string]: {
    name: string
    submenu: RouteRecordNormalized[]
  }
}

const menu = computed<Menu>(() => {
  const data = {
    contact: { name: '通讯录', submenu: [] },
    workbench: { name: '工作台', submenu: [] },
  }
  const routeList = router.getRoutes().filter((i: any) => i?.meta?.name)

  const routeRootRE = /^\/([\w-]+)(\/[\w-]+)*\/?$/

  for (const route of routeList) {
    const matches = route.path.match(routeRootRE)
    if (!matches)
      continue

    const rootKey = matches[1] as keyof Menu
    if (!rootKey)
      continue

    // @ts-expect-error type error
    const menuItem = data?.[rootKey]
    if (!menuItem)
      continue

    menuItem.submenu.push(route)
  }

  return data
})

function goTo(path: string) {
  router.push(path)
}
</script>

<template>
  <div>
    <a-menu
      :default-selected-keys="[router.currentRoute.value.path]"
      :style="{ width: '200px', height: '100%' }"
      auto-open
      @menu-item-click="goTo"
    >
      <a-trigger v-if="corp" position="bl" auto-fit-position :unmount-on-close="false" :popup-translate="[5, 5]" trigger="hover">
        <div cursor-pointer text-neutral-500 px4 py2 hover:bg-neutral-200:50 rounded border mb4 mt2 flex items-center justify-between @click="goTo('/contact/org')">
          <div flex gap-2 items-center>
            <img :src="corp.avatar" :alt="corp.name" rounded-full size-10>
            <div>
              <div font-bold truncate>
                {{ corp.name }}
              </div>
              <a-tag v-if="legal?.state === 8" color="orangered">
                <template #icon>
                  <icon-check-circle-fill />
                </template>
                已认证
              </a-tag>
              <a-tag v-else>
                未认证
              </a-tag>
            </div>
          </div>
          <IconRight />
        </div>
        <template #content>
          <div bg-white border p4 rounded-lg>
            To-dos
          </div>
        </template>
      </a-trigger>
      <a-menu-item key="/contact/org">
        主页
      </a-menu-item>
      <a-sub-menu v-for="{ name, submenu } in menu" :key="name">
        <template #title>
          {{ name }}
        </template>
        <a-menu-item v-for="i in submenu" :key="i.path">
          {{ i.meta.name }}
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </div>
</template>
