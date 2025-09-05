<script setup lang="ts">
import type { RouteRecordNormalized } from 'vue-router'
import type { VipInfo } from '~/stores/auth'
import type { Corp } from '~/types'
import { objectEntries } from '@antfu/utils'

const router = useRouter()

const { data: vip } = useWeilaFetch<VipInfo>('corp/org/get-my-vip')

const { t } = useI18n()

// const supports = computed(() => !vip.value ? {} : Object.groupBy(vip.value?.vip_supports, i => i.name))
// $inspect(supports)

const disabledList = computed(() => vip.value?.vip_supports?.filter(i => !i.support).map(i => i.name) || [])
$inspect(disabledList)

$inspect(disabledList)

const { data: corp } = useWeilaFetch<Corp>('corp/org/get-my-org')

interface Menu {
  [key: string]: {
    name: string
    submenu: RouteRecordNormalized[]
  }
}

const menu = computed<Menu>(() => {
  const data = {
    contact: { name: t('menu.contact'), submenu: [] },
    workbench: { name: t('menu.workbench'), submenu: [] },
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

const curPath = computed(() => patchPatch(router.currentRoute.value.path))

function patchPatch(path: string) {
  // fix path: /contact/dept-25-测试部门2 --> /contact/dept
  for (const [_, { submenu }] of objectEntries(menu.value)) {
    const matched = submenu.find(i => path.includes(i.path))
    if (matched)
      return matched.path
  }

  return path
}

$inspect(curPath)

function goTo(path: string) {
  router.push(path)
}
</script>

<template>
  <div>
    <a-menu
      :selected-keys="[curPath]"
      :style="{ width: '200px', height: '100%' }"
      auto-open
      @menu-item-click="goTo"
    >
      <a-trigger v-if="corp" position="bl" auto-fit-position :unmount-on-close="true" :popup-translate="[5, 5]" trigger="hover">
        <div cursor-pointer text-neutral-500 px4 py2 hover:bg-neutral-200:50 rounded border mb4 mt2 flex items-center justify-between @click="goTo('/contact/org')">
          <div flex gap-2 items-center>
            <a-image width="40" height="40" :src="corp.avatar" rounded-full size-10 />
            <div font-bold truncate>
              {{ corp.name }}
            </div>
          </div>
          <IconRight />
        </div>
      </a-trigger>
      <a-menu-item key="/contact/org">
        {{ $t('home') }}
      </a-menu-item>
      <a-sub-menu v-for="{ name, submenu } in menu" :key="name">
        <template #title>
          {{ name }}
        </template>
        <a-menu-item v-for="i in submenu" :key="i.path">
          {{ $t(i.meta.name || '') }}
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </div>
</template>
