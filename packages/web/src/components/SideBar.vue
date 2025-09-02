<script setup lang="ts">
import type { RouteRecordNormalized } from 'vue-router'
import type { VipInfo } from '~/stores/auth'
import type { Corp } from '~/types'
import type { Legal } from '~/types/api'
import { objectEntries, objectKeys } from '@antfu/utils'

const router = useRouter()

const { data: vip } = useWeilaFetch<VipInfo>('corp/org/get-my-vip')

const { t } = useI18n()

const infoMap = {
  num: t('corp-number'),
  member_limit: t('corp.member-limit'),
  dept_limit: t('corp.dept-limit'),
  dept_member_limit: t('corp.dept-member-limit'),
  group_limit: t('corp.group-limit'),
  group_member_limit: t('corp.group-member-limit'),
  device_limit: t('corp.device-limit'),
}

// const supports = computed(() => !vip.value ? {} : Object.groupBy(vip.value?.vip_supports, i => i.name))
// $inspect(supports)

const disabledList = computed(() => vip.value?.vip_supports?.filter(i => !i.support).map(i => i.name) || [])
$inspect(disabledList)

$inspect(disabledList)

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
            <div>
              <div font-bold truncate>
                {{ corp.name }}
              </div>
              <a-tag v-if="legal?.state === 8" color="orangered">
                <template #icon>
                  <icon-check-circle-fill />
                </template>
                {{ $t('auth.certified') }}
              </a-tag>
              <a-tag v-else>
                {{ $t('org.unauth') }}
              </a-tag>
            </div>
          </div>
          <IconRight />
        </div>
        <template #content>
          <div bg-white border p4 rounded-lg space-y-4>
            <a-descriptions
              :column="1"
              :data="[
                { label: t('corp.number'), value: corp?.num },
              ]"
              bordered
            />

            <a-descriptions
              v-if="vip?.vip"
              :column="1"
              :data="[
                { label: t('vip.level'), value: vip?.vip_name },
                { label: t('vip.enable.time'), value: new Date(vip?.vip_created * 1000).toLocaleDateString() },
                { label: t('vip.expired.time'), value: new Date(vip?.vip_expired * 1000).toLocaleDateString() },
              ].filter(i => i && i.value)"
              bordered
            />
            <a-descriptions
              :column="1"
              :data="vip?.vip_supports?.flatMap((i) => {
                const limits = objectKeys(i).filter(i => i.includes('limit'))

                return limits.map(limit => ({
                  // @ts-expect-error type error
                  label: infoMap?.[limit],
                  value: i[limit],
                }))
              })" bordered
            />
          </div>
        </template>
      </a-trigger>
      <a-menu-item key="/contact/org">
        {{ $t('home') }}
      </a-menu-item>
      <a-sub-menu v-for="{ name, submenu } in menu" :key="name">
        <template #title>
          {{ name }}
        </template>
        <a-menu-item v-for="i in submenu" :key="i.path" :disabled="disabledList.find(name => i.path.includes(name))">
          {{ $t(i.meta.name || '') }}
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </div>
</template>
